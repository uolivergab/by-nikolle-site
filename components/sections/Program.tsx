"use client";

import { useEffect, useRef } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { TideButton } from "@/components/ui/TideButton";
import { BOOKING_SMS_HREF } from "@/lib/booking";

// Seção 4 — Skin Wellness Program. PICO olive, "a água funda" (design.md item 4):
// o campo mergulha do linho pro OLIVE FUNDO — o coração comercial, um dos 3
// momentos cinematográficos (reveal cerimonial deste bloco). Fundo em vídeo de
// luz/sombra de folhagem por breakpoint (só UM carrega), véu de contraste
// garantindo AA do texto linho, fronteira d'água no topo. Copy 100% do
// roteiro.md (Seção 4, intocável). Gabarito visual: mock-secao4-programa.html.

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function Program() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // O vídeo ambiente respeita prefers-reduced-motion: pausa no frame atual
  // (mostra o poster estático). Mesmo padrão do Hero.
  useEffect(() => {
    if (!reduced || !sectionRef.current) return;
    sectionRef.current.querySelectorAll("video").forEach((video) => video.pause());
  }, [reduced]);

  // Reveal cerimonial LENTO (mais lento que os reveals comuns — é pico; lentidão
  // = confiança). Degrada para fade simples em prefers-reduced-motion (sem rise,
  // sem stagger). O vídeo já traz a vida (luz derivando).
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
      ref={sectionRef}
      className="relative flex min-h-[86svh] items-center justify-center overflow-hidden bg-olive"
    >
      {/* Fundo em vídeo: só UM carrega por largura (breakpoint 701px, igual ao
          Hero). Lazy (preload none — a seção está abaixo da dobra; o poster
          segura o campo até o vídeo entrar em view). object-cover: textura
          abstrata, corte nas bordas é OK. */}
      <video
        className="absolute inset-0 hidden h-full w-full object-cover min-[701px]:block"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster="/videos/programa-desktop-poster.jpg"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src="/videos/programa-desktop.mp4" type="video/mp4" />
      </video>
      <video
        className="absolute inset-0 block h-full w-full object-cover min-[701px]:hidden"
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        poster="/videos/programa-mobile-poster.jpg"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src="/videos/programa-mobile.mp4" type="video/mp4" />
      </video>

      {/* Véu de contraste (sempre presente): garante o AA do texto linho sobre o
          vídeo, independente do estado de carga. Tokens em globals.css. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-(image:--s4-veil)"
      />

      {/* Fronteira de cima: linha d'água fina em linho no topo (a tensão
          superficial onde o linho encontra o olive; fronteira por posse). Se
          desenha do centro no reveal — a forma-assinatura da marca. */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-px origin-center bg-linen/45"
        initial={{ scaleX: 0, opacity: 0 }}
        whileInView={{ scaleX: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 0.9, ease: EASE, delay: 0.1 }
        }
      />

      {/* Conteúdo cerimonial, centralizado, muito ar. */}
      <motion.div
        className="relative z-[4] mx-auto flex min-w-0 max-w-[680px] flex-col items-center px-6 py-28 text-center min-[701px]:py-32"
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
          {/* Tratamento v2 (mesma acessibilidade do Hero/Method/Services): a
              frase estrutural em CAIXA ALTA só no visual (aria-hidden, uppercase
              por CSS) + 'program' em itálico minúsculo peso 500; o leitor de
              tela lê o sr-only em caixa de sentença. */}
          <span className="sr-only">Skin Wellness Program</span>
          <span
            aria-hidden="true"
            className="font-[550] tracking-[0.03em] uppercase"
          >
            <span className="whitespace-nowrap">Skin Wellness</span>{" "}
            {/* No mobile 'program' cai para a própria linha (ar cerimonial, como
                a palavra emocional do Hero); no desktop a headline fica em 1 linha. */}
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
            className="tide-invert w-full px-5 tracking-[0.16em] min-[701px]:w-auto min-[701px]:px-8"
          >
            Discover the Program Benefits
          </TideButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
