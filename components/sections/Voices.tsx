"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// Seção 5v — VOZES "A Carta" (design.md item 5v; gabarito mock-s5-vozes-v5.html,
// design FECHADO). Fica ENTRE as Transformações (S5) e o Interlúdio de Imprensa.
// Campo linho limpo, sem vídeo. ÍNDICE à esquerda (01-04 + nomes; filete d'água
// na ativa; clique navega) + MESA à direita com PILHA DE CARTAS (top legível +
// under1/under2 espiando + hidden; a que sai voa em 'leaving'). As 3 vidas
// (lightplay, linha d'água que se desenha, tilt) vivem no globals.css bloco 5v
// e em handlers por ref (nunca useState para posição de mouse). Troca auto 7s,
// hover na mesa PAUSA, clique no índice reinicia o relógio. MESA AUTO-
// DIMENSIONADA: mede a carta mais alta (paddings + citação + assinatura) no
// mount, no resize e pós-fontes (correção do corte no mobile, mock v5).
//
// TÍTULO: o oficial novo da Nikolle (revisão 26/07) 'Kind words from our
// clients' no tratamento v2. DESVIO DECLARADO do mock: o eyebrow 'Voices' SAIU
// (a S5 logo acima já tem eyebrow e o título novo se explica sozinho; decisão
// desta build, Gabriel pode devolver). Excerpts de display do roteiro.md
// (completos lá como fonte; ok final da Nik pendente).

type Voice = { text: string; who: string };

const VOICES: Voice[] = [
  {
    text: "I was skeptical after countless treatments for my melasma, but Nikolle's method truly transformed my skin. My melasma has noticeably faded.",
    who: "Melani S.",
  },
  {
    text: "She encouraged me to be patient and trust the process. My skin became brighter, healthier, with almost no signs of hyperpigmentation.",
    who: "Ashley B.",
  },
  {
    text: "Nikolle's treatments are unlike anything I've experienced before. Her knowledge, gentle touch and personalized care have transformed my skin.",
    who: "Sara M.",
  },
  {
    text: "Nikolle and her expertise are a delight and gift to Honolulu. A top-tier, pampered experience.",
    who: "Ali Z.",
  },
];

const ROTATE_MS = 7000;
const LEAVE_REPAINT_MS = 60;

// Delay (ms) do stagger de reveal (inline por índice, como as demais seções).
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

// Posição de cada carta na pilha relativa à ativa.
const posClass = (k: number, active: number) => {
  const pos = (k - active + VOICES.length) % VOICES.length;
  if (pos === 0) return "vz-top";
  if (pos === 1) return "vz-under1";
  if (pos === 2) return "vz-under2";
  return "vz-hiddenpos";
};

export function Voices() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const deskRef = useRef<HTMLDivElement>(null);
  const letterRefs = useRef<(HTMLElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeRef = useRef(0);

  const [live, setLive] = useState(false);
  const [stack, setStack] = useState({ active: 0, leaving: -1 });
  const [deskH, setDeskH] = useState<number | undefined>(undefined);

  // Espelho da ativa para handlers imperativos (tilt/timer) sem stale closure.
  useEffect(() => {
    activeRef.current = stack.active;
  }, [stack.active]);

  // Reveal quando a seção entra em view (uma vez); sem JS tudo nasce visível.
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

  // MESA AUTO-DIMENSIONADA (mock v5): a mesa mede a carta mais alta
  // (padding + citação + 22px + assinatura) e reserva +34px pra pilha atrás.
  useEffect(() => {
    const measure = () => {
      let maxH = 0;
      letterRefs.current.forEach((letter) => {
        if (!letter) return;
        const cs = getComputedStyle(letter);
        const quote = letter.querySelector("p");
        const who = letter.querySelector(".vz-who");
        if (!quote || !who) return;
        const h =
          parseFloat(cs.paddingTop) +
          quote.getBoundingClientRect().height +
          22 +
          who.getBoundingClientRect().height +
          parseFloat(cs.paddingBottom);
        if (h > maxH) maxH = h;
      });
      if (maxH > 0) setDeskH(Math.ceil(maxH + 34));
    };
    measure();
    document.fonts?.ready.then(measure);
    let raf = 0;
    const onResize = () => {
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          measure();
        });
      }
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  // A carta que saiu ('leaving') reentra na pilha logo depois (repaint do mock).
  useEffect(() => {
    if (stack.leaving < 0) return;
    const t = setTimeout(
      () => setStack((s) => ({ ...s, leaving: -1 })),
      LEAVE_REPAINT_MS,
    );
    return () => clearTimeout(t);
  }, [stack.leaving]);

  const goTo = useCallback((n: number) => {
    setStack((s) => {
      const next = ((n % VOICES.length) + VOICES.length) % VOICES.length;
      if (next === s.active) return s;
      // limpa o tilt inline da carta que está saindo
      const top = letterRefs.current[s.active];
      if (top) top.style.transform = "";
      return { active: next, leaving: s.active };
    });
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);
  const startTimer = useCallback(() => {
    if (reduced) return;
    stopTimer();
    timerRef.current = setInterval(
      () => goTo(activeRef.current + 1),
      ROTATE_MS,
    );
  }, [reduced, stopTimer, goTo]);

  useEffect(() => {
    startTimer();
    return stopTimer;
  }, [startTimer, stopTimer]);

  // TILT: o papel inclina seguindo o mouse (só hover-capable, nunca em
  // reduced-motion). Escrita direta no DOM por ref (sem re-render).
  const onDeskMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (reduced || !window.matchMedia("(hover: hover)").matches) return;
    const desk = deskRef.current;
    const top = letterRefs.current[activeRef.current];
    if (!desk || !top) return;
    const r = desk.getBoundingClientRect();
    const x = (event.clientX - r.left) / r.width - 0.5;
    const y = (event.clientY - r.top) / r.height - 0.5;
    top.style.transition = "transform .25s ease";
    top.style.transform = `rotate(-.8deg) rotateY(${x * 2.6}deg) rotateX(${-y * 2.2}deg)`;
  };
  const onDeskLeave = () => {
    const top = letterRefs.current[activeRef.current];
    if (top) {
      top.style.transition = "";
      top.style.transform = "";
    }
    startTimer();
  };

  return (
    <section
      ref={sectionRef}
      data-live={live ? "true" : undefined}
      className="voices overflow-hidden border-t border-olive/[0.08] bg-linen"
    >
      <div className="mx-auto max-w-[1240px] px-6 py-[70px] min-[881px]:px-14 min-[881px]:pt-[104px] min-[881px]:pb-[118px]">
        <div
          className="vz-rise mb-8 max-w-[680px] min-[881px]:mb-14"
          style={delay(0)}
        >
          <h2 className="font-display leading-[1.1] text-graphite [font-size:clamp(26px,3vw,42px)]">
            <span className="sr-only">Kind words from our clients</span>
            <span
              aria-hidden="true"
              className="font-[550] tracking-[0.03em] whitespace-nowrap uppercase"
            >
              Kind words from
              <br />
              {"our "}
              <em className="font-voice font-medium normal-case tracking-normal italic">
                clients
              </em>
            </span>
          </h2>
        </div>

        <div
          className="vz-rise grid grid-cols-1 items-center gap-[30px] min-[881px]:grid-cols-[minmax(230px,0.4fr)_1fr] min-[881px]:gap-[76px]"
          style={delay(140)}
        >
          {/* ÍNDICE: 01-04 + nomes; filete d'água na ativa; clique navega.
              Mobile: vira linha horizontal no topo (filete horizontal). */}
          <div className="flex gap-0.5 border-t border-olive/[0.16] min-[881px]:block min-[881px]:border-t-0 min-[881px]:border-l">
            {VOICES.map((voice, n) => {
              const on = stack.active === n;
              return (
                <button
                  key={voice.who}
                  type="button"
                  data-on={on ? "true" : undefined}
                  aria-pressed={on}
                  onClick={() => {
                    goTo(n);
                    startTimer();
                  }}
                  className={cn(
                    "vz-ientry focus-ripple group relative flex cursor-pointer text-left",
                    "-mt-px flex-col gap-1 pt-3 pr-2.5",
                    "min-[881px]:mt-0 min-[881px]:-ml-px min-[881px]:flex-row min-[881px]:items-baseline min-[881px]:gap-4 min-[881px]:py-[18px] min-[881px]:pr-0 min-[881px]:pl-7",
                  )}
                >
                  <span aria-hidden="true" className="vz-wmark" />
                  <span className="font-display text-[15px] text-graphite-soft/70 transition-colors duration-300 group-data-[on=true]:text-olive">
                    {`0${n + 1}`}
                  </span>
                  <span className="text-[9px] tracking-[0.1em] text-graphite-soft uppercase transition-all duration-300 group-hover:text-olive group-data-[on=true]:text-graphite min-[881px]:text-[11.5px] min-[881px]:tracking-[0.17em] min-[881px]:group-data-[on=true]:tracking-[0.2em]">
                    {voice.who}
                  </span>
                </button>
              );
            })}
          </div>

          {/* MESA: pilha de cartas, altura medida pela carta mais alta. */}
          <div
            ref={deskRef}
            onMouseMove={onDeskMove}
            onMouseEnter={stopTimer}
            onMouseLeave={onDeskLeave}
            style={deskH ? { height: deskH } : undefined}
            className="relative min-h-[320px] transition-[height] duration-[400ms] ease-out [perspective:1100px] motion-reduce:transition-none"
          >
            {VOICES.map((voice, k) => (
              <article
                key={voice.who}
                ref={(el) => {
                  letterRefs.current[k] = el;
                }}
                aria-hidden={stack.active === k ? undefined : "true"}
                className={cn(
                  "vz-letter p-[40px_28px_30px] min-[881px]:p-[52px_54px_40px]",
                  stack.leaving === k
                    ? "vz-leaving"
                    : posClass(k, stack.active),
                )}
              >
                <span aria-hidden="true" className="vz-grain" />
                <span aria-hidden="true" className="vz-lightplay" />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute top-4 left-[30px] font-display text-[84px] leading-none text-olive/[0.26] italic select-none"
                >
                  {"“"}
                </span>
                <p className="relative font-voice text-[clamp(19px,1.75vw,25px)] leading-[1.55] font-medium text-graphite italic">
                  {voice.text}
                </p>
                <div className="vz-who relative mt-[22px] flex items-center gap-3.5">
                  <span aria-hidden="true" className="vz-wline" />
                  <span className="text-[11px] tracking-[0.17em] text-olive uppercase">
                    {voice.who}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
