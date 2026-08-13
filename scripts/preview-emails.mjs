// Prova local dos dois e-mails do agendamento. NÃO envia e-mail nenhum e não
// vai para produção: só escreve prova-emails.html na raiz do projeto.
//
// POR QUE ELE IMPORTA O CÓDIGO REAL: prova escrita à mão mente no dia em que o
// código muda. Este script chama buildClientEmail e buildLeadEmail de
// lib/emails.ts, então o que aparece na tela é literalmente o que sai no envio.
//
// Rodar com: npm run preview:emails
// (o Node 22.18+ lê .ts direto; lib/emails.ts não tem sintaxe que exija
// transpilação, só tipos, que o Node descarta.)

import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { buildClientEmail, buildLeadEmail } from "../lib/emails.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(root, "prova-emails.html");

// Dados de exemplo. O nome traz < > e & de propósito, para o escape aparecer
// quebrado AQUI e nunca na frente de uma cliente. E "Contact number" vai VAZIO
// de propósito: é a prova de que rótulo e valor somem juntos, sem deixar rótulo
// órfão nem "não informado" em nenhum dos dois e-mails.
const SAMPLE = {
  name: "Sarah <Sunny> Lin & Co.",
  email: "sarah.lin@example.com",
  contact: "",
  interest: "Holistic Facial",
  concern: "Dark spots and uneven tone after summer",
  preferred: "Weekday mornings",
  origin: "mobile",
};

const client = buildClientEmail(SAMPLE);
const lead = buildLeadEmail(SAMPLE);

const escAttr = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const escText = (value) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Cada e-mail é um documento HTML completo, então vive num iframe (srcdoc), que
// é o único jeito de ver a peça isolada do CSS desta página de prova.
const frame = (html, width) =>
  `<iframe class="palco" style="width:${width}px" srcdoc="${escAttr(html)}" title="preview"></iframe>`;

const pair = (title, nota, mail) => `
<section class="faixa">
  <h2>${escText(title)}</h2>
  <p>${nota}</p>
  <p class="assunto"><strong>Assunto:</strong> ${escText(mail.subject)}</p>
</section>
<div class="par">
  <div class="col"><p class="cap">Computador · 560px</p>${frame(mail.html, 560)}</div>
  <div class="col"><p class="cap">Celular · 375px</p>${frame(mail.html, 375)}</div>
</div>
<div class="faixa"><p class="min">Versão em texto puro que viaja junto:</p></div>
<pre class="txt">${escText(mail.text)}</pre>`;

const page = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Prova — os dois e-mails do agendamento (gerada pelo código real)</title>
<style>
  body{margin:0;background:#e4e0da;font-family:Arial,Helvetica,sans-serif;color:#43463d}
  .nota{max-width:1100px;margin:0 auto;padding:48px 24px 0}
  .nota h1{font-family:Georgia,serif;font-size:30px;font-weight:600;margin:0 0 10px}
  .nota p{font-size:14.5px;line-height:1.65;color:#5b5e53;max-width:660px;margin:0 0 10px}
  .faixa{max-width:1100px;margin:0 auto;padding:44px 24px 12px}
  .faixa h2{font-family:Georgia,serif;font-size:21px;margin:0 0 6px}
  .faixa p{font-size:13.5px;line-height:1.6;color:#5b5e53;margin:0 0 6px;max-width:660px}
  .faixa p.min{font-size:12.5px}
  .assunto{font-family:Consolas,monospace;font-size:12.5px}
  .par{max-width:1100px;margin:0 auto;padding:18px 24px 0;display:flex;gap:28px;
       align-items:flex-start;flex-wrap:wrap}
  .col{background:#cfc9c1;padding:10px;border-radius:3px}
  .cap{font-size:10.5px;letter-spacing:.18em;text-transform:uppercase;color:#43463d;
       margin:0 0 8px;font-weight:600}
  .palco{border:0;display:block;background:#f5f0e8;height:520px}
  pre.txt{max-width:1100px;margin:0 auto;white-space:pre-wrap;background:#f7f5f2;
      border:1px solid #cfc9c1;padding:16px 18px;font-family:Consolas,monospace;
      font-size:12px;line-height:1.6;color:#43463d;border-radius:3px}
  .rodape{max-width:1100px;margin:0 auto;padding:44px 24px 90px;font-size:13.5px;
          line-height:1.7;color:#5b5e53}
  .rodape strong{color:#43463d;font-weight:600}
</style>
</head>
<body>

<div class="nota">
  <h1>Os dois e-mails do agendamento</h1>
  <p>Esta página foi GERADA pelo código que envia de verdade
     (<strong>lib/emails.ts</strong>, via <strong>npm run preview:emails</strong>).
     Se o e-mail mudar, esta prova muda junto. Cada mensagem aparece em duas
     larguras: 560px e os <strong>375px</strong> de um celular comum. É a mesma
     peça fluida nas duas, não duas versões.</p>
  <p>O nome de exemplo é <strong>Sarah &lt;Sunny&gt; Lin &amp; Co.</strong> de
     propósito, com sinais de menor e E comercial, para o escape aparecer
     quebrado aqui e não na frente de uma cliente. E o
     <strong>Contact number foi deixado em branco</strong>: repare que o rótulo
     some junto com o valor nos dois e-mails, sem sobrar rótulo órfão.</p>
</div>

${pair(
  "01 · Para a Nikolle (o aviso)",
  "Critério aqui é velocidade de leitura, não beleza: ela abre no meio do expediente. Nome, dia preferido e serviço sobem para o topo e não se repetem embaixo. Sem marca, sem rodapé, porque é e-mail interno. Reply-to = o e-mail da pessoa.",
  client,
)}

${pair(
  "02 · Para quem preencheu (a confirmação)",
  "Aqui o critério é marca. Wordmark em texto, nunca imagem, porque o Outlook bloqueia imagem por padrão e a marca chegaria decapitada no primeiro contato. A copy é a mesma da tela de sucesso do formulário. Reply-to = a caixa da Nikolle.",
  lead,
)}

<div class="rodape">
  <p><strong>Como ler esta prova:</strong> o que está dentro dos quadros é o HTML
     literal do envio, renderizado num iframe isolado. O bloco em fonte
     monoespaçada abaixo de cada par é a versão em texto puro que viaja junto da
     mensagem (mensagem só em HTML pontua pior nos filtros de spam).</p>
</div>

<script>
  // Cada quadro cresce até a altura real da mensagem: altura fixa cortaria uma
  // intenção mais longa e a prova mentiria justo no caso que importa.
  for (const frame of document.querySelectorAll(".palco")) {
    const fit = () => {
      const doc = frame.contentDocument;
      if (!doc) return;
      // Zerar antes de medir é obrigatório: scrollHeight nunca é menor que a
      // altura do próprio quadro, então medir sem colapsar devolve a altura
      // antiga e a mensagem curta fica boiando num campo vazio.
      frame.style.height = "0px";
      // Os 2px de folga evitam a barra de rolagem que nasce quando o quadro
      // fica com a altura EXATA do conteúdo e o arredondamento cai para baixo.
      frame.style.height = doc.documentElement.scrollHeight + 2 + "px";
    };
    frame.addEventListener("load", fit);
    fit();
  }
</script>

</body>
</html>`;

writeFileSync(OUT, page, "utf8");
console.log(`prova-emails.html gerado em ${OUT}`);
