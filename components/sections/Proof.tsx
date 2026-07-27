"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

// Seção 5 — Transformações (design.md 5-RETIFICADO). O fundo botânico do
// amanhecer MIGROU para a Seção 2/Filosofia em 27/07 (decisão do Gabriel):
// esta seção ficou em campo LINEN limpo, com a costura olive no topo (a S4
// dissolvendo) preservada. PROTAGONISTA: 6 PERSIANAS before/after
// (before-after-02..07): desktop colunas que expandem no hover; mobile
// acordeão vertical com scroll-reveal. Copy 100% do roteiro.md (intocável).

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const PANELS = [
  { src: "/images/before-after-02.webp", roman: "I" },
  { src: "/images/before-after-03.webp", roman: "II" },
  { src: "/images/before-after-04.webp", roman: "III" },
  { src: "/images/before-after-05.webp", roman: "IV" },
  { src: "/images/before-after-06.webp", roman: "V" },
  { src: "/images/before-after-07.webp", roman: "VI" },
];

const DESKTOP_MQ = "(min-width: 881px)";

export function Proof() {
  const reduced = useReducedMotion();
  const panelsRef = useRef<HTMLDivElement>(null);
  const mqlRef = useRef<MediaQueryList | null>(null);
  const [open, setOpen] = useState(0);

  const isDesktop = () => mqlRef.current?.matches ?? true;

  // Mobile: SCROLL-REVEAL sem hijack — linha de foco a ~45% do viewport varre o
  // container e abre a faixa da zona cruzada (scroll normal). Desktop = hover.
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_MQ);
    mqlRef.current = mql;

    const evaluate = () => {
      if (mql.matches) return;
      const cont = panelsRef.current;
      if (!cont) return;
      const r = cont.getBoundingClientRect();
      const focus = window.innerHeight * 0.45;
      const progress = (focus - r.top) / r.height;
      const idx = Math.max(
        0,
        Math.min(PANELS.length - 1, Math.floor(progress * PANELS.length)),
      );
      setOpen((prev) => (prev === idx ? prev : idx));
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        evaluate();
        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    mql.addEventListener("change", evaluate);
    evaluate();

    return () => {
      window.removeEventListener("scroll", onScroll);
      mql.removeEventListener("change", evaluate);
    };
  }, []);

  const container: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : 0.14,
        delayChildren: reduced ? 0 : 0.05,
      },
    },
  };
  const rise: Variants = {
    hidden: { opacity: 0, y: reduced ? 0 : 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: reduced ? 0.4 : 0.95, ease: EASE },
    },
  };

  return (
    <section className="proof relative overflow-hidden bg-linen">
      {/* Costura no topo: o olive-deep da S4 continua e dissolve sobre o linho,
          pra a entrada da seção não ser uma emenda dura. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-[180px]"
        style={{
          background:
            "linear-gradient(180deg, var(--olive-deep) 0%, color-mix(in srgb, var(--olive-deep) 55%, transparent) 34%, color-mix(in srgb, var(--olive-deep) 18%, transparent) 66%, transparent 100%)",
        }}
      />

      <motion.div
        className="relative z-[2] mx-auto max-w-[1240px] px-6 pt-[150px] pb-16 min-[881px]:px-14 min-[881px]:pt-[150px] min-[881px]:pb-24"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.div variants={rise} className="max-w-[720px]">
          {/* Sem os text-shadows de leitura sobre folhagem: o campo agora é
              linen chapado. Eyebrow em graphite-soft (padrão AA da casa). */}
          <p className="mb-4 text-[11px] uppercase tracking-[0.28em] text-graphite-soft">
            Real results
          </p>
          <h2 className="font-display leading-[1.08] text-graphite [font-size:clamp(26px,3vw,42px)]">
            <span className="sr-only">Real transformations.</span>
            <span
              aria-hidden="true"
              className="font-[550] uppercase tracking-[0.03em]"
            >
              Real{" "}
              <em className="font-voice font-medium tracking-normal normal-case italic">
                transformations.
              </em>
            </span>
          </h2>
        </motion.div>

        <motion.div variants={rise} className="mt-9 min-[881px]:mt-12">
          <div ref={panelsRef} className="proof-panels">
            {PANELS.map((p, i) => (
              <button
                key={p.src}
                type="button"
                data-open={open === i ? "true" : undefined}
                aria-pressed={open === i}
                onMouseEnter={() => {
                  if (isDesktop()) setOpen(i);
                }}
                onFocus={() => setOpen(i)}
                onClick={() => setOpen(i)}
                className="proof-panel"
              >
                <span aria-hidden="true" className="proof-shade-top" />
                <span aria-hidden="true" className="proof-shade-bottom" />
                <span aria-hidden="true" className="proof-vlabel">
                  {`Transformation · ${p.roman}`}
                </span>
                <span aria-hidden="true" className="proof-edge proof-edge-before">
                  Before
                </span>
                <span aria-hidden="true" className="proof-edge proof-edge-after">
                  After
                </span>
                <span aria-hidden="true" className="proof-seam" />
                <Image
                  src={p.src}
                  alt={`Before and after of a holistic facial by Nikolle, transformation ${p.roman}`}
                  fill
                  sizes="(max-width: 880px) 94vw, 490px"
                  className="proof-panel-img"
                />
              </button>
            ))}
          </div>

          <div className="mt-4 flex items-baseline">
            <span className="text-[11px] tracking-[0.04em] text-graphite-soft">
              Individual results may vary.
            </span>
            <span className="ml-auto hidden text-[11px] uppercase tracking-[0.18em] text-graphite-soft min-[881px]:inline">
              hover to reveal
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
