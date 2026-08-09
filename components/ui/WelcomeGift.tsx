"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { TideButton } from "@/components/ui/TideButton";
import { BOOKING_SMS_HREF } from "@/lib/booking";

// Pop-up de boas-vindas — REDESENHADO 30/07 (item 1 da revisão da Nikolle):
// "redesenhar completamente, torná-lo significativamente maior e centralizado
// na tela, utilizar uma das minhas fotos profissionais, elegante e sofisticado".
//
// A carta discreta do canto virou CONVITE CENTRADO: retrato à esquerda, texto à
// direita, papel sand sobre um véu de grafite. Continua MODO A e continua
// discreto no comportamento, que é o que protege o posicionamento: uma vez por
// sessão, sem urgência, sem countdown, sem pulso, sem contador. O que mudou é a
// PRESENÇA, não a pressão. Quando ele chega, ver o bloco dos gatilhos abaixo.
//
// Sendo agora um diálogo modal de verdade (centralizado e cobrindo a cena), ele
// assume as obrigações de um: aria-modal, foco levado para dentro e devolvido
// ao fechar, Tab preso no painel, Esc e clique no véu fecham, rolagem travada.
//
// FOTO: o retrato aprovado da Nikolle. Ela pediu "uma das minhas fotos
// profissionais" e, na mesma linha, pediu para editar a máscara da foto de
// atendimento para branca. O retrato dispensa essa edição (não tem máscara) e
// serve melhor ao tom de carta pessoal. Se ela quiser especificamente a foto de
// atendimento, é troca de asset editado, não de código.

// DOIS GATILHOS, o que vier primeiro (09/08). O relógio é o TETO: aos 20s o
// convite chega de qualquer jeito (era 30s, e 30 passava da sessão curta).
// O atalho é o INTERESSE: 30% da rolagem cai no fim dos Serviços nos dois
// breakpoints (desktop 17,5%-31,5%, mobile 14%-32,2%), ou seja, a pessoa acabou
// de ler os tratamentos e os preços, que é quando a oferta significa alguma
// coisa. O atalho só ARMA aos 8s, senão quem folheia a página em dois gestos
// leva o convite na cara antes de ter lido qualquer coisa.
const SHOW_DELAY_MS = 20_000;
const SCROLL_TRIGGER = 0.3;
const SCROLL_ARM_MS = 8_000;
const SESSION_KEY = "bn-welcome-gift-shown";
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function WelcomeGift() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Agenda a aparição única da sessão. O flag grava no momento em que mostra,
  // então navegações/reloads na mesma sessão não repetem o convite.
  //
  // ABA EM SEGUNDO PLANO (corrigido 09/08, causa de "o pop-up sumiu"): o
  // setTimeout dispara mesmo com a aba escondida, mas o Framer é movido por
  // requestAnimationFrame, que fica PARADO enquanto a aba não pinta. O convite
  // era montado invisível (opacity 0) e, pior, o flag de "já mostrei" era
  // gravado ali: a pessoa gastava o único convite da sessão sem nunca vê-lo, e
  // nenhum F5 trazia ele de volta (sessionStorage sobrevive a recarga). Agora,
  // se a aba estiver escondida na hora, o convite ESPERA ela voltar.
  useEffect(() => {
    let shown = false;
    try {
      shown = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // sessionStorage indisponível (modo privado estrito): mostra mesmo assim.
    }
    if (shown) return;

    let done = false;
    let stopScroll: (() => void) | undefined;

    const onVisible = () => {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", onVisible);
      reveal();
    };

    function reveal() {
      if (done) return;
      if (document.hidden) {
        document.addEventListener("visibilitychange", onVisible);
        return;
      }
      done = true;
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // sem storage, sem flag; o convite só repete se recarregar a página.
      }
      setOpen(true);
    }

    // Teto: o relógio.
    const timer = setTimeout(reveal, SHOW_DELAY_MS);

    // Atalho: a profundidade de rolagem, armada só depois da carência.
    // scrollYProgress é motion value, então a leitura por quadro NÃO passa pelo
    // React (nada de listener de scroll na mão, nada de re-render por quadro).
    const armTimer = setTimeout(() => {
      if (done) return;
      if (scrollYProgress.get() >= SCROLL_TRIGGER) {
        reveal();
        return;
      }
      stopScroll = scrollYProgress.on("change", (progress) => {
        if (progress >= SCROLL_TRIGGER) reveal();
      });
    }, SCROLL_ARM_MS);

    return () => {
      done = true;
      clearTimeout(timer);
      clearTimeout(armTimer);
      stopScroll?.();
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [scrollYProgress]);

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
        'a[href], button:not([disabled])',
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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 min-[701px]:p-8">
          {/* Véu: grafite translúcido, discreto. Clique fecha. */}
          <motion.button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            onClick={() => setOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.2 : 0.5, ease: EASE }}
            className="absolute inset-0 cursor-default bg-[color-mix(in_srgb,var(--graphite)_46%,transparent)] backdrop-blur-[2px]"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-gift-title"
            initial={{ opacity: 0, y: reduced ? 0 : 22, scale: reduced ? 1 : 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 0, scale: 1 }}
            transition={{ duration: reduced ? 0.3 : 0.75, ease: EASE }}
            className="relative grid w-full max-w-[420px] overflow-hidden rounded-[4px] border border-olive/20 bg-sand shadow-[0_28px_80px_-24px_color-mix(in_srgb,var(--graphite)_42%,transparent)] min-[701px]:max-w-[880px] min-[701px]:grid-cols-[0.82fr_1fr]"
          >
            {/* Linha d'água que se desenha no topo (forma-assinatura). */}
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: reduced ? 1 : 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.95, ease: EASE, delay: reduced ? 0 : 0.4 }}
              className="absolute inset-x-0 top-0 z-[2] h-px origin-center bg-sage"
            />

            <button
              type="button"
              data-autofocus
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="focus-ripple absolute top-2 right-2 z-[3] flex h-11 w-11 items-center justify-center rounded-[2px] text-graphite transition-colors hover:text-olive min-[701px]:text-graphite-soft"
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

            {/* RETRATO: no mobile vira uma faixa horizontal no topo (a foto
                continua presente, mas sem empurrar o texto para fora da tela). */}
            <div className="relative h-[180px] w-full min-[701px]:h-auto">
              <Image
                src="/images/retrato-nikolle.webp"
                alt="Nikolle Coelho, founder of By Nikolle."
                fill
                sizes="(max-width: 700px) 100vw, 360px"
                className="object-cover object-[center_18%] min-[701px]:object-[center_28%]"
              />
            </div>

            <div className="px-7 pt-8 pb-8 min-[701px]:px-11 min-[701px]:py-12">
              <h2
                id="welcome-gift-title"
                className="pr-8 font-display text-[clamp(25px,4.6vw,34px)] leading-[1.18] text-graphite"
              >
                <span className="sr-only">Begin Your Wellness Journey</span>
                <span
                  aria-hidden="true"
                  className="font-[550] tracking-[0.03em] uppercase"
                >
                  {"Begin Your Wellness "}
                  <em className="font-voice font-medium tracking-normal normal-case italic">
                    Journey
                  </em>
                </span>
              </h2>

              <p className="mt-5 max-w-[46ch] text-[14.5px] leading-[1.72] text-graphite-soft min-[701px]:mt-6 min-[701px]:text-[15px]">
                {
                  "Whether you're seeking holistic skincare or a Nervous System Reset, each session is designed to support your skin, body, and overall well-being."
                }
              </p>

              {/* O desconto entra como linha sóbria, não como selo de oferta.
                  20% desde 09/08 (pedido da Nikolle; era 15%). */}
              <p className="mt-5 font-voice text-[clamp(17px,2vw,20px)] italic text-olive">
                Enjoy 20% off your first visit.
              </p>

              <div className="mt-7 min-[701px]:mt-8">
                <TideButton
                  size="lg"
                  href={BOOKING_SMS_HREF}
                  className="w-full min-[701px]:w-auto"
                  onClick={() => setOpen(false)}
                >
                  Reserve My Visit
                </TideButton>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
