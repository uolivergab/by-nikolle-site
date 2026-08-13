// Rota de agendamento: recebe o formulário e o entrega em DOIS destinos, em
// paralelo. A planilha do Google (via Apps Script) é o ARQUIVO; o e-mail é o
// AVISO. São independentes de propósito: a planilha fora do ar não pode impedir
// a Nikolle de saber que alguém pediu horário, e vice-versa.
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

import { buildClientEmail, buildLeadEmail, type BuiltEmail } from "@/lib/emails";

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
// Vale para os dois destinos: a resposta ao navegador nunca fica presa
// esperando provedor nenhum.
const SEND_TIMEOUT_MS = 8000;
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
// DESTINOS. A regra de sucesso é "algum destino registrou o pedido": a planilha
// gravou OU o e-mail saiu. Erro só quando os dois falham.
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
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);

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
        ? `timeout ${SEND_TIMEOUT_MS}ms`
        : error instanceof Error
          ? error.message
          : "erro desconhecido",
    };
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// DESTINO 2: e-mail, pela API REST do Resend com fetch nativo (sem SDK, sem
// dependência nova). Dois e-mails por envio: o aviso para a Nikolle e a
// confirmação para quem preencheu. O HTML e o texto dos dois vêm de
// lib/emails.ts; aqui só se envia.
// ---------------------------------------------------------------------------
const RESEND_ENDPOINT = "https://api.resend.com/emails";

async function sendOne(
  key: string,
  from: string,
  to: string,
  replyTo: string,
  mail: BuiltEmail,
): Promise<Outcome> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SEND_TIMEOUT_MS);

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject: mail.subject,
        html: mail.html,
        text: mail.text,
        reply_to: replyTo,
      }),
      signal: controller.signal,
    });

    const text = await response.text();
    if (!response.ok) return { ok: false, status: response.status, detail: text };
    return { ok: true, status: response.status };
  } catch (error) {
    const aborted = error instanceof Error && error.name === "AbortError";
    return {
      ok: false,
      detail: aborted
        ? `timeout ${SEND_TIMEOUT_MS}ms`
        : error instanceof Error
          ? error.message
          : "erro desconhecido",
    };
  } finally {
    clearTimeout(timer);
  }
}

async function sendEmails(payload: Payload): Promise<Outcome> {
  const key = process.env.RESEND_API_KEY;
  // O remetente PRECISA bater com o domínio verificado no Resend; endereço de
  // outro domínio volta 403 ou 422 e nenhum dos dois e-mails sai.
  const from = process.env.QUOTE_FROM;
  const client = process.env.CLIENT_EMAIL;
  if (!key) return { ok: false, detail: "RESEND_API_KEY ausente" };
  if (!from) return { ok: false, detail: "QUOTE_FROM ausente" };
  if (!client) return { ok: false, detail: "CLIENT_EMAIL ausente" };

  // REPLY-TO CRUZADO: ela aperta responder e cai na conversa com a pessoa; a
  // pessoa aperta responder e cai na caixa da Nikolle. Ninguém copia endereço.
  const [notice, confirmation] = await Promise.all([
    sendOne(key, from, client, payload.email, buildClientEmail(payload)),
    sendOne(key, from, payload.email, client, buildLeadEmail(payload)),
  ]);

  // O destino conta como sucesso se PELO MENOS UM saiu: a confirmação da pessoa
  // falhar não pode apagar o aviso que já chegou para a Nikolle. Quando só um
  // falha, o motivo ainda vai para o log (o `detail` sobrevive ao ok:true).
  const describe = (outcome: Outcome) =>
    outcome.ok ? "ok" : `status=${outcome.status ?? "sem resposta"} ${outcome.detail ?? ""}`;

  if (notice.ok && confirmation.ok) return { ok: true, status: notice.status };
  const detail = `aviso: ${describe(notice)} | confirmação: ${describe(confirmation)}`;
  if (notice.ok || confirmation.ok) return { ok: true, detail };
  return { ok: false, status: notice.status ?? confirmation.status, detail };
}

const DESTINATIONS: Destination[] = [
  { label: "planilha", send: sendToSheet },
  { label: "email", send: sendEmails },
];

// O corpo devolvido pelo provedor vai para o log; se ele ecoar o e-mail da
// pessoa, o endereço sai daqui mascarado. SHEET_TOKEN e RESEND_API_KEY nunca
// são logados: nenhum dos dois entra em `detail` em lugar nenhum da rota.
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
    `[booking] ${results
      .map((r) => `${r.label}=${r.outcome.ok ? "ok" : "FALHOU"}`)
      .join(" ")}`,
  );

  // E o porquê da falha, com o status HTTP e o corpo devolvido pelo provedor.
  // O e-mail é o destino que pode entregar PELA METADE (são dois envios e um só
  // já vale como sucesso); nesse caso o que ficou pelo caminho vira uma linha
  // "parcial", senão uma confirmação perdida sumiria sem deixar rastro.
  for (const { label, outcome } of results) {
    if (!outcome.ok) {
      console.log(
        `[booking] ${label} falhou: status=${outcome.status ?? "sem resposta"} body=${redact(outcome.detail ?? "", email)}`,
      );
    } else if (outcome.detail) {
      console.log(
        `[booking] ${label} parcial: status=${outcome.status ?? "sem resposta"} body=${redact(outcome.detail, email)}`,
      );
    }
  }

  // A mensagem do provedor fica no log do servidor e nunca vai para o
  // navegador: o cliente só precisa saber se o pedido entrou.
  return delivered
    ? Response.json({ ok: true })
    : Response.json({ ok: false }, { status: 502 });
}
