"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { openBookingDialog } from "@/components/ui/BookingDialog";
import { TideButton } from "@/components/ui/TideButton";

// Pop-up de boas-vindas — REDESENHADO 10/08 (revisão da Nikolle 09/08: "pedi
// para refazer o design dele e manteve praticamente como estava, além de ter
// adicionado uma foto repetida... tanta foto que te mandei, pq não usar outra
// deu atendendo?").
//
// O que mudou de verdade desta vez:
// (1) A FOTO é a que ela enviou PARA o pop-up (atendimento, máscara editada
//     para branca — popup-atendimento.webp), não mais o retrato repetido do
//     Sobre. No desktop ela é METADE da peça, coluna inteira; no mobile é o
//     topo alto do convite.
// (2) ESCALA: max-w 1040px no desktop (era 880) e convite de tela quase cheia
//     no mobile. "Significativamente maior e centralizado", como ela pediu.
// (3) COMPOSIÇÃO nova: papel de LINHO (não mais sand), moldura de fio d'água
//     recuada sobre a fotografia (a gramática do hero), linha d'água curta
//     antes da oferta, e a linha dos 20% como o centro emocional da peça
//     (voz itálica em olive, maior que o corpo).
// (4) O CTA abre o FORMULÁRIO de agendamento (BookingDialog), que monta o SMS
//     já preenchido — o caminho novo de 10/08.
//
// O que NÃO mudou (é o que protege o Modo A): copy aprovada dela, uma vez por
// sessão, sem urgência, sem countdown, sem pulso, e as obrigações de diálogo
// modal (aria-modal, foco preso e devolvido, Esc, véu clicável, rolagem
// travada). Gatilhos abaixo.

// DOIS GATILHOS, o que vier primeiro (09/08). O relógio é o TETO: aos 20s o
// convite chega de qualquer jeito. O atalho é o INTERESSE: 30% da rolagem cai
// no fim dos Serviços, quando os tratamentos e preços acabaram de ser lidos.
// O atalho só ARMA aos 8s, senão quem folheia leva o convite na cara antes de
// ler qualquer coisa. ABA EM SEGUNDO PLANO: o convite espera a pessoa voltar
// (o flag só grava quando ela VÊ; rAF parado queimava o convite invisível).
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

  // Agenda a aparição única da sessão (flag grava no momento em que MOSTRA).
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
    // scrollYProgress é motion value: a leitura por quadro NÃO passa pelo React.
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 min-[861px]:p-10">
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
            initial={{ opacity: 0, y: reduced ? 0 : 24, scale: reduced ? 1 : 0.982 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 0, scale: 1 }}
            transition={{ duration: reduced ? 0.3 : 0.8, ease: EASE }}
            // MOBILE: o card tem ALTURA DEFINIDA e a foto ocupa o que sobra
            // depois do texto (que nunca é espremido, então o CTA nunca cai
            // fora). Assim a fotografia cresce no aparelho grande e recua no
            // pequeno sozinha, sem breakpoint de altura. Altura fixa em vez de
            // max-h porque com max-h a foto não tem contra o que crescer.
            // A ALTURA CAIU PARA 90svh em 11/08 ("agora ele está cobrindo a
            // tela inteira" — Nikolle): sobra uma faixa de véu em cima e
            // embaixo, e o convite volta a ler como peça pousada sobre a
            // página em vez de takeover. O preço é largura de fotografia, e é
            // por isso que a foto nova entra num recorte mais largo.
            // DESKTOP: grid de 2 colunas, foto na linha inteira.
            className="relative flex h-[min(90svh,720px)] w-full max-w-[420px] flex-col overflow-hidden rounded-[4px] border border-olive/20 bg-linen shadow-[0_32px_90px_-26px_color-mix(in_srgb,var(--graphite)_46%,transparent)] min-[861px]:grid min-[861px]:h-auto min-[861px]:max-h-[min(88svh,660px)] min-[861px]:max-w-[1040px] min-[861px]:grid-cols-[1fr_1.05fr]"
          >
            {/* Linha d'água que se desenha no topo (forma-assinatura). */}
            <motion.span
              aria-hidden="true"
              initial={{ scaleX: reduced ? 1 : 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.95, ease: EASE, delay: reduced ? 0 : 0.45 }}
              className="absolute inset-x-0 top-0 z-[2] h-px origin-center bg-sage"
            />

            <button
              type="button"
              data-autofocus
              onClick={() => setOpen(false)}
              aria-label="Close"
              // O X vive ora sobre a fotografia, ora sobre o linho (a prancha
              // do mobile tem margem, e ela varia com a altura da tela), então
              // ele não pode depender da cor do que está atrás: grafite com
              // HALO DE LUZ, o mesmo device que resolveu a credencial da hero.
              className="focus-ripple absolute top-2 right-2 z-[3] flex h-11 w-11 items-center justify-center rounded-[2px] text-graphite [filter:drop-shadow(0_0_3px_var(--linen))_drop-shadow(0_0_6px_var(--linen))] transition-colors hover:text-olive"
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

            {/* A FOTOGRAFIA: a foto de atendimento que ela enviou para o pop-up
                (máscara editada para branca). A câmera assenta devagar
                (scale 1.045 -> 1) e a moldura recuada de fio d'água é a
                gramática do hero.
                ENQUADRAMENTO (2 passadas, 10/08, tudo medido): a cena é
                vertical e a história inteira (rosto da Nikolle no topo, rosto
                da cliente e as MÃOS trabalhando embaixo) ocupa do topo a ~78%
                da altura. Enquanto a foto PREENCHIA a largura, o Safari real
                não tinha altura para ela: medindo o card no aparelho do
                Gabriel, o viewport pequeno é ~694px (a barra do Safari come
                ~158px que o DevTools não simula), e sobravam 307px para uma
                foto que pedia 391px. Daí a inversão: no mobile a fotografia
                deixou de ser recortada para caber e passou a CABER INTEIRA,
                virando uma PRANCHA MONTADA sobre o linho, que é a mesma
                gramática do hero. É a largura que cede, nunca o assunto: a
                imagem se dimensiona pela altura disponível (h-full + w-auto,
                proporção preservada pelo próprio elemento) e o linho ao redor
                lê como a margem de uma foto montada. No desktop ela volta a
                preencher a coluna, onde há altura de sobra. */}
            <div className="flex min-h-0 flex-1 items-center justify-center overflow-hidden p-3 min-[861px]:block min-[861px]:min-h-[560px] min-[861px]:p-0">
              <motion.div
                initial={{ scale: reduced ? 1 : 1.045 }}
                animate={{ scale: 1 }}
                transition={{ duration: reduced ? 0 : 2.4, ease: EASE }}
                className="flex h-full w-full items-center justify-center min-[861px]:block"
              >
                <Image
                  src="/images/popup-ritual-serum.webp"
                  alt="Nikolle applying a facial serum during a treatment."
                  width={1024}
                  height={1123}
                  loading="eager"
                  sizes="(max-width: 860px) 100vw, 520px"
                  // AS DUAS DIMENSÕES EM AUTO, limitadas por max-*: é assim que
                  // um elemento substituído preserva a própria proporção ao ser
                  // reduzido. Com `h-full w-auto` a proporção quebra no momento
                  // em que a LARGURA vira o limite (a altura fica presa em 100%
                  // e o object-cover volta a cortar) — medido em tela alta.
                  // A moldura vive como OUTLINE recuado do próprio elemento da
                  // imagem (e não como um irmão absoluto): assim ela abraça a
                  // fotografia mesmo quando a largura cede, em vez de emoldurar
                  // um vão de linho. Mesmo device do retrato do Sobre.
                  className="h-auto max-h-full w-auto max-w-full object-cover [outline:1px_solid_color-mix(in_srgb,var(--linen)_55%,transparent)] [outline-offset:-12px] min-[861px]:h-full min-[861px]:max-h-none min-[861px]:w-full min-[861px]:object-top"
                />
              </motion.div>
            </div>

            {/* A CARTA: papel de linho, muito ar, a oferta como centro.
                Os respiros do mobile são FLUIDOS em svh, calibrados por DOIS
                pontos reais e não por chute: valem o mesmo de sempre no
                viewport alto (844) e encolhem no viewport pequeno do Safari
                (~694, medido no aparelho), onde cada pixel devolvido vira
                tamanho de fotografia. */}
            <div className="flex min-h-0 flex-col justify-center overflow-y-auto px-7 py-[clamp(14px,8.67svh_-_45px,28px)] min-[861px]:px-14 min-[861px]:py-12">
              <h2
                id="welcome-gift-title"
                className="font-display text-[clamp(26px,6.4vw,31px)] leading-[1.14] text-graphite min-[861px]:text-[clamp(30px,3vw,40px)]"
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

              <p className="mt-[clamp(10px,3.33svh_-_12px,16px)] max-w-[46ch] text-[14.5px] leading-[1.7] text-graphite-soft min-[861px]:mt-6 min-[861px]:text-[15.5px] min-[861px]:leading-[1.75]">
                {
                  "Whether you're seeking holistic skincare or a Nervous System Reset, each session is designed to support your skin, body, and overall well-being."
                }
              </p>

              {/* Linha d'água curta + a oferta como o centro emocional da peça.
                  20% desde 09/08 (pedido da Nikolle; era 15%). Sem selo, sem
                  pulso: uma linha de voz. */}
              <motion.span
                aria-hidden="true"
                initial={{ scaleX: reduced ? 1 : 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.9, ease: EASE, delay: reduced ? 0 : 0.75 }}
                className="mt-[clamp(12px,4.67svh_-_19px,20px)] block h-px w-[44px] origin-left bg-sage min-[861px]:mt-7"
              />
              <p className="mt-[clamp(10px,3.33svh_-_12px,16px)] font-voice text-[clamp(19px,4.8vw,22px)] italic text-olive min-[861px]:text-[clamp(21px,2.2vw,25px)]">
                Enjoy 20% off your first visit.
              </p>

              <div className="mt-[clamp(14px,6svh_-_27px,24px)] min-[861px]:mt-9">
                <TideButton
                  size="lg"
                  className="w-full min-[861px]:w-auto min-[861px]:px-10"
                  onClick={() => {
                    setOpen(false);
                    openBookingDialog();
                  }}
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
