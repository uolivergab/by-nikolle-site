"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Seção 7 — FAQ. VALE (design.md item 7): acordeão limpo NUMERADO, campo linho,
// muito ar, um aberto por vez. Copy 100% do roteiro.md (revisão Nikolle 26/07:
// 10 perguntas novas + 'Where are you located?' mantida do roteiro anterior).
// Indicador = "+" de fios d'água: traço horizontal sage permanente + vertical
// que se recolhe ao abrir; o horizontal ONDULA uma vez na abertura (gesto da
// marca; keyframes no globals.css, bloco Seção 7). Painel anima por
// grid-template-rows 0fr->1fr (mesma mecânica dos Serviços). Reveal por
// data-live como as demais vales; tudo degrada em prefers-reduced-motion.

type FaqItem = { q: string; a: string[] };

// Quantas perguntas ficam à vista antes do "More Info" (revisão 30/07).
const VISIBLE_COUNT = 5;

const ITEMS: FaqItem[] = [
  {
    q: "Is holistic skincare effective?",
    a: [
      "Yes. Holistic skincare can be highly effective because it addresses both the external and internal factors that influence skin health. While professional treatments support the skin directly, factors such as nutrition, lifestyle, stress, sleep, and overall well-being also play an important role in achieving healthy, radiant skin.",
    ],
  },
  {
    q: "What makes your approach different from traditional facials?",
    a: [
      "My approach goes beyond treating the surface of the skin. Each treatment is customized and combines advanced non-invasive techniques, natural and organic skincare, facial massage, and holistic principles to support long-term skin health, balance, and overall well-being.",
    ],
  },
  {
    q: "Do you treat melasma and hyperpigmentation?",
    a: [
      "Yes. I specialize in supporting clients with melasma and hyperpigmentation through a holistic and integrative approach. Because melasma is a complex condition influenced by multiple internal and external factors, treatment focuses on improving skin health, reducing triggers, protecting the skin barrier, and creating sustainable lifestyle and skincare practices.",
    ],
  },
  {
    q: "How long does it take to see results with melasma?",
    a: [
      "Every skin is unique, and results vary depending on the severity of pigmentation, lifestyle factors, home-care consistency, and overall health. Many clients begin noticing improvements within a few months, but melasma requires patience, consistency, and a long-term approach for lasting results.",
    ],
  },
  {
    q: "Will my melasma completely disappear?",
    a: [
      "Melasma is often considered a chronic skin condition, which means management and prevention are key. While significant improvement is possible, the goal is to reduce pigmentation, strengthen skin health, minimize flare-ups, and help you maintain healthier, more balanced skin long-term.",
    ],
  },
  {
    q: "Do I need to use natural products at home?",
    a: [
      "Yes. At By Nikolle, we believe that what we put on our skin matters. Our philosophy is centered on using clean, skin-supportive products that nurture the skin barrier while minimizing unnecessary exposure to potentially harmful ingredients.",
      "We educate our clients on the importance of a more conscious, less toxic approach to skincare and wellness, supporting healthy skin and overall well-being from the inside out.",
    ],
  },
  {
    q: "Do you offer aggressive or invasive treatments?",
    a: [
      "No. My philosophy is centered around non-invasive yet effective treatments that work in harmony with the skin rather than compromising its integrity. I believe healthy, resilient skin is the foundation for lasting results.",
    ],
  },
  {
    q: "Is your approach only focused on skincare products?",
    a: [
      "No. Skin health is influenced by many factors, including nutrition, stress, sleep, digestion, hormones, and lifestyle habits. When appropriate, we may explore these aspects to better support your skin and overall well-being.",
    ],
  },
  {
    q: "How often should I receive treatments?",
    a: [
      "Treatment frequency depends on your skin concerns and goals. For clients working on concerns such as melasma or age management, treatments every 3-6 weeks are generally recommended, along with a consistent home-care routine.",
    ],
  },
  {
    q: "When will the Integrative Wellness Program begin, and what will it include?",
    a: [
      "Integrative wellness programs are expected to launch by the end of this year or early 2027. These programs are being thoughtfully developed and structured to better support clients seeking a deeper, more holistic approach to health and well-being.",
      "Rooted in integrative nutrition and Ayurvedic principles, the programs will offer personalized guidance on nutrition, lifestyle, stress management, and holistic wellness practices to support both skin health and overall well-being. More details coming soon.",
    ],
  },
  {
    q: "Where are you located?",
    a: [
      "We are inside the welcoming Moa Wellness Center in Kakaʻako, with free parking available for your comfort.",
    ],
  },
];

// Delay (ms) do stagger de reveal por elemento (inline por índice, como S3/S6).
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

export function Faq() {
  const sectionRef = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  // REVISÃO 30/07 (item 6 da Nikolle): a seção "ficou muito comprida". Mesmo
  // com todas as perguntas fechadas, 11 linhas empilhadas são muito chão. As
  // primeiras ficam à vista e o resto entra pelo botão "More Info" (rótulo que
  // ela mesma sugeriu). Nada de conteúdo saiu.
  const [showAll, setShowAll] = useState(false);

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
      { threshold: 0.1 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const toggle = (i: number) =>
    setOpenIdx((prev) => (prev === i ? null : i));

  return (
    <section
      id="faq"
      ref={sectionRef}
      data-live={live ? "true" : undefined}
      className="faq bg-linen"
    >
      <div className="mx-auto max-w-[800px] px-6 py-16 min-[881px]:py-24">
        <h2
          className="f7-rise font-display leading-[1.12] text-graphite [font-size:clamp(18px,7.2vw_-_4px,42px)] min-[881px]:leading-[1.08]"
          style={delay(0)}
        >
          {/* Tratamento v2 (acessibilidade espelhada das demais seções): caixa
              alta só visual + 'booking.' em itálico minúsculo; sr-only em caixa
              de sentença; 2 linhas fixas, cada uma nowrap. */}
          <span className="sr-only">
            What you need to know before booking.
          </span>
          <span
            aria-hidden="true"
            className="font-[550] tracking-[0.03em] whitespace-nowrap uppercase"
          >
            What you need to know
            <br />
            {"before "}
            <em className="font-voice font-medium normal-case tracking-normal whitespace-nowrap italic">
              booking.
            </em>
          </span>
        </h2>

        <div id="faq-list" className="mt-10 min-[881px]:mt-14">
          {ITEMS.map((item, i) => {
            const open = openIdx === i;
            const num = String(i + 1).padStart(2, "0");
            const panelId = `faq-panel-${i}`;
            const buttonId = `faq-q-${i}`;
            return (
              <div
                key={item.q}
                data-open={open ? "true" : undefined}
                hidden={!showAll && i >= VISIBLE_COUNT}
                className={cn(
                  "f7-rise border-t border-sage/20",
                  // A borda de baixo acompanha o último item VISÍVEL.
                  (showAll
                    ? i === ITEMS.length - 1
                    : i === VISIBLE_COUNT - 1) && "border-b border-sage/20",
                )}
                style={delay(120 + Math.min(i, VISIBLE_COUNT) * 60)}
              >
                <h3>
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => toggle(i)}
                    className="focus-ripple flex w-full items-baseline gap-5 py-6 text-left min-[881px]:gap-7"
                  >
                    <span className="w-7 flex-none text-[11px] leading-[normal] tracking-[0.18em] text-graphite-soft tabular-nums">
                      {num}
                    </span>
                    <span className="flex-1 font-display font-medium leading-[1.3] text-graphite [font-size:clamp(18px,4.6vw,22px)]">
                      {item.q}
                    </span>
                    {/* Indicador "+" de fios d'água: o vertical se recolhe ao
                        abrir; o horizontal ondula uma vez (globals.css). */}
                    <span
                      aria-hidden="true"
                      className="relative h-[14px] w-[14px] flex-none self-center"
                    >
                      <span className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2">
                        <span className="faq-dash-h block h-px w-full bg-sage" />
                      </span>
                      <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2">
                        <span className="faq-dash-v block h-full w-px bg-sage" />
                      </span>
                    </span>
                  </button>
                </h3>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  className={cn(
                    "grid transition-[grid-template-rows] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <div className="max-w-[62ch] pb-7 pl-12 min-[881px]:pl-14">
                      {item.a.map((p) => (
                        <p
                          key={p.slice(0, 24)}
                          className="mb-3 text-[15px] leading-[1.7] text-graphite-soft last:mb-0"
                        >
                          {p}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Gatilho do resto das perguntas. Some depois de aberto: a lista
            inteira já está à vista e não há copy sancionada para o rótulo
            inverso. */}
        {!showAll && (
          <div className="f7-rise mt-9" style={delay(120 + VISIBLE_COUNT * 60)}>
            <button
              type="button"
              onClick={() => setShowAll(true)}
              aria-controls="faq-list"
              className="focus-ripple group inline-flex cursor-pointer items-center gap-3 border-b border-olive/45 pb-2 text-[11.5px] uppercase leading-[normal] tracking-[0.22em] text-graphite transition-colors hover:border-olive"
            >
              More Info
              <svg
                width="13"
                height="8"
                viewBox="0 0 13 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className="transition-transform duration-300 group-hover:translate-y-0.5 motion-reduce:transition-none"
              >
                <path
                  d="M1 1.5 6.5 6.5 12 1.5"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
