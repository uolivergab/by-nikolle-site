"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TideButton } from "@/components/ui/TideButton";
import { BOOKING_SMS_HREF } from "@/lib/booking";
import { cn } from "@/lib/utils";

// Hero (roteiro.md Seção 1 + design.md): vídeo ping-pong de 12s por breakpoint,
// véu direcional linen, entrada staggered e SLOT VIVO na palavra final da
// headline. Gabarito visual: mock-hero-v8.html.

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Ciclo do slot vivo: âncora 6.5s, demais 2.2s, dissolve de 0.9s (roteiro.md).
const SLOT_CYCLE = [
  { word: "surface.", hold: 6500 },
  { word: "skin", hold: 2200 },
  { word: "nourishment", hold: 2200 },
  { word: "balance", hold: 2200 },
];
const ANCHOR_WORD = "surface.";
// O slot agora é UNIFORME em CAIXA ALTA: o sizer reserva a palavra mais larga
// (NOURISHMENT em caps é mais largo que o itálico minúsculo antigo), então o
// slot tem largura fixa e nada ao redor pula quando a palavra troca.
const WIDEST_WORD = SLOT_CYCLE.reduce(
  (widest, { word }) => (word.length > widest.length ? word : widest),
  "",
);
const CYCLE_START_DELAY = 1500;
const HEADLINE_LEAD = ["Skin", "is", "more", "than", "a"];
const OKINA = "ʻ"; // ʻokina de Kakaʻako, como no gabarito

export function Hero() {
  const reduced = useReducedMotion();
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const sizerRef = useRef<HTMLSpanElement>(null);
  const slotRef = useRef<HTMLSpanElement>(null);
  const sectionRef = useRef<HTMLElement>(null);

  // Ciclo do slot vivo. Com reduced motion, uma única troca assíncrona para
  // "surface." estático (o render inicial é idêntico no servidor e no cliente;
  // a visibilidade só muda depois de montado, sem mismatch de hidratação).
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (reduced) {
      timer = setTimeout(() => setActiveWord(ANCHOR_WORD), 0);
      return () => clearTimeout(timer);
    }
    let index = 0;
    const step = () => {
      const { word, hold } = SLOT_CYCLE[index];
      setActiveWord(word);
      index = (index + 1) % SLOT_CYCLE.length;
      timer = setTimeout(step, hold);
    };
    timer = setTimeout(step, CYCLE_START_DELAY);
    return () => clearTimeout(timer);
  }, [reduced]);

  // A largura do slot é FIXA na palavra mais larga em CAIXA ALTA (o sizer mede
  // WIDEST_WORD): o slot uniforme reserva o estado mais largo, então nada ao
  // redor pula quando a palavra troca. Mede no mount, quando as fontes carregam
  // e em resize (a medida depende da Cormorant). Escreve direto no DOM.
  useEffect(() => {
    const measure = () => {
      if (sizerRef.current && slotRef.current) {
        slotRef.current.style.width = `${sizerRef.current.offsetWidth}px`;
      }
    };
    measure();
    document.fonts?.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // Vídeo ambiente também respeita prefers-reduced-motion: pausa no frame atual.
  useEffect(() => {
    if (!reduced || !sectionRef.current) return;
    sectionRef.current
      .querySelectorAll("video")
      .forEach((video) => video.pause());
  }, [reduced]);

  const fade = (delay: number, duration: number) => ({
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: reduced
      ? { duration: 0.5, ease: "easeOut" as const }
      : { duration, ease: EASE, delay },
  });

  // Entrada staggered de cada palavra da headline (blur 5px->0 + rise 10px).
  // Índice contínuo: "Skin is more than" = 0..3, "a" = 4 (mesma cadência,
  // mesmo com a quebra do mobile pondo o "a" na 2ª linha junto do slot).
  const wordMotion = (i: number) => ({
    className: "inline-block",
    initial: { opacity: 0, y: 10, filter: "blur(5px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: reduced
      ? {
          duration: 0.5,
          ease: "easeOut" as const,
          y: { duration: 0 },
          filter: { duration: 0 },
        }
      : { duration: 0.85, ease: EASE, delay: 0.35 + i * 0.15 },
  });

  return (
    <section
      ref={sectionRef}
      className="relative h-svh min-h-[620px] overflow-hidden bg-linen"
    >
      <video
        className="absolute inset-0 hidden h-full w-full object-cover min-[701px]:block"
        autoPlay
        muted
        loop
        playsInline
        poster="/videos/hero-desktop-poster.jpg"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src="/videos/hero-desktop.mp4" type="video/mp4" />
      </video>
      <video
        className="absolute inset-0 block h-full w-full object-cover min-[701px]:hidden"
        autoPlay
        muted
        loop
        playsInline
        poster="/videos/hero-mobile-poster.jpg"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src="/videos/hero-mobile.mp4" type="video/mp4" />
      </video>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-(image:--hero-veil-mobile) min-[701px]:bg-(image:--hero-veil-desktop)"
      />

      <div className="relative top-[46%] z-[4] max-w-[800px] -translate-y-1/2 px-6 min-[701px]:top-[53%] min-[701px]:px-12">
        <motion.p
          {...fade(0.2, 0.8)}
          className="mb-[18px] text-[11px] uppercase leading-[normal] tracking-[0.22em] text-sage min-[701px]:text-[12.5px] min-[701px]:tracking-[0.24em]"
        >
          <span className="hidden min-[701px]:inline">
            {`Holistic Facial Treatments in Kaka${OKINA}ako`}
          </span>
          <span className="min-[701px]:hidden">
            {`Holistic Facials · Kaka${OKINA}ako`}
          </span>
        </motion.p>

        <h1 className="font-display leading-[1.06] text-graphite [font-size:clamp(24px,7.4vw,34px)] min-[701px]:whitespace-nowrap min-[701px]:[font-size:clamp(35px,3.5vw,45px)]">
          <span className="sr-only">Skin is more than a surface.</span>
          {/* Headline UNIFORME (retificado 15/07): parte fixa E slot na MESMA
              Cormorant CAIXA ALTA ROMANA (mesmo peso/tamanho/altura). O slot só
              troca a palavra por dissolve; não é mais itálico minúsculo.
              Mobile: quebra em 2 linhas fixas, "SKIN IS MORE THAN" / "A [slot]"
              (grupos em block); desktop: 1 linha (grupos inline + nowrap do h1). */}
          <span
            aria-hidden="true"
            className="font-[550] tracking-[0.03em] uppercase"
          >
            <span className="block whitespace-nowrap min-[701px]:inline">
              {HEADLINE_LEAD.slice(0, 4).map((word, i) => (
                <Fragment key={word}>
                  <motion.span {...wordMotion(i)}>{word}</motion.span>{" "}
                </Fragment>
              ))}
            </span>
            <span className="block whitespace-nowrap min-[701px]:inline">
              <motion.span {...wordMotion(4)}>{HEADLINE_LEAD[4]}</motion.span>{" "}
              <span
                ref={slotRef}
                className="slot-live relative inline-block whitespace-nowrap align-baseline"
              >
                <span ref={sizerRef} className="invisible">
                  {WIDEST_WORD}
                </span>
                {SLOT_CYCLE.map(({ word }) => (
                  <span
                    key={word}
                    className={cn(
                      "slot-cand absolute top-0 left-0 whitespace-nowrap",
                      activeWord === word
                        ? "opacity-100 blur-none"
                        : "opacity-0 blur-[3px]",
                    )}
                  >
                    {word}
                  </span>
                ))}
              </span>
            </span>
          </span>
        </h1>

        <motion.p
          {...fade(2.9, 1)}
          className="mt-6 mb-[28px] text-[14.5px] font-light leading-[1.7] text-graphite-soft min-[701px]:max-w-[44ch] min-[701px]:text-[15.5px]"
        >
          Discover holistic and personalized facial treatments designed to
          support healthy aging and create deep relaxation through truly clean
          beauty.
        </motion.p>

        <motion.div
          {...fade(3.3, 1)}
          className="flex flex-wrap items-center gap-4"
        >
          <TideButton
            size="lg"
            href={BOOKING_SMS_HREF}
            className="w-full min-[701px]:w-auto"
          >
            Book My Consultation
          </TideButton>
          <span className="hidden rounded-full border border-sage/55 bg-linen/50 px-4 py-2 text-[12px] leading-[normal] tracking-[0.05em] whitespace-nowrap text-graphite-soft min-[701px]:inline-block">
            {"Opening Wellness Offer · 15% off your first visit"}
          </span>
        </motion.div>

        <motion.p
          {...fade(3.3, 1)}
          className="mt-3 text-[11.5px] uppercase leading-[normal] tracking-[0.14em] text-graphite-soft min-[701px]:hidden"
        >
          15% off your first visit
        </motion.p>

        <motion.p
          {...fade(3.7, 1.2)}
          className="mt-6 text-[10.5px] uppercase leading-[normal] tracking-[0.22em] text-sage"
        >
          Best of Honolulu 2024 Winner
        </motion.p>
      </div>
    </section>
  );
}
