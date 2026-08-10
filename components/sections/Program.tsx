"use client";

import { useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { openBookingDialog } from "@/components/ui/BookingDialog";
import { TideButton } from "@/components/ui/TideButton";
import { cn } from "@/lib/utils";

// Seção 4 — Skin Wellness Program. PICO da marca: fundo de vídeo de folhagem-luz
// (olive-deep), texto linen cerimonial, botão maré invertido. Fundo PRÓPRIO
// (vídeo programa-desktop/mobile.mp4 + poster + véu radial), independente das
// seções vizinhas. Copy do roteiro.md (Seção 4) intocada. Reveal cerimonial
// lento (é pico; lentidão = confiança). Gabarito: design.md item 4.

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// PAINEL DOS PROGRAMAS (revisão Nikolle 26/07 + martelo 27/07): o CTA
// 'Discover the Program Benefits' deixou de abrir SMS e passou a REVELAR os 2
// programas AQUI DENTRO da seção olive (one-page preservado; a seção continua
// terminando em olive, então a costura noite->amanhecer da S5 segue intacta).
// Preços SÓ aqui dentro (a home segue convite). Dados 100% do roteiro.md.
// A ação de agendar volta no FIM do painel com o MESMO rótulo do hero
// ('Book My Consultation', um rótulo por intenção).
const WELLNESS_TIERS = [
  { name: "Signature Facials", monthly: "Monthly: $110", biMonthly: "Every 2 Months: $120" },
  { name: "Advanced Treatments", monthly: "Monthly: $135", biMonthly: "Every 2 Months: $145" },
  {
    name: "Dermal Infusion Micro-Crystal Treatment",
    monthly: "Monthly: $185",
    biMonthly: "Every 2 Months: $205",
  },
];

const PIGMENT_PARAGRAPHS = [
  "A personalized skin wellness program designed to support melasma and hyperpigmentation through a holistic, results-driven approach.",
  "At By Nikolle, we understand melasma as a reflection of a compromised skin barrier influenced by multiple factors. Our Method focuses on strengthening the skin barrier, providing deep nourishment, and gently supporting natural skin renewal. As skin health and resilience are restored, pigmentation gradually improves over time.",
  "The program combines a series of Pigment Balance Treatments and Dermal Infusion sessions, customized home care regimen with Eminence Organics skin products and lifestyle guidance to support lasting results.",
  "Each program is tailored to your individual skin needs and goals.",
];

export function Program() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);

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
      className="relative flex min-h-[86svh] flex-col items-center justify-center overflow-hidden bg-[color:var(--olive-deep)]"
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
          className="font-display leading-[1.08] text-linen [font-size:clamp(31px,5.4vw,44px)] min-[701px]:whitespace-nowrap"
        >
          {/* Nome novo (revisão Nikolle 26/07): guarda-chuva dos 2 programas.
              Clamp máximo 50->44px para 'HOLISTIC SKINCARE PROGRAMS' caber em
              1 linha no desktop (max-w 680px). */}
          <span className="sr-only">Holistic Skincare Programs</span>
          <span
            aria-hidden="true"
            className="font-[550] tracking-[0.03em] uppercase"
          >
            <span className="whitespace-nowrap">Holistic Skincare</span>{" "}
            <br className="min-[701px]:hidden" />
            <em className="font-voice font-medium tracking-normal normal-case whitespace-nowrap italic">
              programs
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
            onClick={() => setOpen((prev) => !prev)}
            ariaExpanded={open}
            ariaControls="program-panel"
            className="tide-invert w-full px-5 tracking-[0.16em] no-underline min-[701px]:w-auto min-[701px]:px-8"
          >
            Discover the Program Benefits
          </TideButton>
        </motion.div>
      </motion.div>

      {/* PAINEL: os 2 programas, revelados dentro do mergulho olive. Expansão
          por grid-template-rows (mecânica da casa); conteúdo sobre um reforço
          LOCAL de contraste (véu olive-deep translúcido) pro AA do linho sobre
          o vídeo. */}
      <div
        id="program-panel"
        role="region"
        aria-label="Holistic Skincare Programs"
        className={cn(
          "relative z-[2] grid w-full transition-[grid-template-rows] duration-[650ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="mx-auto w-full max-w-[1080px] px-6 pb-20 min-[701px]:px-12 min-[701px]:pb-24">
            <div
              className={cn(
                "rounded-[4px] bg-[color-mix(in_srgb,var(--olive-deep)_55%,transparent)] p-6 transition-opacity duration-500 min-[701px]:p-10",
                open ? "opacity-100 delay-200" : "opacity-0",
                "motion-reduce:transition-none",
              )}
            >
              {/* Programa 1 — Skin Wellness Program (3 boxes, formato de
                  referência da Nik). */}
              <h3 className="font-display text-[clamp(20px,2.2vw,25px)] font-medium tracking-[0.06em] text-linen uppercase">
                Skin Wellness Program
              </h3>
              <div className="mt-6 grid grid-cols-1 gap-4 min-[701px]:grid-cols-3">
                {WELLNESS_TIERS.map((tier) => (
                  <div
                    key={tier.name}
                    className="rounded-[4px] border border-linen/20 bg-linen/[0.05] p-5"
                  >
                    <p className="font-display text-[17.5px] leading-[1.3] font-medium text-linen">
                      {tier.name}
                    </p>
                    <p className="mt-3 text-[13.5px] leading-[1.8] text-linen/85">
                      {tier.monthly}
                      <br />
                      {tier.biMonthly}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-[13px] leading-[1.7] text-linen/75">
                Clients receive a one-week grace period for rescheduling while
                keeping their Skin Wellness Rate.
              </p>

              {/* Linha d'água entre os dois programas. */}
              <div aria-hidden="true" className="my-9 h-px w-full bg-linen/15" />

              {/* Programa 2 — Pigment Balance Program. */}
              <h3 className="font-display text-[clamp(20px,2.2vw,25px)] font-medium tracking-[0.06em] text-linen uppercase">
                Pigment Balance Program
              </h3>
              <div className="mt-5 max-w-[62ch]">
                {PIGMENT_PARAGRAPHS.map((paragraph) => (
                  <p
                    key={paragraph.slice(0, 24)}
                    className="mb-3 text-[14.5px] leading-[1.75] text-linen/85"
                  >
                    {paragraph}
                  </p>
                ))}
                <p className="text-[14.5px] leading-[1.75] font-medium text-linen">
                  Program investment is determined following an initial
                  consultation.
                </p>
              </div>

              <div className="mt-9 w-full min-[701px]:w-auto">
                <TideButton
                  size="lg"
                  onClick={openBookingDialog}
                  className="tide-invert w-full px-5 tracking-[0.16em] no-underline min-[701px]:w-auto min-[701px]:px-8"
                >
                  Book My Consultation
                </TideButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
