"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TideButton } from "@/components/ui/TideButton";
import { buildBookingSmsHref, type BookingFormData } from "@/lib/booking";

// Formulário de agendamento (10/08) — resposta ao pedido da Nikolle (09/08):
// "a pessoa escreve no espaço p preencher os dados e a linha vai se
// movimentando... criar um campo de preenchimento visível (como em formulários
// profissionais)". A recomendação já registrada no design.md: um formulário na
// própria página que COLETA os dados em campos reais e monta o SMS já
// preenchido no clique. Sem backend, sem sistema de agendamento; a ação única
// do site continua sendo o SMS.
//
// TODOS os rótulos visíveis são strings do roteiro.md (o corpo do SMS aprovado
// e o rótulo Book My Consultation): "My name is", "Contact number",
// "I'm interested in" + "Holistic Facial" / "Nervous System Reset",
// "My main concern or intention is", "My preferred day/time is", e a abertura
// "Hi Nikolle! I'd like to schedule my first visit." como primeira linha da
// carta. Nenhuma palavra inventada. Campo em branco segue como "______" no SMS.
//
// Um único diálogo por página (montado no page.tsx). Os CTAs de agendamento
// abrem por openBookingDialog() (CustomEvent), sem prop-drilling. Obrigações
// de modal iguais às do WelcomeGift: aria-modal, foco preso e devolvido, Esc,
// véu clicável, rolagem travada. MODO A: sem urgência, sem validação agressiva
// (nenhum campo é obrigatório; a pessoa manda o que quiser).

const OPEN_EVENT = "bn:booking-open";
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

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

// Material dos campos: um passo de branco sobre o linho, borda sage, raio 2px
// (o raio do papel/botão da casa). O foco escurece a borda para olive.
const FIELD =
  "w-full rounded-[2px] border border-sage/45 bg-[color-mix(in_srgb,white_55%,var(--linen))] px-3.5 py-3 text-[15px] leading-normal text-graphite transition-colors duration-200 focus:border-olive focus:outline-none focus-visible:border-olive";
const LABEL = "mb-2 block text-[11px] uppercase tracking-[0.2em] text-graphite-soft";

export function BookingDialog() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<BookingFormData>(EMPTY);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Abre pelo evento global (qualquer CTA de agendamento dispara).
  useEffect(() => {
    const onOpen = () => setOpen(true);
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
    // A carta pronta: abre o SMS com os campos já preenchidos.
    window.location.href = buildBookingSmsHref(data);
    setOpen(false);
  };

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

              <div className="mt-8">
                <TideButton size="lg" type="submit" className="w-full">
                  Book My Consultation
                </TideButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
