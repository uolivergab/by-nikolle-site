"use client";

import { useEffect, useRef, useState } from "react";

// Seção 6b — Coming Soon: Integrative Wellness Coaching Program (roteiro.md,
// revisão Nikolle 26/07: a Nik quer esta seção À VISTA na home, fora dos
// programas). POSIÇÃO: entre o Sobre e o FAQ (as credenciais de Integrative
// Nutrition e Ayurveda acabam de aparecer no Sobre; o programa nasce delas, e
// o FAQ logo abaixo responde quando começa). FORMA: estreia do CARD 'pedra
// sobre o linho' (design.md: bg sand, radius 16px, sem borda dura, sombra
// quase nula e difusa) com os MENISCOS da forma-assinatura em 2 cantos opostos
// se desenhando no reveal. SEM CTA: não há o que agendar ainda; anúncio quieto.
// Título dela repartido no display: 'COMING SOON' (fragmento do título dela) +
// 'INTEGRATIVE WELLNESS / COACHING program' no tratamento v2 (precedente do
// S4: 'program' itálico minúsculo); sr-only carrega o título integral. O
// travessão do texto original virou ponto (regra 7).

// Delay (ms) do stagger de reveal (inline por índice).
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

// Menisco: fio côncavo (quarto de arco) da forma-assinatura. Comprimento do
// path ~58px; o dasharray 64 do CSS cobre o traçado inteiro no stroke draw.
function Menisco({ className }: { className?: string }) {
  return (
    <svg
      className={`cs-menisco ${className ?? ""}`}
      width="40"
      height="40"
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

export function ComingSoon() {
  const sectionRef = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);

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
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      data-live={live ? "true" : undefined}
      className="coming bg-linen"
    >
      <div className="mx-auto max-w-[760px] px-6 py-14 min-[881px]:py-20">
        <div
          className="cs-rise relative rounded-[16px] bg-sand px-7 py-12 text-center shadow-[0_18px_50px_-30px_color-mix(in_srgb,var(--graphite)_18%,transparent)] min-[881px]:px-16 min-[881px]:py-16"
          style={delay(0)}
        >
          {/* Meniscos em 2 cantos OPOSTOS (lei do card): desenham no reveal. */}
          <Menisco className="absolute top-2.5 left-2.5 text-sage" />
          <Menisco className="absolute right-2.5 bottom-2.5 rotate-180 text-sage" />

          <h2>
            <span className="sr-only">
              Coming Soon: Integrative Wellness Coaching Program
            </span>
            <span aria-hidden="true">
              <span
                className="cs-rise block text-[11px] tracking-[0.28em] text-graphite-soft uppercase"
                style={delay(100)}
              >
                Coming Soon
              </span>
              <span
                className="cs-rise mt-5 block font-display leading-[1.12] font-[550] tracking-[0.03em] text-graphite uppercase [font-size:clamp(16px,6vw_-_3px,38px)]"
                style={delay(180)}
              >
                <span className="whitespace-nowrap">Integrative Wellness</span>
                <br />
                {"Coaching "}
                <em className="font-voice font-medium tracking-normal normal-case whitespace-nowrap italic">
                  program
                </em>
              </span>
            </span>
          </h2>

          <p
            className="cs-rise mx-auto mt-7 max-w-[52ch] text-[15px] leading-[1.75] text-graphite-soft min-[881px]:text-[15.5px]"
            style={delay(260)}
          >
            Rooted in Integrative Nutrition and Ayurvedic principles, our
            upcoming wellness programs are designed to support lasting health,
            balance, and vitality through personalized guidance in nutrition,
            lifestyle, and mindful living. A deeper journey toward well-being
            from the inside out. Coming soon.
          </p>
        </div>
      </div>
    </section>
  );
}
