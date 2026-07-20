"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { TideButton } from "@/components/ui/TideButton";
import { BOOKING_SMS_HREF } from "@/lib/booking";

// Seção 4 — Skin Wellness Program. PICO da marca: fundo de vídeo de folhagem-luz
// (olive-deep), texto linen cerimonial, botão maré invertido. Fundo PRÓPRIO
// (vídeo programa-desktop/mobile.mp4 + poster + véu radial), independente das
// seções vizinhas. Copy do roteiro.md (Seção 4) intocada. Reveal cerimonial
// lento (é pico; lentidão = confiança). Gabarito: design.md item 4.

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Program() {
  const reduced = useReducedMotion();

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : 0.16,
        delayChildren: reduced ? 0 : 0.12,
      },
    },
  };
  const rise: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 22 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0.6 : 1.2, ease: EASE },
    },
  };

  return (
    <section
      id="program"
      className="relative flex min-h-[86svh] items-center justify-center overflow-hidden bg-[color:var(--olive-deep)]"
    >
      {/* Fundo PRÓPRIO: vídeo de folhagem-luz. Só um carrega por largura
          (breakpoint 701px, como o Hero). Pausa/estático em reduced-motion. */}
      <div aria-hidden="true" className="absolute inset-0 z-0">
        <video
          className="hidden h-full w-full object-cover min-[701px]:block"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/videos/programa-desktop-poster.jpg"
          tabIndex={-1}
        >
          <source src="/videos/programa-desktop.mp4" type="video/mp4" />
        </video>
        <video
          className="block h-full w-full object-cover min-[701px]:hidden"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/videos/programa-mobile-poster.jpg"
          tabIndex={-1}
        >
          <source src="/videos/programa-mobile.mp4" type="video/mp4" />
        </video>
      </div>

      {/* Véu radial: escurece o centro pro AA do texto linen, sem borda dura. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 42%, color-mix(in srgb, var(--olive-deep) 20%, transparent) 0%, color-mix(in srgb, var(--olive-deep) 62%, transparent) 66%, color-mix(in srgb, var(--olive-deep) 86%, transparent) 100%)",
        }}
      />

      {/* Conteúdo cerimonial, centralizado, muito ar. */}
      <motion.div
        className="relative z-[2] mx-auto flex min-w-0 max-w-[680px] flex-col items-center px-6 py-28 text-center min-[701px]:py-32"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.4 }}
      >
        <motion.p
          variants={rise}
          className="mb-6 text-[11.5px] uppercase leading-[normal] tracking-[0.3em] text-linen/[0.72]"
        >
          By invitation
        </motion.p>

        <motion.h2
          variants={rise}
          className="font-display leading-[1.08] text-linen [font-size:clamp(31px,5.4vw,50px)] min-[701px]:whitespace-nowrap"
        >
          <span className="sr-only">Skin Wellness Program</span>
          <span
            aria-hidden="true"
            className="font-[550] tracking-[0.03em] uppercase"
          >
            <span className="whitespace-nowrap">Skin Wellness</span>{" "}
            <br className="min-[701px]:hidden" />
            <em className="font-voice font-medium tracking-normal normal-case whitespace-nowrap italic">
              program
            </em>
          </span>
        </motion.h2>

        <motion.p
          variants={rise}
          className="mt-7 max-w-[500px] text-[15px] font-light leading-[1.75] text-linen/[0.82] min-[701px]:text-[15.5px]"
        >
          Lasting transformation requires consistency. We created an exclusive
          program for clients who want to maintain their skin goals through
          regular treatments at special rates.
        </motion.p>

        <motion.div variants={rise} className="mt-10 w-full min-[701px]:w-auto">
          <TideButton
            size="lg"
            href={BOOKING_SMS_HREF}
            className="tide-invert w-full px-5 tracking-[0.16em] no-underline min-[701px]:w-auto min-[701px]:px-8"
          >
            Discover the Program Benefits
          </TideButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
