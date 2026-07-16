"use client";

import { useEffect, useRef, useState } from "react";
import { IconSkin } from "@/components/icons/IconSkin";
import { IconNourish } from "@/components/icons/IconNourish";
import { IconBalance } from "@/components/icons/IconBalance";
import { cn } from "@/lib/utils";

// Seção 2 — O Método (Os Três Pilares). VALE editorial (design.md): cascata
// diagonal no desktop, carrossel no mobile, muito ar. Copy 100% do roteiro.md
// (intocável). Gabarito visual: mock-metodo-FINAL.html.

// Termos da filosofia da marca (roteiro.md). Marquee decorativo, aria-hidden.
const MARQUEE_WORDS = [
  "Skin",
  "Nourishment",
  "Balance",
  "Holistic",
  "Non-invasive",
  "Clean beauty",
];

// Cada metade do track repete as palavras vezes suficientes para, sozinha,
// ser mais larga que a viewport (até 2560px). Só assim o loop translateX(-50%)
// nunca deixa um trecho vazio à direita. Render = duas metades idênticas.
const MARQUEE_REPS_PER_HALF = 4;
const MARQUEE_HALF = Array.from(
  { length: MARQUEE_REPS_PER_HALF },
  () => MARQUEE_WORDS,
).flat();

type Pillar = {
  key: string;
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  // Gancho (1ª frase) + resto, exatamente como no roteiro.md.
  hook: string;
  body: string;
};

const PILLARS: Pillar[] = [
  {
    key: "skin",
    title: "Skin",
    Icon: IconSkin,
    hook: "Holistic, non-invasive treatments.",
    body: " We support your skin's health and resilience through a natural, conscious approach, proving that real results don't need to be aggressive.",
  },
  {
    key: "nourishment",
    title: "Nourishment",
    Icon: IconNourish,
    hook: "True beauty is nourished from the inside out.",
    body: " We pair aesthetics with lifestyle, integrative nutrition and practices that feed your body and your vitality.",
  },
  {
    key: "balance",
    title: "Balance",
    Icon: IconBalance,
    hook: "Where skin meets calm.",
    body: " An integrative approach that harmonizes body, mind and nervous system through connection and intentional daily rituals.",
  },
];

export function Method() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const pillarRefs = useRef<(HTMLDivElement | null)[]>([]);
  const touchX = useRef<number | null>(null);

  const [live, setLive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [cur, setCur] = useState(0);
  const [gridHeight, setGridHeight] = useState<number | undefined>(undefined);

  // Dispara o movimento (marquee dos ícones + respiração) quando a seção entra
  // na viewport, uma vez. Sem JS, os ícones já ficam visíveis e estáticos.
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
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // O carrossel só existe no mobile (<=760px, como no gabarito).
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 760px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // A altura do container acompanha o pilar ativo (sem buraco branco). No
  // desktop o estilo inline é ignorado (gate em isMobile), então não há reset.
  useEffect(() => {
    if (!isMobile) return;
    const el = pillarRefs.current[cur];
    if (!el) return;
    const measure = () => setGridHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [isMobile, cur]);

  const go = (dir: number) =>
    setCur((prev) => (prev + dir + PILLARS.length) % PILLARS.length);

  const onTouchStart = (e: React.TouchEvent) => {
    touchX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 44) go(dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  return (
    <section
      id="philosophy"
      ref={sectionRef}
      data-live={live ? "true" : undefined}
      className="method relative overflow-hidden bg-linen"
    >
      {/* Marquee de palavras vivas: costura com o hero. Decorativo. */}
      <div
        aria-hidden="true"
        className="overflow-hidden border-y border-sage/[0.18] py-3"
      >
        <div className="method-marquee-track inline-flex whitespace-nowrap">
          {[...MARQUEE_HALF, ...MARQUEE_HALF].map((word, i) => (
            <span
              key={`${word}-${i}`}
              className="px-11 font-voice text-[16px] italic text-sage/75"
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-6 py-16 min-[761px]:px-16 min-[761px]:py-28">
        <p className="text-[11.5px] uppercase tracking-[0.28em] text-graphite-soft">
          The by Nikolle Method
        </p>
        <h2 className="mt-5 mb-11 max-w-[560px] font-display text-[clamp(20px,6.4vw,42px)] leading-[1.1] text-graphite min-[761px]:mb-20">
          <span className="sr-only">A conscious approach to your self-care.</span>
          {/* v2 (mesmo tratamento do Hero): frase estrutural em CAIXA ALTA
              (uppercase só visual, no span aria-hidden) + 'self-care' em itálico
              minúsculo peso 500. O leitor de tela lê o sr-only em caixa de
              sentença; a quebra fixa em 2 linhas vem do <br/>, cada linha nowrap. */}
          <span
            aria-hidden="true"
            className="font-[550] tracking-[0.03em] whitespace-nowrap uppercase"
          >
          A conscious approach
          <br />
          {"to your "}
          <em className="font-voice font-medium normal-case tracking-normal whitespace-nowrap italic">
            self-care.
          </em>
          </span>
        </h2>

        <div
          ref={gridRef}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          style={isMobile && gridHeight ? { height: gridHeight } : undefined}
          className={cn(
            "method-grid relative block",
            "motion-safe:[transition:height_0.5s_cubic-bezier(0.22,1,0.36,1)]",
            "min-[761px]:grid min-[761px]:grid-cols-3 min-[761px]:items-start min-[761px]:gap-16",
          )}
        >
          {PILLARS.map((pillar, i) => {
            const { Icon } = pillar;
            const active = cur === i;
            return (
              <div
                key={pillar.key}
                ref={(el) => {
                  pillarRefs.current[i] = el;
                }}
                aria-hidden={isMobile && !active ? "true" : undefined}
                className={cn(
                  "method-pillar flex flex-col",
                  // Mobile: pilares empilhados em absoluto, um visível por vez.
                  "absolute inset-x-0 top-0 motion-safe:[transition:opacity_0.55s_cubic-bezier(0.22,1,0.36,1),transform_0.55s_cubic-bezier(0.22,1,0.36,1)]",
                  active
                    ? "opacity-100 [transform:none]"
                    : "pointer-events-none translate-x-[18px] opacity-0",
                  // Desktop: cascata diagonal, os três visíveis.
                  "min-[761px]:pointer-events-auto min-[761px]:static min-[761px]:translate-x-0 min-[761px]:opacity-100 min-[761px]:transition-none",
                  i === 1 && "min-[761px]:mt-16",
                  i === 2 && "min-[761px]:mt-32",
                )}
              >
                <div className="method-ico mb-5 flex h-[72px] items-end text-olive min-[761px]:mb-6 min-[761px]:h-[92px]">
                  <Icon className="h-full w-auto" />
                </div>
                <div className="mb-4 font-voice text-[clamp(30px,2.9vw,38px)] leading-none font-normal italic text-graphite">
                  {pillar.title}
                </div>
                <p className="text-[15px] leading-[1.75] text-graphite-soft min-[761px]:max-w-[34ch]">
                  <b className="font-normal text-graphite">{pillar.hook}</b>
                  {pillar.body}
                </p>
              </div>
            );
          })}
        </div>

        {/* Navegação do carrossel: só mobile. Setas <button> + linha d'água. */}
        <div className="mt-10 flex items-center gap-6 min-[761px]:hidden">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous pillar"
            className="focus-ripple flex h-11 w-11 flex-none items-center justify-center rounded-full border border-sage/45 text-olive transition-transform active:scale-95"
          >
            <span aria-hidden="true">{"←"}</span>
          </button>
          <div className="relative h-px flex-1 overflow-hidden bg-sage/25">
            <span
              aria-hidden="true"
              style={{ transform: `translateX(${cur * 100}%)` }}
              className="absolute inset-y-0 left-0 w-1/3 bg-olive motion-safe:transition-transform motion-safe:duration-[550ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]"
            />
          </div>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next pillar"
            className="focus-ripple flex h-11 w-11 flex-none items-center justify-center rounded-full border border-sage/45 text-olive transition-transform active:scale-95"
          >
            <span aria-hidden="true">{"→"}</span>
          </button>
        </div>
      </div>
    </section>
  );
}
