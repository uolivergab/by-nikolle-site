// Rota de agendamento: recebe o formulário e grava numa planilha do Google via
// Apps Script. Nenhuma UI depende dela ainda (o BookingDialog segue montando o
// SMS); esta é a camada de registro que roda em paralelo.
//
// ---------------------------------------------------------------------------
// CONTRATO (fonte de verdade). Cada chave abaixo vira UMA COLUNA da planilha,
// NESTA ORDEM. Mudou aqui, muda no Apps Script e no cabeçalho da planilha:
//
//   name, email, contact, interest, concern, preferred, origin
//
// O corpo do POST também pode trazer dois campos de PROTEÇÃO, que não são
// colunas e nunca são enviados adiante:
//   website   armadilha (honeypot); se vier preenchido, é robô
//   elapsedMs tempo em milissegundos desde a abertura do formulário
// ---------------------------------------------------------------------------

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// As 7 colunas, na ordem do contrato. É esta lista que monta o payload.
const FIELDS = [
  "name",
  "email",
  "contact",
  "interest",
  "concern",
  "preferred",
  "origin",
] as const;

type Field = (typeof FIELDS)[number];
type Payload = Record<Field, string>;

const MAX_FIELD_CHARS = 2000;
// Piso de tempo, NUNCA teto: gente real leva mais de 4s para preencher; robô
// despeja em milissegundos. Quem demora não é penalizado, e quem não manda o
// campo passa normalmente.
const MIN_ELAPSED_MS = 4000;
const SHEET_TIMEOUT_MS = 8000;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX_HITS = 5;

// ---------------------------------------------------------------------------
// Freio por IP. Map em memória do módulo: em serverless cada instância tem o
// seu, e instância nova nasce com o balde vazio. É BEST-EFFORT contra envio
// repetido, não substitui WAF nem rate limit de borda (Vercel/Cloudflare).
// ---------------------------------------------------------------------------
const hits = new Map<string, number[]>();

function rateLimited(ip: string, now: number): boolean {
  // Poda preguiçosa: sem ela o Map cresceria enquanto a instância viver.
  if (hits.size > 500) {
    for (const [key, stamps] of hits) {
      if (stamps.every((t) => now - t > RATE_WINDOW_MS)) hits.delete(key);
    }
  }

  const recent = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (recent.length >= RATE_MAX_HITS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  return false;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

// ---------------------------------------------------------------------------
// Leitura e limpeza do corpo
// ---------------------------------------------------------------------------
function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function clean(value: unknown): string {
  return asText(value).trim().slice(0, MAX_FIELD_CHARS);
}

function asMillis(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

// Checagem simples de propósito: um @, sem espaço, e um ponto no domínio.
// Regex exótica reprova endereço válido, e o custo do falso negativo aqui é
// perder um agendamento.
function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

// ---------------------------------------------------------------------------
// DESTINOS. A regra de sucesso é "algum destino registrou o pedido". Hoje só
// existe a planilha, então sucesso = a planilha gravou. Quando o e-mail entrar,
// ele vira mais um item de DESTINATIONS (e sai de PENDING) e a regra passa a
// ser "planilha gravou OU e-mail saiu" sem tocar no fluxo da rota.
// ---------------------------------------------------------------------------
type Outcome = {
  ok: boolean;
  /** Status HTTP do provedor, quando houve resposta. Só para o log. */
  status?: number;
  /** Corpo ou motivo da falha. Só para o log, nunca para o navegador. */
  detail?: string;
};

type Destination = {
  /** Rótulo que aparece na linha de log. */
  label: string;
  send: (payload: Payload) => Promise<Outcome>;
};

async function sendToSheet(payload: Payload): Promise<Outcome> {
  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) return { ok: false, detail: "SHEET_WEBHOOK_URL ausente" };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SHEET_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // EXPLÍCITO e crítico: o Apps Script responde 302 para um domínio
      // googleusercontent. Quem não segue o redirecionamento conclui que
      // falhou TENDO gravado a linha.
      redirect: "follow",
      body: JSON.stringify({ token: process.env.SHEET_TOKEN ?? "", ...payload }),
      signal: controller.signal,
    });

    const text = await response.text();
    if (!response.ok) {
      return { ok: false, status: response.status, detail: text };
    }

    // Só é sucesso se o próprio Apps Script disser ok:true. HTTP 200 sozinho
    // não prova nada: o Apps Script devolve 200 até quando o token não bate.
    try {
      const parsed: unknown = JSON.parse(text);
      const confirmed =
        typeof parsed === "object" &&
        parsed !== null &&
        (parsed as { ok?: unknown }).ok === true;
      if (confirmed) return { ok: true, status: response.status };
      return { ok: false, status: response.status, detail: text };
    } catch {
      return { ok: false, status: response.status, detail: text };
    }
  } catch (error) {
    // Timeout entra aqui e é tratado como falha da planilha: a resposta ao
    // navegador nunca fica presa esperando o provedor.
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      ok: false,
      detail: aborted
        ? `timeout ${SHEET_TIMEOUT_MS}ms`
        : error instanceof Error
          ? error.message
          : "erro desconhecido",
    };
  } finally {
    clearTimeout(timer);
  }
}

const DESTINATIONS: Destination[] = [{ label: "planilha", send: sendToSheet }];
// Destinos já previstos e ainda não ligados. Aparecem no log como PENDENTE
// para a linha continuar contando a história inteira de cada envio.
const PENDING: string[] = ["email"];

// O corpo devolvido pelo provedor vai para o log; se ele ecoar o e-mail da
// pessoa, o endereço sai daqui mascarado. Token nunca é logado (não sai daqui).
function redact(detail: string, email: string): string {
  const safe = email ? detail.split(email).join("[email]") : detail;
  return safe.replace(/\s+/g, " ").trim().slice(0, 400);
}

// ---------------------------------------------------------------------------
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const raw = (body ?? {}) as Record<string, unknown>;

  // 1. ARMADILHA. Campo invisível preenchido = robô. Devolve 200 de propósito:
  // erro ensina o robô a tentar de novo, sucesso silencioso não.
  if (asText(raw.website).trim() !== "") {
    console.log("[booking] descartado=armadilha");
    return Response.json({ ok: true });
  }

  // 2. PISO DE TEMPO (só piso; ausente segue normalmente).
  const elapsed = asMillis(raw.elapsedMs);
  if (elapsed !== null && elapsed < MIN_ELAPSED_MS) {
    console.log("[booking] descartado=piso elapsedMs=" + elapsed);
    return Response.json({ ok: true });
  }

  // 3. FREIO POR IP.
  if (rateLimited(clientIp(request), Date.now())) {
    return Response.json({ ok: false }, { status: 429 });
  }

  // 4. VALIDAÇÃO: só o e-mail é obrigatório. Todo o resto pode vir vazio (Modo
  // A, sem validação agressiva); string vazia é resposta legítima.
  const email = clean(raw.email);
  if (!validEmail(email)) {
    return Response.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  // 5. Payload na ordem do contrato, aparado e truncado.
  const payload = Object.fromEntries(
    FIELDS.map((field) => [field, field === "email" ? email : clean(raw[field])]),
  ) as Payload;

  // 6. Entrega. Sucesso = algum destino registrou o pedido.
  const results = await Promise.all(
    DESTINATIONS.map(async (destination) => ({
      label: destination.label,
      outcome: await destination.send(payload),
    })),
  );
  const delivered = results.some((result) => result.outcome.ok);

  // LOG DE UMA LINHA em toda requisição processada: é o que transforma "não
  // gravou" em diagnóstico de trinta segundos no log da Vercel.
  console.log(
    `[booking] ${[
      ...results.map((r) => `${r.label}=${r.outcome.ok ? "ok" : "FALHOU"}`),
      ...PENDING.map((label) => `${label}=PENDENTE`),
    ].join(" ")}`,
  );

  // E o porquê da falha, com o status HTTP e o corpo devolvido pelo provedor.
  for (const { label, outcome } of results) {
    if (outcome.ok) continue;
    console.log(
      `[booking] ${label} falhou: status=${outcome.status ?? "sem resposta"} body=${redact(outcome.detail ?? "", email)}`,
    );
  }

  // A mensagem do provedor fica no log do servidor e nunca vai para o
  // navegador: o cliente só precisa saber se o pedido entrou.
  return delivered
    ? Response.json({ ok: true })
    : Response.json({ ok: false }, { status: 502 });
}
