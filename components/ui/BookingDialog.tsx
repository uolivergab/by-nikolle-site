"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TideButton } from "@/components/ui/TideButton";
import { cn } from "@/lib/utils";
import {
  BOOKING_PHONE_DISPLAY,
  buildBookingSmsBody,
  buildBookingSmsHref,
  type BookingFormData,
} from "@/lib/booking";

// Formulário de agendamento (10/08) — resposta ao pedido da Nikolle (09/08):
// "a pessoa escreve no espaço p preencher os dados e a linha vai se
// movimentando... criar um campo de preenchimento visível (como em formulários
// profissionais)". A recomendação já registrada no design.md: um formulário na
// própria página que COLETA os dados em campos reais e monta o SMS já
// preenchido no clique.
//
// LIGADO À ROTA (12/08): o mesmo envio agora também grava em app/api/booking.
// O corpo do SMS aprovado pela cliente NÃO MUDOU: o e-mail é campo novo, vai
// para a planilha e para o e-mail de confirmação, e não entra no texto.
//
// TODOS os rótulos visíveis são strings do roteiro.md (o corpo do SMS aprovado
// e o rótulo Book My Consultation): "My name is", "Contact number",
// "I'm interested in" + "Holistic Facial" / "Nervous System Reset",
// "My main concern or intention is", "My preferred day/time is", e a abertura
// "Hi Nikolle! I'd like to schedule my first visit." como primeira linha da
// carta. As strings do campo de e-mail e das telas de sucesso e de erro são as
// aprovadas pelo Gabriel junto do mock desta passada.
//
// Um único diálogo por página (montado no page.tsx). Os CTAs de agendamento
// abrem por openBookingDialog() (CustomEvent), sem prop-drilling. Obrigações
// de modal iguais às do WelcomeGift: aria-modal, foco preso e devolvido, Esc,
// véu clicável, rolagem travada. MODO A: sem urgência e sem validação
// agressiva. O e-mail é o ÚNICO campo obrigatório (é o endereço da
// confirmação); todo o resto a pessoa manda como quiser.

const OPEN_EVENT = "bn:booking-open";
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Mesma checagem simples da rota: um @, sem espaço, e um ponto no domínio.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A MESMA URL do Footer (components/sections/Footer.tsx). Um endereço só.
const INSTAGRAM_URL = "https://www.instagram.com/by_nikolle_snb";

export function openBookingDialog() {
  window.dispatchEvent(new CustomEvent(OPEN_EVENT));
}

const EMPTY: BookingFormData = {
  name: "",
  contact: "",
  facial: false,
  reset: false,
  concern: "",
  preferred: "",
};

type View = "form" | "success" | "error";

// Material dos campos: um passo de branco sobre o linho, borda sage, raio 2px
// (o raio do papel/botão da casa). O foco escurece a borda para olive.
const FIELD =
  "w-full rounded-[2px] border border-sage/45 bg-[color-mix(in_srgb,white_55%,var(--linen))] px-3.5 py-3 text-[15px] leading-normal text-graphite transition-colors duration-200 focus:border-olive focus:outline-none focus-visible:border-olive";
const LABEL = "mb-2 block text-[11px] uppercase tracking-[0.2em] text-graphite-soft";
// Botão secundário das telas de desfecho: fio sage, sem preenchimento, 44px.
const SECONDARY =
  "focus-ripple inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-[2px] border border-sage/60 px-5 py-3 font-sans text-[11.5px] leading-[normal] tracking-[0.14em] text-graphite uppercase transition-colors duration-200 hover:border-olive hover:text-olive";

// Detecção de celular. O segundo termo pega o iPad recente, que se apresenta
// como Mac e só se entrega pelos pontos de toque.
function isHandheld(): boolean {
  return (
    /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Mac/i.test(navigator.userAgent))
  );
}

// Navegador embutido de app: é onde o link da bio do Instagram abre (WKWebView
// no iOS, WebView no Android). MEDIDO EM PRODUÇÃO (03/09): esses navegadores
// BLOQUEIAM o esquema sms:, e a tentativa devolve o erro nativo "This link
// cannot be loaded" na cara da pessoa. Pelo Safari o mesmo link funciona. Por
// isso aqui o envio segue o caminho do computador, que não depende do app de
// mensagens: a rota é quem confirma.
function isInAppBrowser(): boolean {
  const ua = navigator.userAgent;
  return /Instagram|FBAN|FBAV|FB_IAB|Messenger|LinkedInApp|Twitter|TikTok|Snapchat|Pinterest|Line\//i.test(
    ua,
  );
}

export function BookingDialog() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("form");
  const [data, setData] = useState<BookingFormData>(EMPTY);
  // O e-mail vive fora do BookingFormData de propósito: aquele tipo é o corpo
  // do SMS aprovado, e o e-mail não entra no SMS.
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const websiteRef = useRef<HTMLInputElement>(null);
  const openedAtRef = useRef(0);
  const copiedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Abre pelo evento global (qualquer CTA de agendamento dispara). O estado
  // zera aqui, na ABERTURA, e não no fechamento: zerar ao fechar faria a tela
  // de sucesso piscar de volta como formulário durante o fade de saída. O
  // efeito pedido é o mesmo, a segunda abertura nunca mostra a anterior.
  useEffect(() => {
    const onOpen = () => {
      setView("form");
      setData(EMPTY);
      setEmail("");
      setEmailError(false);
      setSending(false);
      setCopied(false);
      // O relógio da proteção antirrobô começa a contar aqui.
      openedAtRef.current = Date.now();
      setOpen(true);
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  // Obrigações de diálogo modal: trava a rolagem, leva o foco para dentro,
  // prende o Tab no painel, fecha no Esc e devolve o foco de onde veio.
  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current
      ?.querySelector<HTMLElement>("[data-autofocus]")
      ?.focus({ preventScroll: true });

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
      restoreFocusRef.current?.focus?.({ preventScroll: true });
    };
  }, [open]);

  // O desfecho chega com o foco: o título das telas de sucesso e de erro
  // recebe o cursor de leitura. O foco vai numa REF DE CALLBACK, não num
  // efeito por `view`: quando o estado muda, o AnimatePresence ainda está
  // tirando o formulário e o título nem existe (medido: o efeito rodava com a
  // ref em null e o foco nunca chegava). A ref estável garante uma chamada só,
  // na montagem, sem roubar o foco a cada render.
  const focusHeading = useCallback((node: HTMLHeadingElement | null) => {
    node?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    return () => {
      if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
    };
  }, []);

  const set =
    (key: keyof BookingFormData) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
      const target = event.target;
      setData((prev) => ({
        ...prev,
        [key]:
          target instanceof HTMLInputElement && target.type === "checkbox"
            ? target.checked
            : target.value,
      }));
    };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (sending) return;

    const address = email.trim();
    if (!EMAIL_RE.test(address)) {
      setEmailError(true);
      emailRef.current?.focus();
      return;
    }

    const handheld = isHandheld();
    const inApp = isInAppBrowser();
    // O sms: só é TENTADO onde ele de fato abre o app de mensagens: celular de
    // verdade E fora do navegador embutido. Fora disso, o caminho é o mesmo do
    // computador, que já existe e já está aprovado.
    const podeAbrirSms = handheld && !inApp;
    // CONTRATO da rota (app/api/booking/route.ts), nomes idênticos e nesta
    // ordem: cada chave é uma coluna da planilha.
    const payload = {
      name: data.name,
      email: address,
      contact: data.contact,
      interest: [
        ...(data.facial ? ["Holistic Facial"] : []),
        ...(data.reset ? ["Nervous System Reset"] : []),
      ].join(" + "),
      concern: data.concern,
      preferred: data.preferred,
      // Terceiro valor, "in-app": quem chegou pelo navegador embutido NÃO
      // dispara o SMS, e a Nikolle precisa saber disso para não ficar
      // esperando um texto que não vem.
      origin: inApp ? "in-app" : handheld ? "mobile" : "desktop",
      website: websiteRef.current?.value ?? "",
      elapsedMs: Date.now() - openedAtRef.current,
    };

    const post = (extra?: RequestInit) =>
      fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        ...extra,
      });

    if (podeAbrirSms) {
      // ORDEM CRÍTICA. A navegação para o sms: tem que sair no MESMO gesto do
      // usuário: qualquer await antes dela e o Safari entende que a abertura
      // não veio de um clique e bloqueia. Por isso o registro vai depois, sem
      // await, e com keepalive para a requisição sobreviver à página perder o
      // foco para o app de mensagens.
      window.location.href = buildBookingSmsHref(data);
      void post({ keepalive: true }).catch(() => {});
      setView("success");
      return;
    }

    // No computador o sms: não faz nada, e no navegador embutido ele é
    // bloqueado. Nos dois casos quem confirma é a rota.
    setSending(true);
    post()
      .then((response) => setView(response.ok ? "success" : "error"))
      .catch(() => setView("error"))
      .finally(() => setSending(false));
  };

  const copyMessage = () => {
    navigator.clipboard
      ?.writeText(buildBookingSmsBody(data))
      .then(() => {
        setCopied(true);
        if (copiedTimerRef.current) clearTimeout(copiedTimerRef.current);
        copiedTimerRef.current = setTimeout(() => setCopied(false), 2400);
      })
      .catch(() => {
        // Sem área de transferência (contexto inseguro, permissão negada): a
        // mensagem está à vista no painel e a pessoa seleciona à mão.
      });
  };

  // Os três blocos abaixo são FUNÇÕES que devolvem JSX, não componentes
  // declarados aqui dentro: componente redeclarado a cada render é um tipo
  // novo para o React, e a subárvore remontaria a cada mudança de estado (a
  // linha d'água do card recomeçaria a cada clique em Copy message).

  // Título das telas de desfecho: caixa alta só no visual, texto real no
  // sr-only (mesmo device do resto do site).
  const heading = (text: string, extra?: string) => (
    <h2
      id="booking-dialog-title"
      ref={focusHeading}
      tabIndex={-1}
      className={cn(
        "pr-8 font-display text-[clamp(23px,4.2vw,29px)] leading-[1.16] text-graphite outline-none",
        extra,
      )}
    >
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="font-[550] tracking-[0.03em] uppercase">
        {text}
      </span>
    </h2>
  );

  // A saída de emergência das duas telas de desfecho: o número em card pedra.
  const phoneCard = () => (
    <div className="relative mt-7 overflow-hidden rounded-[2px] bg-sand px-5 py-4">
      <p className="text-[11px] leading-[normal] tracking-[0.22em] text-graphite-soft uppercase">
        Text to book
      </p>
      <p className="mt-1.5 font-display text-[26px] leading-[1.2] text-graphite">
        {BOOKING_PHONE_DISPLAY}
      </p>
      {/* Linha d'água na base do card (forma-assinatura). */}
      <motion.span
        aria-hidden="true"
        initial={{ scaleX: reduced ? 1 : 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 0.9, ease: EASE, delay: reduced ? 0 : 0.3 }}
        className="absolute inset-x-0 bottom-0 h-px origin-center bg-sage"
      />
    </div>
  );

  const instagramLink = () => (
    <a
      href={INSTAGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={SECONDARY}
    >
      Instagram
    </a>
  );

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 min-[561px]:p-8">
          {/* Véu: grafite translúcido, discreto. Clique fecha. */}
          <motion.button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.2 : 0.45, ease: EASE }}
            className="absolute inset-0 cursor-default bg-[color-mix(in_srgb,var(--graphite)_46%,transparent)] backdrop-blur-[2px]"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-dialog-title"
            initial={{ opacity: 0, y: reduced ? 0 : 20, scale: reduced ? 1 : 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 0, scale: 1 }}
            transition={{ duration: reduced ? 0.3 : 0.65, ease: EASE }}
            className="relative max-h-[min(92svh,780px)] w-full max-w-[600px] overflow-y-auto rounded-[4px] border border-olive/20 bg-linen px-6 pt-9 pb-7 shadow-[0_28px_80px_-24px_color-mix(in_srgb,var(--graphite)_42%,transparent)] min-[561px]:px-10 min-[561px]:pt-11 min-[561px]:pb-10"
          >
            {/* Linha d'água que se desenha no topo (forma-assinatura). */}
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: reduced ? 1 : 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.95, ease: EASE, delay: reduced ? 0 : 0.35 }}
              className="absolute inset-x-0 top-0 z-[2] h-px origin-center bg-sage"
            />

            <button
              type="button"
              data-autofocus
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="focus-ripple absolute top-2 right-2 z-[3] flex h-11 w-11 items-center justify-center rounded-[2px] text-graphite-soft transition-colors hover:text-olive"
            >
              <svg
                width="13"
                height="13"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M1.5 1.5 L10.5 10.5 M10.5 1.5 L1.5 10.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            </button>

            {/* A troca formulário -> desfecho acontece dentro do mesmo painel. */}
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                initial={{ opacity: 0, y: reduced ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: reduced ? 0 : -6 }}
                transition={{ duration: reduced ? 0.18 : 0.34, ease: EASE }}
              >
                {view === "form" && (
                  <>
                    <h2
                      id="booking-dialog-title"
                      className="pr-8 font-display text-[clamp(23px,4.2vw,29px)] leading-[1.16] text-graphite"
                    >
                      <span className="sr-only">Book My Consultation</span>
                      <span
                        aria-hidden="true"
                        className="font-[550] tracking-[0.03em] uppercase"
                      >
                        Book My Consultation
                      </span>
                    </h2>

                    {/* A primeira linha da carta (abertura do SMS aprovado). */}
                    <p className="mt-3 font-voice text-[17px] font-medium text-sage italic">
                      {"Hi Nikolle! I'd like to schedule my first visit."}
                    </p>

                    <form onSubmit={onSubmit} className="mt-7">
                      {/* ARMADILHA: invisível para gente, atraente para robô.
                          Fora da tela (e não display:none, que muito robô já
                          sabe ignorar), fora da tabulação e do leitor de tela.
                          Vai no POST como "website"; a rota decide. */}
                      <input
                        ref={websiteRef}
                        type="text"
                        name="website"
                        tabIndex={-1}
                        aria-hidden="true"
                        autoComplete="off"
                        className="absolute left-[-9999px] h-0 w-0 opacity-0"
                      />

                      <div className="grid grid-cols-1 gap-5 min-[561px]:grid-cols-2">
                        <div>
                          <label htmlFor="bk-name" className={LABEL}>
                            My name is
                          </label>
                          <input
                            id="bk-name"
                            type="text"
                            autoComplete="name"
                            value={data.name}
                            onChange={set("name")}
                            className={FIELD}
                          />
                        </div>
                        <div>
                          <label htmlFor="bk-contact" className={LABEL}>
                            Contact number
                          </label>
                          <input
                            id="bk-contact"
                            type="tel"
                            autoComplete="tel"
                            value={data.contact}
                            onChange={set("contact")}
                            className={FIELD}
                          />
                        </div>
                      </div>

                      {/* O único campo obrigatório: é para onde a confirmação
                          vai. Estado de atenção em OLIVE, nunca vermelho, e o
                          sinal principal é a frase, nunca a cor sozinha. */}
                      <div className="mt-5">
                        <label htmlFor="bk-email" className={LABEL}>
                          My email is
                        </label>
                        <input
                          id="bk-email"
                          ref={emailRef}
                          type="email"
                          inputMode="email"
                          autoComplete="email"
                          value={email}
                          aria-invalid={emailError || undefined}
                          aria-describedby="bk-email-help"
                          onChange={(event) => {
                            setEmail(event.target.value);
                            if (emailError) setEmailError(false);
                          }}
                          className={cn(
                            FIELD,
                            emailError &&
                              "border-olive bg-[color-mix(in_srgb,var(--sand)_42%,var(--linen))]",
                          )}
                        />
                        <p
                          id="bk-email-help"
                          className={cn(
                            "mt-2 text-[12.5px] leading-[1.5]",
                            emailError
                              ? "flex items-start gap-1.5 text-olive"
                              : "text-graphite-soft",
                          )}
                        >
                          {emailError ? (
                            <>
                              <svg
                                width="13"
                                height="13"
                                viewBox="0 0 14 14"
                                fill="none"
                                aria-hidden="true"
                                className="mt-[3px] shrink-0"
                              >
                                <circle
                                  cx="7"
                                  cy="7"
                                  r="6"
                                  stroke="currentColor"
                                  strokeWidth="1.1"
                                />
                                <path
                                  d="M7 3.9 V7.6"
                                  stroke="currentColor"
                                  strokeWidth="1.1"
                                  strokeLinecap="round"
                                />
                                <circle cx="7" cy="10" r="0.7" fill="currentColor" />
                              </svg>
                              <span>
                                An email address is needed to send your confirmation.
                              </span>
                            </>
                          ) : (
                            "Where your confirmation will be sent."
                          )}
                        </p>
                      </div>

                      <fieldset className="mt-6">
                        <legend className={LABEL}>{"I'm interested in"}</legend>
                        <div className="flex flex-col gap-1 min-[561px]:flex-row min-[561px]:gap-8">
                          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] text-graphite">
                            <input
                              type="checkbox"
                              checked={data.facial}
                              onChange={set("facial")}
                              className="size-[18px] cursor-pointer accent-(--olive)"
                            />
                            Holistic Facial
                          </label>
                          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[15px] text-graphite">
                            <input
                              type="checkbox"
                              checked={data.reset}
                              onChange={set("reset")}
                              className="size-[18px] cursor-pointer accent-(--olive)"
                            />
                            Nervous System Reset
                          </label>
                        </div>
                      </fieldset>

                      <div className="mt-5">
                        <label htmlFor="bk-concern" className={LABEL}>
                          My main concern or intention is
                        </label>
                        <textarea
                          id="bk-concern"
                          rows={2}
                          value={data.concern}
                          onChange={set("concern")}
                          className={`${FIELD} resize-none`}
                        />
                      </div>

                      <div className="mt-5">
                        <label htmlFor="bk-preferred" className={LABEL}>
                          My preferred day/time is
                        </label>
                        <input
                          id="bk-preferred"
                          type="text"
                          value={data.preferred}
                          onChange={set("preferred")}
                          className={FIELD}
                        />
                      </div>

                      {/* O TideButton não expõe disabled nem aria-busy, e esta
                          passada não pode tocá-lo: quem desabilita durante a
                          espera é o <fieldset> nativo em volta, que trava o
                          controle de dentro por HTML puro. O rótulo não muda. */}
                      <fieldset
                        className={cn("mt-8", sending && "opacity-70")}
                        disabled={sending}
                        aria-busy={sending}
                      >
                        <TideButton size="lg" type="submit" className="w-full">
                          Book My Consultation
                        </TideButton>
                      </fieldset>
                    </form>
                  </>
                )}

                {view === "success" && (
                  <div role="status">
                    <span
                      aria-hidden="true"
                      className="flex h-[46px] w-[46px] items-center justify-center rounded-full border border-sage text-sage"
                    >
                      <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path
                          d="M4 10.4 L8 14.2 L16 5.8"
                          stroke="currentColor"
                          strokeWidth="1.3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>

                    {heading("Your request is with me", "mt-6")}

                    <p className="mt-3 font-voice text-[17px] font-medium text-sage italic">
                      {"I'll be in touch shortly."}
                    </p>

                    <p className="mt-5 max-w-[46ch] text-[15px] leading-[1.65] text-graphite-soft">
                      A confirmation is on its way to your inbox. If you&apos;d like
                      to reach me directly, here is your message, ready to send by
                      text.
                    </p>

                    {phoneCard()}

                    <div className="mt-4 max-h-[150px] overflow-y-auto rounded-[2px] border border-sage/35 bg-[color-mix(in_srgb,white_55%,var(--linen))] px-4 py-3 text-[13.5px] leading-[1.65] whitespace-pre-line text-graphite-soft">
                      {buildBookingSmsBody(data)}
                    </div>

                    <div className="mt-6 flex flex-col gap-3 min-[561px]:flex-row">
                      <button type="button" onClick={copyMessage} className={SECONDARY}>
                        {copied && (
                          <svg
                            width="13"
                            height="13"
                            viewBox="0 0 20 20"
                            fill="none"
                            aria-hidden="true"
                          >
                            <path
                              d="M4 10.4 L8 14.2 L16 5.8"
                              stroke="currentColor"
                              strokeWidth="1.6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                        Copy message
                      </button>
                      {instagramLink()}
                    </div>
                  </div>
                )}

                {view === "error" && (
                  <div role="status">
                    {heading("Your request did not reach me")}

                    <p className="mt-5 max-w-[46ch] text-[15px] leading-[1.65] text-graphite-soft">
                      The connection was interrupted before your details arrived.
                      Please reach me directly by text, and I will take it from
                      there.
                    </p>

                    {phoneCard()}

                    <div className="mt-6 flex flex-col gap-3 min-[561px]:flex-row">
                      {instagramLink()}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
