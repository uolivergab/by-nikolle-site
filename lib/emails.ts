// Os DOIS e-mails do agendamento. Funções puras: montam assunto, HTML e texto,
// e não enviam nada (quem envia é app/api/booking/route.ts). Assim o script de
// prova (scripts/preview-emails.mjs) renderiza exatamente o que sai daqui.
//
// ESPECIFICAÇÃO VISUAL: mock-emails-agendamento.html, na raiz do projeto,
// aprovado pelo Gabriel. Estrutura de tabelas, cores, tamanhos e copy saem DELE.
// O mock mostra cada mensagem em duas larguras; a tabela é FLUIDA e o e-mail é
// UM só, então as medidas implementadas são as da coluna de computador (a de
// 375px do mock é a mesma peça com 2px a menos de padding e de corpo).
//
// ---------------------------------------------------------------------------
// POR QUE O HTML É ASSIM (cliente de e-mail não é navegador, nada aqui é gosto):
//   - Layout só em <table>. O Outlook do Windows renderiza com o motor do Word:
//     flex, grid, position e float não existem lá.
//   - Todo estilo inline. O Gmail remove <style> do head e classes.
//   - Zero webfont. Georgia/Times para leitura, Arial/Helvetica para rótulos.
//   - Zero imagem. O wordmark "by Nikolle" é TEXTO com letter-spacing, porque o
//     Outlook bloqueia imagem por padrão e a marca chegaria decapitada.
//   - Fundo no <td> com o atributo bgcolor E o style (o Outlook ignora
//     background em div).
//   - Largura FLUIDA (width="100%" + max-width:520px). Largura fixa em pixel faz
//     o Gmail encolher a mensagem inteira num aparelho de 375px.
//   - Filete é uma TABELINHA com <td height="1" bgcolor>, porque borda em td
//     vazio some no Outlook.
// ---------------------------------------------------------------------------

/** Os 7 campos do contrato da rota. */
export type BookingEmailData = {
  name: string;
  email: string;
  contact: string;
  interest: string;
  concern: string;
  preferred: string;
  origin: string;
};

export type BuiltEmail = {
  subject: string;
  html: string;
  text: string;
};

// Cores do mock (as mesmas da paleta do site, em hex literal porque e-mail não
// tem custom property: o Outlook não resolve var()).
const INK = "#43463d";
const INK_SOFT = "#5b5e53";
const LINEN = "#f5f0e8";
const SAND = "#e9ded2";
const SAGE = "#7b8367";
const OLIVE = "#5e6646";
const RULE = "#d8cdbc";
const WHITE = "#ffffff";

const SERIF = "Georgia,'Times New Roman',serif";
const SANS = "Arial,Helvetica,sans-serif";

// ---------------------------------------------------------------------------
// ESCAPE. Vale para 100% dos valores digitados pela pessoa, em TODOS os campos.
// O nome de exemplo do mock é "Sarah <Sunny> Lin & Co." exatamente para isso
// aparecer quebrado na prova e nunca na frente de uma cliente.
// ---------------------------------------------------------------------------
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Assunto vive numa linha só: quebra de linha em cabeçalho de e-mail é vetor de
// injeção e, na melhor das hipóteses, assunto truncado.
function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

const has = (value: string) => value.trim() !== "";

// Documento completo. O viewport e os dois metas de esquema de cor evitam que o
// modo escuro do cliente inverta o linho e apague o grafite.
function document_(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${LINEN};">
${body}
</body>
</html>`;
}

// Casca: campo de linho ocupando a caixa de entrada inteira, com a peça de no
// máximo 520px centrada dentro.
function shell(padding: string, rows: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;background-color:${LINEN};">
<tr><td align="center" bgcolor="#F5F0E8" style="background-color:${LINEN};padding:${padding};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:520px;border-collapse:collapse;">
${rows}
</table>
</td></tr></table>`;
}

/** Filete de largura cheia, dentro de uma célula com o padding lateral da peça. */
function rule(padding: string): string {
  return `<tr><td bgcolor="#FFFFFF" style="background-color:${WHITE};padding:${padding};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
<tr><td height="1" bgcolor="#D8CDBC" style="background-color:${RULE};height:1px;line-height:1px;font-size:0;">&nbsp;</td></tr>
</table>
</td></tr>`;
}

// ---------------------------------------------------------------------------
// 01 · PARA A NIKOLLE (o aviso). Critério: velocidade de leitura, não beleza.
// Nome, dia preferido e serviço sobem para o topo e NÃO se repetem na lista.
// Campo vazio some com o rótulo junto: rótulo órfão e "não informado" são ruído
// numa peça que ela abre no meio do expediente. Sem wordmark e sem rodapé,
// porque é e-mail interno.
// ---------------------------------------------------------------------------

// A ordem da lista é a do mock. O que já subiu para o topo (name, preferred,
// interest) não entra aqui.
const CLIENT_FIELDS: Array<{
  key: "email" | "contact" | "concern";
  label: string;
  /** A intenção da pessoa é a voz dela: vai em serifa, como no mock. */
  serif: boolean;
}> = [
  { key: "email", label: "Email", serif: false },
  { key: "contact", label: "Contact number", serif: false },
  { key: "concern", label: "Main concern or intention", serif: false },
];

// A intenção é o único valor em serifa (mock, linha do "Main concern").
const SERIF_VALUE_KEY = "concern";

// A faixa de areia do fim depende de onde a pessoa preencheu: no celular o SMS
// dela pode chegar antes deste e-mail, no computador não vem texto nenhum.
// Origem desconhecida não inventa faixa (a linha é ferramenta de trabalho dela,
// e informação errada aqui é pior que informação ausente).
function originNote(origin: string): string {
  if (origin === "mobile") {
    return "Sent from a phone. Her text may already be in your messages.";
  }
  if (origin === "desktop") {
    return "Sent from a computer. No text will follow.";
  }
  return "";
}

export function buildClientEmail(data: BookingEmailData): BuiltEmail {
  const name = data.name.trim();
  const email = data.email.trim();
  const preferred = data.preferred.trim();
  const interest = data.interest.trim();
  const note = originNote(data.origin.trim());

  // Assunto: o que ela precisa saber antes de abrir. Sem dia preferido, o
  // separador some junto; sem nome, o endereço da pessoa ocupa o lugar dele.
  const who = name || email;
  const subject = oneLine(
    preferred
      ? `Booking request · ${preferred} · ${who}`
      : `Booking request · ${who}`,
  );

  // ---- HTML ----
  const rows: string[] = [];

  rows.push(
    `<tr><td bgcolor="#43463D" style="background-color:${INK};padding:11px 20px;font-family:${SANS};font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:${LINEN};">New booking request</td></tr>`,
  );

  rows.push(
    `<tr><td bgcolor="#FFFFFF" style="background-color:${WHITE};padding:26px 20px 6px;font-family:${SERIF};font-size:25px;line-height:1.25;color:${INK};">${esc(name || "New booking request")}</td></tr>`,
  );

  // Dia preferido e serviço na mesma linha; com um só, o ponto médio some.
  const topLine = [preferred, interest].filter(has);
  if (topLine.length > 0) {
    rows.push(
      `<tr><td bgcolor="#FFFFFF" style="background-color:${WHITE};padding:0 20px 18px;font-family:${SANS};font-size:14px;line-height:1.6;color:${INK_SOFT};">${topLine
        .map(esc)
        .join(" &nbsp;·&nbsp; ")}</td></tr>`,
    );
  }

  rows.push(rule("0 20px"));

  const present = CLIENT_FIELDS.filter((field) => has(data[field.key]));
  present.forEach((field, index) => {
    // O primeiro rótulo abre a lista (16px acima do filete); o último valor
    // fecha com o respiro maior antes da faixa de areia.
    const labelPad = index === 0 ? "16px 20px 4px" : "0 20px 4px";
    const valuePad = index === present.length - 1 ? "0 20px 20px" : "0 20px 12px";
    const serif = field.key === SERIF_VALUE_KEY;
    rows.push(
      `<tr><td bgcolor="#FFFFFF" style="background-color:${WHITE};padding:${labelPad};font-family:${SANS};font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:${INK_SOFT};">${field.label}</td></tr>`,
    );
    rows.push(
      `<tr><td bgcolor="#FFFFFF" style="background-color:${WHITE};padding:${valuePad};font-family:${serif ? SERIF : SANS};font-size:15px;line-height:${serif ? "1.6" : "1.5"};color:${INK};">${esc(data[field.key].trim())}</td></tr>`,
    );
  });

  if (note) {
    rows.push(
      `<tr><td bgcolor="#E9DED2" style="background-color:${SAND};padding:13px 20px;font-family:${SANS};font-size:13px;line-height:1.55;color:${INK};">${note}</td></tr>`,
    );
  }

  rows.push(
    `<tr><td bgcolor="#FFFFFF" style="background-color:${WHITE};padding:14px 20px 22px;font-family:${SANS};font-size:12.5px;line-height:1.55;color:${INK_SOFT};">Reply to this email and it goes straight to her.</td></tr>`,
  );

  const html = document_("New booking request", shell("20px 12px", rows.join("\n")));

  // ---- TEXTO PURO ----
  // Viaja sempre junto do HTML: mensagem só em HTML pontua pior nos filtros de
  // spam. As mesmas omissões do HTML valem aqui.
  const lines: string[] = ["NEW BOOKING REQUEST", ""];
  // Sem nome, a linha do título sairia repetindo o cabeçalho acima palavra por
  // palavra (no HTML os dois são peças visuais distintas; aqui seriam iguais).
  if (name) lines.push(name);
  if (topLine.length > 0) lines.push(topLine.join(" - "));
  lines.push("");
  for (const field of present) {
    lines.push(`${field.label}: ${data[field.key].trim()}`);
  }
  lines.push("");
  if (note) lines.push(note);
  lines.push("Reply to this email and it goes straight to her.");

  return { subject, html, text: lines.join("\n") };
}

// ---------------------------------------------------------------------------
// 02 · PARA QUEM PREENCHEU (a confirmação). Critério: marca. A copy é a mesma
// da tela de sucesso do formulário, para o site e o e-mail dizerem a mesma
// coisa. O bloco "What you sent" repete o que ela enviou, com os campos vazios
// omitidos (o e-mail dela não entra: ela sabe o próprio endereço, e a peça
// chegou nele).
// ---------------------------------------------------------------------------

const LEAD_RECAP: Array<keyof BookingEmailData> = [
  "name",
  "contact",
  "interest",
  "concern",
  "preferred",
];

export function buildLeadEmail(data: BookingEmailData): BuiltEmail {
  const recap = LEAD_RECAP.map((key) => data[key].trim()).filter(has);

  const rows: string[] = [];

  // Wordmark em TEXTO. Ver a nota do topo do arquivo: imagem chegaria bloqueada.
  rows.push(
    `<tr><td bgcolor="#FFFFFF" align="center" style="background-color:${WHITE};padding:34px 28px 0;font-family:${SERIF};font-size:22px;letter-spacing:.16em;text-transform:uppercase;color:${INK};">by Nikolle</td></tr>`,
  );
  rows.push(
    `<tr><td bgcolor="#FFFFFF" align="center" style="background-color:${WHITE};padding:9px 28px 0;font-family:${SANS};font-size:9.5px;letter-spacing:.26em;text-transform:uppercase;color:${INK_SOFT};">Skin &nbsp;·&nbsp; Nourishment &nbsp;·&nbsp; Balance</td></tr>`,
  );
  // Linha d'água curta (a forma-assinatura da marca), em tabelinha própria.
  rows.push(
    `<tr><td bgcolor="#FFFFFF" align="center" style="background-color:${WHITE};padding:20px 28px 0;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
<tr><td width="48" height="1" bgcolor="#7B8367" style="background-color:${SAGE};width:48px;height:1px;line-height:1px;font-size:0;">&nbsp;</td></tr>
</table>
</td></tr>`,
  );
  rows.push(
    `<tr><td bgcolor="#FFFFFF" style="background-color:${WHITE};padding:26px 28px 0;font-family:${SERIF};font-size:24px;line-height:1.3;color:${INK};">Your request is with me</td></tr>`,
  );
  rows.push(
    `<tr><td bgcolor="#FFFFFF" style="background-color:${WHITE};padding:10px 28px 0;font-family:${SERIF};font-style:italic;font-size:17px;line-height:1.5;color:${OLIVE};">I&#39;ll be in touch shortly.</td></tr>`,
  );
  // Sem o recap, esta vira a última linha branca e precisa fechar o respiro que
  // seria do bloco de areia, senão o rodapé oliva encosta no texto.
  rows.push(
    `<tr><td bgcolor="#FFFFFF" style="background-color:${WHITE};padding:18px 28px ${recap.length > 0 ? "0" : "30px"};font-family:${SANS};font-size:14.5px;line-height:1.7;color:${INK_SOFT};">If you&#39;d like to reach me directly, text me at (808) 457-8823.</td></tr>`,
  );

  if (recap.length > 0) {
    rows.push(
      `<tr><td bgcolor="#FFFFFF" style="background-color:${WHITE};padding:24px 28px 4px;font-family:${SANS};font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:${INK_SOFT};">What you sent</td></tr>`,
    );
    rows.push(
      `<tr><td bgcolor="#FFFFFF" style="background-color:${WHITE};padding:0 28px 26px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;border-collapse:collapse;">
<tr><td bgcolor="#F5F0E8" style="background-color:${LINEN};padding:16px 18px;font-family:${SERIF};font-size:14.5px;line-height:1.75;color:${INK};">
${recap.map(esc).join("<br>\n")}
</td></tr>
</table>
</td></tr>`,
    );
  }

  rows.push(
    `<tr><td bgcolor="#5E6646" align="center" style="background-color:${OLIVE};padding:18px 28px;font-family:${SANS};font-size:12px;line-height:1.7;color:${LINEN};">bynikolle.com &nbsp;·&nbsp; @by_nikolle_snb<br>Moa Wellness Center, Kaka&#699;ako</td></tr>`,
  );

  const html = document_(
    "Your request is with me",
    shell("26px 12px", rows.join("\n")),
  );

  const lines: string[] = [
    "BY NIKOLLE",
    "Skin - Nourishment - Balance",
    "",
    "YOUR REQUEST IS WITH ME",
    "I'll be in touch shortly.",
    "",
    "If you'd like to reach me directly, text me at (808) 457-8823.",
  ];
  if (recap.length > 0) {
    lines.push("", "WHAT YOU SENT", ...recap);
  }
  lines.push("", "bynikolle.com - @by_nikolle_snb", "Moa Wellness Center, Kaka'ako");

  return {
    subject: "Your request is with me",
    html,
    text: lines.join("\n"),
  };
}
