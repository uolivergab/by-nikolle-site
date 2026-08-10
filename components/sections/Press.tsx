"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Interlúdio de Imprensa (design.md item 5b) — seção ENTRE as Vozes e o Sobre.
// Separa a prova emocional (transformações + vozes) da AUTORIDADE institucional
// (imprensa + prêmio). CONCEITO 'press clipping / interlúdio editorial':
// artefatos REAIS (o recorte da Honolulu Magazine + o selo azul real), não
// redesenho. Campo SAND PROFUNDO (o sand estreia como fundo de seção, tom
// guardado, sem cor nova na paleta) com textura de papel (SVG feTurbulence
// dessaturado, multiply) + vinheta morna. SEM vídeo, SEM fundo animado. Copy
// 100% do roteiro.md (intocável). Gabarito: mock-interludio-imprensa-v2.html,
// com o masthead SEM tracinho antes (Gabriel tirou; fere a regra 'sem tracinho
// de overline').
//
// RESTAURADO 10/08 (revisão da Nikolle, WhatsApp 09/08: "the best of Honolulu
// eu quero como estava... Gosto da versão antiga", com o print desta
// composição). A cena editorial de scroll de 27/07-09/08 (340svh, pin, serum)
// saiu; os assets dela seguem em public/images/press/ sem uso.
//
// Reveal por data-live como as demais seções (S2/S3/S5/S6): nasce visível e
// estático sem JS/observer e some em prefers-reduced-motion (o mundo degrada a
// estático). O clipping assenta (fade + rise lento) e o selo 'carimba' logo
// depois (scale 1.06->1 + fade). Coreografia em app/globals.css (Seção 5b).

// Copy do roteiro.md (fonte de verdade). Renderizada via {} para não tropeçar no
// lint de entidades (apóstrofo de Kaka'ako, aspas da citação).
const RULE_TOP = "In the Press · Honolulu · 2024";
const RULE_BOTTOM = "Est. Kaka'ako";
const MASTHEAD = "As seen in Honolulu Magazine";
// Citação REAL da Honolulu Magazine (roteiro.md). A aspa gigante decorativa faz
// as vezes da aspa de abertura, então o texto entra sem as aspas literais.
const CITATION =
  "Coelho delivers bespoke holistic skin rejuvenation. You leave with a radiant glow and a relaxed state of mind.";

// Delay (ms) do stagger de reveal por elemento (valor dinâmico por índice),
// inerte sem data-live e sob prefers-reduced-motion (igual às S3/S5/S6).
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

export function Press() {
  const sectionRef = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);

  // Dispara o reveal quando a seção entra em view (uma vez). Sem observer/JS o
  // conteúdo nasce visível e estático (as animações só existem sob data-live).
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
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-live={live ? "true" : undefined}
      className="press"
    >
      {/* Divisória de cima: filete DUPLO + label correndo (device de revista).
          As divisórias vivem no fundo sand, sem a textura/vinheta do corpo. */}
      <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-6 py-4 min-[881px]:gap-[18px] min-[881px]:px-12">
        <span aria-hidden="true" className="press-rule-line flex-1" />
        <span className="text-[10px] whitespace-nowrap uppercase tracking-[0.32em] text-[color:var(--press-label)]">
          {RULE_TOP}
        </span>
        <span aria-hidden="true" className="press-rule-line flex-1" />
      </div>

      {/* Corpo: sand PROFUNDO + textura de papel + vinheta morna. */}
      <div className="relative overflow-hidden px-6 pt-14 pb-16 min-[881px]:px-12 min-[881px]:pt-20 min-[881px]:pb-20">
        {/* Grão de papel: tile de ruído (feTurbulence dessaturado) rasterizado
            uma vez e repetido via background (barato em dpr alto), multiply
            sutil. O alfa variado do ruído mantém a textura discreta. */}
        <div
          aria-hidden="true"
          className="press-grain pointer-events-none absolute inset-0 z-0 opacity-50 mix-blend-multiply"
        />
        {/* Vinheta morna: brilho linho no centro-topo + toque olive translúcido
            embaixo (profundidade, sem cor nova). */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 bg-(image:--press-vignette)"
        />

        <div className="relative z-[1] mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-14 min-[881px]:grid-cols-[0.9fr_1.1fr] min-[881px]:gap-[88px]">
          {/* ARTEFATO (esquerda no desktop; embaixo no mobile — a história
              respira primeiro). O documento real: clipping da revista + selo
              azul 'carimbado' no canto inferior-direito. */}
          <div className="relative order-2 flex justify-center min-[881px]:order-1">
            <div className="press-clip block w-[min(300px,86%)] min-[881px]:w-[min(360px,100%)]">
              <Image
                src="/images/recorte-revista-honolulu.png"
                alt="Honolulu Magazine feature clipping on by Nikolle"
                width={796}
                height={936}
                quality={90}
                sizes="(max-width: 880px) 300px, 360px"
                className="block h-auto w-full"
              />
            </div>
            <div className="press-stamp absolute right-[2%] -bottom-[26px] h-[104px] w-[104px] min-[881px]:right-[5%] min-[881px]:-bottom-8 min-[881px]:h-[126px] min-[881px]:w-[126px]">
              <Image
                src="/images/selo-best-of-honolulu.png"
                alt="Best of Honolulu 2024 Winner seal"
                width={600}
                height={600}
                sizes="(max-width: 880px) 104px, 126px"
                className="block h-full w-full object-contain"
              />
            </div>
          </div>

          {/* HISTÓRIA (direita no desktop; em cima no mobile). */}
          <div className="order-1 min-[881px]:order-2">
            {/* Masthead — SEM tracinho antes do texto (Gabriel tirou). */}
            <p
              className="press-rise mb-5 text-[11px] uppercase tracking-[0.34em] text-[color:var(--press-label)]"
              style={delay(0)}
            >
              {MASTHEAD}
            </p>

            {/* Headline: Cormorant CAIXA ALTA + 'natural facial' itálico
                minúsculo. Acessibilidade como as outras seções: caixa alta só
                visual (aria-hidden, uppercase por CSS) + sr-only em caixa de
                sentença para o leitor de tela. */}
            <h2
              className="press-rise font-display leading-[1.06] text-graphite [font-size:clamp(28px,3.3vw,46px)]"
              style={delay(90)}
            >
              <span className="sr-only">Named Best natural facial.</span>
              <span
                aria-hidden="true"
                className="font-medium tracking-[0.03em] uppercase"
              >
                {"Named Best "}
                <em className="font-voice font-medium tracking-normal normal-case italic">
                  natural facial.
                </em>
              </span>
            </h2>

            {/* Pull-quote: aspa gigante decorativa (device editorial) + a citação
                real da revista + fólio de atribuição. */}
            <figure
              className="press-rise relative mt-8 max-w-[470px]"
              style={delay(180)}
            >
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-8 -left-1.5 z-0 font-display text-[88px] leading-none text-olive/30 italic select-none min-[881px]:-top-10 min-[881px]:text-[110px]"
              >
                {"“"}
              </span>
              <blockquote className="relative z-[1] font-display text-[clamp(19px,1.8vw,25px)] font-medium leading-[1.5] text-graphite">
                {CITATION}
              </blockquote>
              {/* Fólio (atribuição real): 'Honolulu Magazine' em olive
                  (aprofundado por AA), o resto em graphite-soft. */}
              <figcaption className="mt-4 text-[11px] uppercase tracking-[0.18em] text-graphite-soft">
                <span className="font-medium text-[color:var(--press-label)]">
                  Honolulu Magazine
                </span>
                {" · Best of Honolulu 2024 Winner"}
              </figcaption>
            </figure>
          </div>
        </div>
      </div>

      {/* Divisória de baixo: filete DUPLO + label. */}
      <div className="mx-auto flex max-w-[1200px] items-center gap-4 px-6 py-4 min-[881px]:gap-[18px] min-[881px]:px-12">
        <span aria-hidden="true" className="press-rule-line flex-1" />
        <span className="text-[10px] whitespace-nowrap uppercase tracking-[0.32em] text-[color:var(--press-label)]">
          {RULE_BOTTOM}
        </span>
        <span aria-hidden="true" className="press-rule-line flex-1" />
      </div>
    </section>
  );
}
