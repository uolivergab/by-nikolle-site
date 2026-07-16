"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

// Seção 3 — Serviços. VALE editorial (design.md item 3): 2 colunas assimétricas
// no desktop — imagem-âncora STICKY à esquerda + menu acordeão à direita (o
// "scroll lateral": a imagem gruda e o menu rola ao lado) — empilhado no mobile.
// Copy 100% do roteiro.md (intocável). Gabarito visual: mock-secao3-servicos-v5.html.

type Service = { name: string; duration: string; price: string; desc: string };
type AddOn = { name: string; price: string; desc: string };
type Category = {
  key: string;
  name: string;
  intro: string;
  items?: Service[];
  addons?: AddOn[];
};

// Categorias, intros, nomes, durações, preços e descrições: roteiro.md Seção 3.
const CATEGORIES: Category[] = [
  {
    key: "signature",
    name: "Signature Facials",
    intro:
      "Organic, personalized rituals focused on nourishment, glow and deep relaxation.",
    items: [
      {
        name: "Deep Pore Detox Facial",
        duration: "75 min",
        price: "$145",
        desc: "Deep cleansing and purification for congested or acne-prone skin.",
      },
      {
        name: "Stimulating Herbal Facial",
        duration: "60 min",
        price: "$140",
        desc: "An invigorating treatment that stimulates circulation, ideal for fatigued or mature skin.",
      },
      {
        name: "Superfood Renewal Facial",
        duration: "60 min",
        price: "$135",
        desc: "A bath of nourishment to restore hydration and vitality to dry, lackluster skin.",
      },
      {
        name: "Soothing Recovery Facial",
        duration: "60 min",
        price: "$125",
        desc: "Calming care to reduce inflammation and strengthen the barrier of sensitive or reactive skin.",
      },
    ],
  },
  {
    key: "advanced",
    name: "Advanced Treatments",
    intro:
      "High performance in cell renewal and targeted skin concerns, with no downtime.",
    items: [
      {
        name: "Pigment Balance Treatment",
        duration: "75 min",
        price: "$165",
        desc: "Focused on improving the appearance of dark spots, melasma and sun damage for a more even, luminous tone.",
      },
      {
        name: "Age Corrective Treatment",
        duration: "75 min",
        price: "$165",
        desc: "Focused on softening fine lines and restoring the skin's firmness and elasticity.",
      },
      {
        name: "Dermal Infusion Micro-Crystal",
        duration: "90 min",
        price: "$230",
        desc: "The gentle alternative to microneedling. Stimulates collagen production and deep skin renewal.",
      },
    ],
  },
  {
    key: "addons",
    name: "Add-Ons",
    intro: "Elevate your session.",
    addons: [
      {
        name: "LED Light Therapy",
        price: "+$25",
        desc: "Reduces inflammation and stimulates collagen.",
      },
      {
        name: "Ultrasound Infusion",
        price: "+$30",
        desc: "Deep hydration through enhanced absorption of active ingredients.",
      },
      {
        name: "Extended Facial Massage",
        price: "+$20",
        desc: "More time for deep relaxation and tension release.",
      },
    ],
  },
];

const MOBILE_QUERY = "(max-width: 980px)";
const DESKTOP_OPEN = CATEGORIES[0].key; // desktop abre a 1ª (Signature)

// Delay (ms) do stagger de reveal por elemento — valor dinâmico (por índice),
// inerte enquanto a seção não está data-live e sob prefers-reduced-motion.
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);
  const [ready, setReady] = useState(false);
  // SSR-safe: estado inicial constante = assunção desktop (Signature aberta),
  // idêntico no servidor e no 1º render do cliente (sem mismatch de hidratação).
  // O matchMedia corrige por largura logo após montar; como a seção nasce abaixo
  // da dobra, a correção do mobile (fechar) não pisca. A transição do painel só
  // liga depois da 1ª resolução (ready), então esse ajuste inicial é instantâneo.
  const [openKey, setOpenKey] = useState<string | null>(DESKTOP_OPEN);

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
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Estado inicial das abas por largura, sem flash: desktop abre a 1ª, mobile
  // todas fechadas. Recalcula ao cruzar o breakpoint (mesma regra do gabarito).
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const apply = () => setOpenKey(mq.matches ? null : DESKTOP_OPEN);
    apply();
    // Liga a transição do painel só depois do ajuste inicial (evita animar o
    // fechamento no mobile ao montar); a partir daí os toques do usuário animam.
    const raf = requestAnimationFrame(() => setReady(true));
    mq.addEventListener("change", apply);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", apply);
    };
  }, []);

  const toggle = (key: string) =>
    setOpenKey((prev) => (prev === key ? null : key));

  return (
    <section
      id="treatments"
      ref={sectionRef}
      data-live={live ? "true" : undefined}
      className="services bg-linen"
    >
      <div className="mx-auto grid max-w-[1160px] grid-cols-1 items-start gap-9 px-6 pt-14 pb-22 min-[981px]:grid-cols-[0.92fr_1.08fr] min-[981px]:gap-[76px] min-[981px]:px-12 min-[981px]:pt-18 min-[981px]:pb-30">
        {/* Coluna imagem — STICKY no desktop (o scroll lateral). Nenhum ancestral
            pode ter overflow, senão o sticky quebra (bug do v4). */}
        <div className="min-[981px]:sticky min-[981px]:top-10">
          <div className="s3-rise relative aspect-[4/3.4] overflow-hidden rounded-[3px] min-[981px]:aspect-[4/5.2]">
            <Image
              src="/images/cena-tratamento-vapor.webp"
              alt="A facial treatment in progress."
              fill
              sizes="(max-width: 980px) calc(100vw - 48px), 500px"
              className="object-cover"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-(image:--s3-frame-veil)"
            />
          </div>
          <p
            className="s3-rise mt-4 font-voice text-[17px] font-medium text-sage italic"
            style={delay(90)}
          >
            Every treatment, tailored to your skin.
          </p>
        </div>

        {/* Coluna menu — título v2, subtítulo e acordeão por categoria. */}
        <div className="min-w-0 pt-1.5">
          <h2
            className="s3-rise font-display text-graphite [font-size:clamp(30px,3.4vw,48px)] leading-[1.05]"
            style={delay(40)}
          >
            {/* Tratamento v2 (mesma acessibilidade do Hero/Method): frase em
                CAIXA ALTA só no visual (aria-hidden, uppercase por CSS) +
                'skin.' em itálico minúsculo peso 500; o leitor de tela lê o
                sr-only em caixa de sentença. */}
            <span className="sr-only">Care designed for your skin.</span>
            <span
              aria-hidden="true"
              className="font-[550] tracking-[0.03em] uppercase"
            >
              Care designed for your{" "}
              <em className="font-voice font-medium tracking-normal normal-case italic">
                skin.
              </em>
            </span>
          </h2>
          <p
            className="s3-rise mt-5 mb-8 max-w-[420px] text-[15.5px] leading-[1.6] text-graphite-soft min-[981px]:mb-13"
            style={delay(110)}
          >
            Real results through a holistic and non-invasive approach.
          </p>

          <div>
            {CATEGORIES.map((cat, c) => {
              const open = openKey === cat.key;
              const panelId = `s3-panel-${cat.key}`;
              const buttonId = `s3-tab-${cat.key}`;
              const base = 180 + c * 80;
              const last = c === CATEGORIES.length - 1;
              return (
                <div
                  key={cat.key}
                  className={cn(
                    // Mobile: divisória cheia entre categorias (a linha d'água
                    // vira divisória, já que o leader sai). Desktop: sem borda.
                    "border-t border-sage/25 min-[981px]:border-t-0",
                    last && "border-b border-sage/25 min-[981px]:border-b-0",
                  )}
                >
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => toggle(cat.key)}
                      className="s3-rise focus-ripple flex w-full items-start gap-4 py-6 text-left min-[981px]:items-center min-[981px]:gap-6 min-[981px]:py-7"
                      style={delay(base)}
                    >
                      <span className="flex-1 font-display font-semibold text-graphite uppercase [font-size:clamp(17px,5.2vw,23px)] leading-[1.15] tracking-[0.05em] min-[981px]:flex-none min-[981px]:[font-size:clamp(21px,2vw,27px)] min-[981px]:leading-[1.05] min-[981px]:tracking-[0.09em] min-[981px]:whitespace-nowrap">
                        {cat.name}
                      </span>
                      <span
                        aria-hidden="true"
                        className="s3-lead hidden h-px min-w-[12px] flex-1 origin-center bg-(image:--s3-leader) min-[981px]:block"
                        style={delay(base + 80)}
                      />
                      <span className="mt-1 flex flex-none items-center gap-2.5 min-[981px]:mt-0">
                        <span className="hidden text-[12px] tracking-[0.14em] text-sage uppercase min-[981px]:inline">
                          View services
                        </span>
                        <svg
                          className={cn(
                            "h-[13px] w-[13px] flex-none text-olive min-[981px]:h-[11px] min-[981px]:w-[11px]",
                            ready && "transition-transform duration-300",
                            "motion-reduce:transition-none",
                            open && "rotate-180",
                          )}
                          viewBox="0 0 12 12"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M2 4.5 L6 8 L10 4.5"
                            stroke="currentColor"
                            strokeWidth="1.3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </button>
                  </h3>

                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className={cn(
                      "grid",
                      ready &&
                        "transition-[grid-template-rows] duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
                      "motion-reduce:transition-none",
                      open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                    )}
                  >
                    <div className="min-h-0 overflow-hidden">
                      <div className="pb-4">
                        <p
                          className="s3-rise mb-5 max-w-[520px] font-voice text-[18px] font-medium text-sage italic leading-[1.4]"
                          style={delay(base + 130)}
                        >
                          {cat.intro}
                        </p>

                        {cat.items?.map((item, i) => (
                          <div
                            key={item.name}
                            className="s3-rise border-t border-sage/10 py-5 first:border-t-0"
                            style={delay(base + 190 + i * 70)}
                          >
                            <div className="flex items-baseline justify-between gap-5">
                              <span className="font-display font-medium text-graphite [font-size:clamp(19px,1.5vw,23px)] leading-[1.2]">
                                {item.name}
                              </span>
                              <span className="text-[13.5px] whitespace-nowrap text-graphite-soft">
                                {item.duration}
                                {" · "}
                                <span className="font-medium text-graphite">
                                  {item.price}
                                </span>
                              </span>
                            </div>
                            <p className="mt-2 max-w-[520px] text-[14px] leading-[1.6] text-graphite-soft">
                              {item.desc}
                            </p>
                          </div>
                        ))}

                        {cat.addons?.map((addon, i) => (
                          <div
                            key={addon.name}
                            className="s3-rise flex items-baseline gap-3 border-t border-sage/[0.09] py-3 first:border-t-0"
                            style={delay(base + 190 + i * 70)}
                          >
                            <span className="font-display text-[18px] font-medium text-graphite">
                              {addon.name}
                            </span>
                            <span className="text-[13px] font-medium whitespace-nowrap text-olive">
                              {addon.price}
                            </span>
                            <span className="flex-1 text-[13.5px] leading-[1.6] text-graphite-soft">
                              {addon.desc}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
