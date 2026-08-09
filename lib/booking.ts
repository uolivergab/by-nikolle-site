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
