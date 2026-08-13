// A ação única do site (design.md): abrir o SMS de agendamento.
// Body estruturado (roteiro.md, revisão Nikolle 26/07). Quebras de linha viram
// %0A via encodeURIComponent. NOTA: o caractere ☐ pode não renderizar em todo
// aparelho; testar em iPhone e Android reais antes do go-live (fallback: "( )").
const BOOKING_SMS_BODY = [
  "Hi Nikolle! I'd like to schedule my first visit.",
  "",
  "My name is ______.",
  "",
  "Contact number: ______.",
  "",
  "I'm interested in:",
  "☐ Holistic Facial",
  "☐ Nervous System Reset",
  "",
  "My main concern or intention is: ______.",
  "",
  "My preferred day/time is: ______.",
  "",
  "Thank you! I look forward to my experience with you.",
].join("\n");

// NÚMERO CORRIGIDO 30/07 pela Nikolle: o agendamento vai para o (808) 457-8823.
// O 721-7476 saiu do site inteiro (era o destino antigo do SMS e o 1º telefone
// do footer); ela confirmou que este é o ÚNICO número correto.
export const BOOKING_PHONE_DISPLAY = "(808) 457-8823";
export const BOOKING_PHONE_E164 = "+18084578823";

// Sintaxe ?&body= deliberada (compat iOS/Android; ver design.md, testar nos dois).
export const BOOKING_SMS_HREF = `sms:${BOOKING_PHONE_E164}?&body=${encodeURIComponent(BOOKING_SMS_BODY)}`;

// ---------------------------------------------------------------------------
// Formulário de agendamento (10/08, pedido da Nikolle 09/08: "criar um campo
// de preenchimento visível, como em formulários profissionais"). O formulário
// da página coleta os dados em campos reais e monta o MESMO body estruturado
// já preenchido; campo deixado em branco mantém o "______" para a pessoa
// completar no app, se quiser. Sem backend: a ação única continua o SMS.
// ---------------------------------------------------------------------------
export type BookingFormData = {
  name: string;
  contact: string;
  facial: boolean;
  reset: boolean;
  concern: string;
  preferred: string;
};

const BLANK = "______";
const filled = (value: string) => (value.trim() ? value.trim() : BLANK);
// ☑/☐ seguem o par do body aprovado; mesmo risco de renderização já anotado
// acima (testar em aparelho real; fallback "(x) / ( )").
const box = (checked: boolean) => (checked ? "☑" : "☐");

// O TEXTO da mensagem, em claro. Extraído do href porque a tela de sucesso
// precisa exibir e copiar o mesmo texto: duas versões da mesma mensagem seriam
// duas verdades, e a copy da cliente só pode existir num lugar. O e-mail é
// campo do formulário, NÃO entra aqui (o corpo aprovado não muda).
export function buildBookingSmsBody(data: BookingFormData): string {
  return [
    "Hi Nikolle! I'd like to schedule my first visit.",
    "",
    `My name is ${filled(data.name)}.`,
    "",
    `Contact number: ${filled(data.contact)}.`,
    "",
    "I'm interested in:",
    `${box(data.facial)} Holistic Facial`,
    `${box(data.reset)} Nervous System Reset`,
    "",
    `My main concern or intention is: ${filled(data.concern)}.`,
    "",
    `My preferred day/time is: ${filled(data.preferred)}.`,
    "",
    "Thank you! I look forward to my experience with you.",
  ].join("\n");
}

export function buildBookingSmsHref(data: BookingFormData): string {
  return `sms:${BOOKING_PHONE_E164}?&body=${encodeURIComponent(buildBookingSmsBody(data))}`;
}
