"use client";

import { useEffect, useRef, useState } from "react";
import { IconSkin } from "@/components/icons/IconSkin";
import { IconNourish } from "@/components/icons/IconNourish";
import { IconBalance } from "@/components/icons/IconBalance";
import { cn } from "@/lib/utils";

// Seção 2 — A Filosofia (Os Três Pilares). VALE editorial: cascata diagonal no
// desktop, carrossel no mobile, muito ar. Copy 100% do roteiro.md (intocável).
//
// REVERTIDA 30/07 POR ORDEM DA CLIENTE. A narrativa de scroll (cena sticky de
// 350vh com 5 estados) foi retirada: a Nikolle reprovou por NAVEGAÇÃO, não por
// estética. Nas palavras dela, "ele está lento e não está dando para navegar no
// site... meio que obriga a pessoa a estar presa ali. Eu gosto que o site seja
// fluido". O Gabriel confirmou que já era uma queixa recorrente de clientes.
// Ela tem razão e a lei do projeto também: o design.md proíbe scroll-hijack, e
// prender 3.5 telas de rolagem para entregar 3 parágrafos é exatamente isso.
//
// O QUE VOLTOU: a estrutura que ela aprovou (recuperada do commit e16f389).
// O QUE FICOU DA ONDA DEPOIS DELA: a copy nova (eyebrow, título, pilares 1 e 3),
// os ícones Skin<->Balance trocados como ela pediu, e o CTA da seção.
// O QUE SAIU JUNTO: o portal fotográfico, a linha conectiva, os ícones de traço
// e o fundo botânico do amanhecer (que fica sem uso; ver pendências).

// Palavras da filosofia (roteiro.md, revisão 26/07). Marquee decorativo,
// aria-hidden. Os ícones por palavra que o roteiro pede seguem [DECISÃO GABRIEL]
// (desenho a definir), então não entram inventados.
const MARQUEE_WORDS = [
  "Integrative Wellness",
  "Natural & Organic",
  "Reset",
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
  body: string;
};

// ÍCONES TROCADOS entre Skin e Balance (pedido da Nikolle na revisão de julho:
// "estavam meio que não fazendo sentido no lugar que eles estavam"). Nourish
// fica onde estava.
const PILLARS: Pillar[] = [
  {
    key: "skin",
    title: "Skin",
    Icon: IconBalance,
    body: "Holistic, non-invasive treatments that strengthen the skin barrier and support your skin's natural ability to heal, renew, and thrive. Lasting results without aggressive treatments.",
  },
  {
    key: "nourishment",
    title: "Nourishment",
    Icon: IconNourish,
    body: "True beauty is nourished from the inside out. We pair aesthetics with lifestyle, integrative nutrition and practices that feed your body and your vitality.",
  },
  {
    key: "balance",
    title: "Balance",
    Icon: IconSkin,
    body: "An integrative approach that supports harmony between body, mind, and nervous system through calm, connection, and intentional daily rituals.",
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
              className="px-11 font-voice text-[16px] italic text-olive"
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1140px] px-6 py-16 min-[761px]:px-16 min-[761px]:py-28">
        <p className="text-[11.5px] uppercase tracking-[0.28em] text-graphite-soft">
          The By Nikolle Philosophy
        </p>
        <h2 className="mt-5 mb-11 max-w-[620px] font-display text-[clamp(22px,6.4vw,42px)] leading-[1.1] text-graphite min-[761px]:mb-20">
          <span className="sr-only">Discover our three pillars</span>
          {/* Tratamento v2 (mesmo do resto do site): frase estrutural em CAIXA
              ALTA (uppercase só visual, no span aria-hidden) + a palavra
              emocional em itálico minúsculo. O leitor de tela lê o sr-only em
              caixa de sentença; a quebra fixa vem do <br/>, cada linha nowrap. */}
          <span
            aria-hidden="true"
            className="font-[550] tracking-[0.03em] whitespace-nowrap uppercase"
          >
            Discover our
            <br />
            {"three "}
            <em className="font-voice font-medium normal-case tracking-normal whitespace-nowrap italic">
              pillars
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
            <svg
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M15.5 6h-14M6.4 1.2 1.5 6l4.9 4.8"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
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
            <svg
              width="16"
              height="12"
              viewBox="0 0 16 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M0.5 6h14M9.6 1.2 14.5 6l-4.9 4.8"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        {/* CTA da seção (roteiro.md, briefing 27/07): leva ao Sobre, onde a
            filosofia é contada em 1ª pessoa. */}
        <div className="mt-12 min-[761px]:mt-16">
          <a
            href="#about"
            className="focus-ripple group inline-flex items-center gap-3 border-b border-olive/45 pb-2 text-[11.5px] uppercase leading-[normal] tracking-[0.22em] text-graphite transition-colors hover:border-olive min-[761px]:text-[12px]"
          >
            Explore the Philosophy
            <svg
              width="15"
              height="10"
              viewBox="0 0 15 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none"
            >
              <path
                d="M0.5 5h13M9.6 1.2 13.5 5l-3.9 3.8"
                stroke="currentColor"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
