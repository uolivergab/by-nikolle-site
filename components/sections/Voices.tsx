"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// Seção 5v — VOZES. 4ª passada, 08/08: "AS CARTAS" (trio em foco).
//
// O Gabriel pediu os depoimentos DENTRO DE CARDS, mais profissionais e vivos do
// que a versão original de card único. O que a versão original errava e esta
// corrige:
// 1. Era UM card só, flutuando à direita de um índice fraco, com metade da
//    seção vazia. Agora são TRÊS cards à vista: o do centro em foco e os
//    vizinhos recuados e cortados pela borda, o que mostra que há mais vozes
//    sem precisar de contador nem de legenda.
// 2. O card era um retângulo com sombra e uma mancha de folhagem por cima.
//    Agora é a CARTA da casa: papel de linho sobre o campo de areia, raio 16,
//    fio de contorno, sombra de papel e os MENISCOS da forma-assinatura em 2
//    cantos opostos, que se desenham no reveal.
// 3. O relógio ficou DENTRO do card: o fio d'água na base da carta ativa se
//    enche ao longo dos 7s até a próxima voz. A espera virou movimento, e virou
//    a linha d'água da marca em vez de uma barra de UI.
//
// COMPONENTE DO 21ST.DEV: "Testimonial Section 3" (solaceui). Trazido COM a
// mecânica dele: janela de três (esquerda/centro/direita derivadas do índice),
// motion layout + mola movendo os cards de posição, centro em destaque contra
// vizinhos recuados, setas e navegação por teclado.
// PASSADA DE TOKENS E DESVIOS DECLARADOS: o card azul chapado do original virou
// o papel de linho da marca; o BLUR dos vizinhos saiu (a lei da casa manda
// animar só transform e opacity, e blur em transição repinta), então o recuo é
// só opacidade e escala; os avatares saíram (não há foto de cliente, e parear
// rosto com voz é proibido aqui); as três cartas têm a MESMA largura de
// propósito, porque layout animation com larguras diferentes distorce o texto
// durante a mola; o keydown foi escopado no carrossel em vez de global.
//
// Copy 100% do roteiro.md (título + os 4 excerpts + nomes).

type Voice = { id: string; text: string; who: string };

const VOICES: Voice[] = [
  {
    id: "melani",
    text: "I was skeptical after countless treatments for my melasma, but Nikolle's method truly transformed my skin. My melasma has noticeably faded.",
    who: "Melani S.",
  },
  {
    id: "ashley",
    text: "She encouraged me to be patient and trust the process. My skin became brighter, healthier, with almost no signs of hyperpigmentation.",
    who: "Ashley B.",
  },
  {
    id: "sara",
    text: "Nikolle's treatments are unlike anything I've experienced before. Her knowledge, gentle touch and personalized care have transformed my skin.",
    who: "Sara M.",
  },
  {
    id: "ali",
    text: "Nikolle and her expertise are a delight and gift to Honolulu. A top-tier, pampered experience.",
    who: "Ali Z.",
  },
];

// Tempo de leitura de uma voz. O fio d'água na base da carta ativa leva
// exatamente isto para encher (o mesmo valor vive na animação vz-fill do CSS).
const DWELL_MS = 7000;
const SWIPE_PX = 56;

const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

// Menisco: fio côncavo (quarto de arco) da forma-assinatura, em 2 cantos
// opostos da carta. Comprimento do path ~58px; o dasharray 64 do CSS cobre o
// traçado inteiro no stroke draw.
function Menisco({ className }: { className?: string }) {
  return (
    <svg
      className={cn("vz-menisco", className)}
      width="30"
      height="30"
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 38 C2 18 18 2 38 2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Arrow({ back }: { back?: boolean }) {
  return (
    <svg
      width="17"
      height="12"
      viewBox="0 0 17 12"
      fill="none"
      aria-hidden="true"
      className={back ? "rotate-180" : undefined}
    >
      <path
        d="M1 6h14M10.5 1.5 15.5 6l-5 4.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Voices() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const activeRef = useRef(0);
  const touchX = useRef(0);

  const [live, setLive] = useState(false);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  // Incrementa a cada retomada: reinicia o fio d'água (key) e o relógio juntos.
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  // Reveal quando a seção entra em view (uma vez); sem JS nasce visível.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setLive(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setLive(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const goTo = useCallback((n: number) => {
    setActive(((n % VOICES.length) + VOICES.length) % VOICES.length);
  }, []);

  const step = useCallback(
    (dir: 1 | -1) => {
      goTo(activeRef.current + dir);
      setRunKey((k) => k + 1);
    },
    [goTo],
  );

  // Relógio da seção. O fio d'água é animação CSS pura (barra de progresso em
  // estado React custaria um re-render por frame), então aqui só vive a troca.
  useEffect(() => {
    if (reduced || paused) return;
    const id = window.setTimeout(() => goTo(activeRef.current + 1), DWELL_MS);
    return () => window.clearTimeout(id);
  }, [reduced, paused, active, runKey, goTo]);

  // Setas do teclado ESCOPADAS no carrossel (o original escutava a janela
  // inteira e sequestrava as setas da página).
  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) < SWIPE_PX) return;
    step(diff > 0 ? 1 : -1);
  };

  // A JANELA DE TRÊS: esquerda, centro e direita derivadas do índice ativo. As
  // cartas que permanecem entre um estado e outro mantêm a mesma key, e é isso
  // que faz o layout do Framer DESLIZÁ-LAS de posição em vez de trocá-las.
  const total = VOICES.length;
  const window3 = [
    { voice: VOICES[(active - 1 + total) % total], side: -1 as const },
    { voice: VOICES[active], side: 0 as const },
    { voice: VOICES[(active + 1) % total], side: 1 as const },
  ];

  return (
    <section
      ref={sectionRef}
      data-live={live ? "true" : undefined}
      className="voices relative overflow-hidden border-t border-olive/[0.08] bg-sand"
    >
      <div className="mx-auto max-w-[1240px] px-6 pt-[68px] pb-[64px] min-[881px]:px-14 min-[881px]:pt-[100px] min-[881px]:pb-[92px]">
        <h2
          id="vz-title"
          className="vz-rise font-display leading-[1.1] text-graphite [font-size:clamp(26px,2.9vw,40px)]"
          style={delay(0)}
        >
          <span className="sr-only">Kind words from our clients</span>
          <span
            aria-hidden="true"
            className="font-[550] tracking-[0.03em] whitespace-nowrap uppercase"
          >
            Kind words from
            <br />
            {"our "}
            <em className="font-voice font-medium tracking-normal normal-case italic">
              clients
            </em>
          </span>
        </h2>

        {/* AS CARTAS. A fileira é mais larga que o container de propósito: os
            vizinhos são cortados pela borda da seção, e é esse corte que conta
            que existem mais vozes, sem contador e sem legenda. */}
        <div
          role="group"
          aria-labelledby="vz-title"
          tabIndex={0}
          onKeyDown={onKeyDown}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => {
            setPaused(false);
            setRunKey((k) => k + 1);
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className="vz-stage vz-rise focus-ripple mt-10 flex justify-center gap-6 min-[881px]:mt-14 min-[881px]:gap-7"
          style={delay(140)}
        >
          {window3.map(({ voice, side }) => {
            const isCenter = side === 0;
            return (
              <motion.figure
                key={voice.id}
                layout={reduced ? false : true}
                initial={reduced ? false : { opacity: 0, scale: 0.94 }}
                animate={{
                  // Sopro de opacidade só para completar o recuo. O contraste
                  // do texto continua passando AA nas três (ver globals.css).
                  opacity: isCenter ? 1 : 0.88,
                  scale: isCenter ? 1 : 0.955,
                }}
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 230, damping: 30 }
                }
                data-on={isCenter ? "true" : undefined}
                className={cn(
                  "vz-card relative flex w-full max-w-[400px] flex-none flex-col justify-between",
                  "min-[881px]:w-[400px]",
                  isCenter ? "z-[2]" : "z-[1] hidden min-[881px]:flex",
                )}
              >
                <Menisco className="absolute top-3.5 left-3.5 text-sage/55" />
                <Menisco className="absolute right-3.5 bottom-3.5 rotate-180 text-sage/55" />

                <blockquote>
                  <span
                    aria-hidden="true"
                    className="block font-display text-[46px] leading-[0.42] text-olive/[0.26] italic select-none"
                  >
                    {"“"}
                  </span>
                  <p className="mt-4 font-voice text-[19px] leading-[1.5] font-medium text-graphite italic min-[881px]:text-[20px]">
                    {voice.text}
                  </p>
                </blockquote>

                <figcaption className="mt-7 flex items-center gap-3.5">
                  <span aria-hidden="true" className="vz-wline" />
                  <span className="text-[11px] tracking-[0.2em] text-olive uppercase">
                    {voice.who}
                  </span>
                </figcaption>

                {/* O relógio da seção, dentro da carta: o fio d'água enche ao
                    longo dos 7s até a próxima voz. */}
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[2px]"
                >
                  <span
                    key={`${voice.id}-${active}-${runKey}`}
                    className="vz-fill absolute inset-0 bg-olive"
                  />
                </span>

                {/* Clicar num vizinho traz ele para o centro. Botão transparente
                    por cima, porque <button> não pode conter bloco. */}
                {!isCenter && (
                  <button
                    type="button"
                    onClick={() => {
                      goTo(active + side);
                      setRunKey((k) => k + 1);
                    }}
                    aria-label={`Show the review from ${voice.who}`}
                    className="focus-ripple absolute inset-0 rounded-[16px]"
                  />
                )}
              </motion.figure>
            );
          })}
        </div>

        <div className="mt-9 flex justify-center gap-3 min-[881px]:mt-11">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Previous review"
            className="vz-disc focus-ripple"
          >
            <Arrow back />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Next review"
            className="vz-disc focus-ripple"
          >
            <Arrow />
          </button>
        </div>
      </div>
    </section>
  );
}
