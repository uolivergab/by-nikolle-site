"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// Seção 5 — Prova Social. VALE de leitura (design.md item 5, REORGANIZADO): só a
// prova EMOCIONAL (transformações + vozes). A AUTORIDADE (selo + revista) SAIU
// daqui e virou o Interlúdio de Imprensa (S5b, Press.tsx). Título no TOPO
// (contexto antes da prova) + corpo em 2 colunas ANCORADAS NO TOPO — prancha
// before/after MODERADA à esquerda + voz em CITAÇÃO EDITORIAL à direita (aspa
// gigante como teto, mesmo device do interlúdio, criando parentesco entre as
// duas seções de prova). Copy 100% do roteiro.md (intocável). Gabarito:
// mock-secao5-prova-v3.html + mock-secao5-prova-reorg-v2.html. Reveal por
// data-live (S2/S3); some em prefers-reduced-motion. SEM sombra botânica (S4).

// Pranchas before/after (fotos CRUAS, sem tratamento — design.md). A -01 fica
// FORA por consistência (é empilhada; quebra a leitura lado a lado). Uma por
// vez, cross-fade suave, navegação MANUAL (dots + setas), sem autoplay.
const PLATES = [
  "/images/before-after-02.webp",
  "/images/before-after-03.webp",
  "/images/before-after-04.webp",
];

type Testimonial = {
  quote: string;
  name: string;
  city: string;
  // Info de tratamento real (claim clínico). Fica null até a Nik enviar o dado
  // verdadeiro; NUNCA inventar (design.md, roteiro.md). Quando existir, aparece
  // logo abaixo da atribuição, pareado à voz correta.
  treatment: string | null;
};

// Voz da cliente — em Cormorant itálico, rotação lenta (~7s) em fade-swap limpo
// e INDEPENDENTE das pranchas (são pessoas diferentes; parear implicaria autoria
// falsa). Texto integral do roteiro.md, SEM aspas de texto: a aspa gigante de
// abertura (teto da citação) já faz esse papel.
// [PLACEHOLDER] — trocar pelos depoimentos reais da Nik antes do go-live público.
const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "After years of harsh treatments that never faded my melasma, I doubted anything gentle could work. A few months into the Pigment Balance treatments, my skin tone is more even than it has been in a decade.",
    name: "Leah",
    city: "Kaimuki",
    treatment: null,
  },
  {
    quote:
      "My skin was so reactive I was afraid of facials. Nikolle rebuilt my barrier little by little, and my face feels calm for the first time in years.",
    name: "Marina",
    city: "Manoa",
    treatment: null,
  },
  {
    quote:
      "I came for the glow and stayed for how I feel when I leave. It is the only appointment I never move.",
    name: "Dana",
    city: "Kailua",
    treatment: null,
  },
];

const VOICE_HOLD = 7000; // ~7s por voz (design.md)
const VOICE_FADE = 500; // fade-out antes da troca (casado com duration-500 abaixo)

// O depoimento visualmente mais longo reserva a altura do bloco de voz (um
// sizer invisível): a coluna não "pula" quando a voz troca de comprimento (a
// água fica parada). Mesmo princípio do sizer do slot vivo do Hero.
const LONGEST = TESTIMONIALS.reduce((a, b) =>
  b.quote.length > a.quote.length ? b : a,
);

// Voz da cliente: Cormorant itálico 500, um pouco maior que antes (é a voz, o
// coração da prova). Métricas idênticas no sizer e no visível para a reserva de
// altura bater exatamente (só a cor difere).
const QUOTE_CLS =
  "font-voice text-[clamp(21px,1.9vw,28px)] font-medium leading-[1.5] italic";

// Atribuição como CHÃO da citação: um filete d'água curto (linha sage em degradê
// para transparente, a forma-assinatura na horizontal) como piso + nome·local.
// graphite-soft no nome preserva AA (sage em texto pequeno reprova; mesmo desvio
// consciente já adotado na S2/S5). Mesma marcação no sizer e no visível para a
// reserva de altura bater.
function Attribution({ name, city }: { name: string; city: string }) {
  return (
    <div className="mt-7">
      <span
        aria-hidden="true"
        className="block h-px w-11 bg-[linear-gradient(90deg,color-mix(in_srgb,var(--sage)_78%,transparent),transparent)]"
      />
      <div className="mt-3 text-[12px] uppercase tracking-[0.16em] text-graphite-soft">
        {name}
        {" · "}
        {city}
      </div>
    </div>
  );
}

// Delay (ms) do stagger de reveal por elemento (valor dinâmico por índice),
// inerte sem data-live e sob prefers-reduced-motion (igual à S3).
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

export function Proof() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);

  // Prancha ativa (manual, sem autoplay).
  const [plate, setPlate] = useState(0);

  // Voz ativa + porta de opacidade do fade-swap. O texto trocado vive num ÚNICO
  // nó: ele some (opacidade 0), o conteúdo troca no escuro, e reaparece — nunca
  // sobrepor/empilhar dois depoimentos (bug de uma versão anterior).
  const [voice, setVoice] = useState(0);
  const [voiceShown, setVoiceShown] = useState(true);

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

  // Rotação lenta das vozes em fade-swap limpo. Com prefers-reduced-motion a
  // rotação PARA (voz estática, mesma decisão do slot vivo do Hero): sem troca,
  // sem fade.
  useEffect(() => {
    if (reduced || TESTIMONIALS.length < 2) return;
    let swap: ReturnType<typeof setTimeout>;
    const tick = setInterval(() => {
      setVoiceShown(false); // fade-out
      swap = setTimeout(() => {
        setVoice((v) => (v + 1) % TESTIMONIALS.length); // troca no escuro
        setVoiceShown(true); // fade-in
      }, VOICE_FADE);
    }, VOICE_HOLD);
    return () => {
      clearInterval(tick);
      clearTimeout(swap);
    };
  }, [reduced]);

  const goPlate = (dir: number) =>
    setPlate((p) => (p + dir + PLATES.length) % PLATES.length);

  const t = TESTIMONIALS[voice];

  return (
    <section
      ref={sectionRef}
      data-live={live ? "true" : undefined}
      className="proof bg-linen"
    >
      <div className="mx-auto max-w-[1200px] px-6 pt-13 pb-20 min-[881px]:px-12 min-[881px]:pt-20 min-[881px]:pb-26">
        {/* Título no TOPO (contexto antes da prova). */}
        <div className="mb-7 max-w-[640px] min-[881px]:mb-14">
          <p
            className="s5-rise mb-4 text-[11px] uppercase tracking-[0.28em] text-graphite-soft"
            style={delay(0)}
          >
            Real results
          </p>
          <h2
            className="s5-rise font-display leading-[1.08] text-graphite [font-size:clamp(26px,3vw,42px)]"
            style={delay(60)}
          >
            {/* Tratamento v2 (mesma acessibilidade do Hero/Method/Services):
                frase em CAIXA ALTA só no visual (aria-hidden, uppercase por CSS)
                + 'results' em itálico minúsculo peso 500 (única palavra itálica
                do título); o leitor de tela lê o sr-only em caixa de sentença. A
                quebra fixa em 2 linhas vem do <br/> (depois da vírgula); cada
                linha em nowrap, com o clamp dimensionado para caber. */}
            <span className="sr-only">Real experiences, natural results.</span>
            <span
              aria-hidden="true"
              className="font-[550] tracking-[0.03em] whitespace-nowrap uppercase"
            >
              Real experiences,
              <br />
              {"Natural "}
              <em className="font-voice font-medium tracking-normal normal-case italic">
                results.
              </em>
            </span>
          </h2>
        </div>

        {/* Corpo: prancha MODERADA à esquerda + voz (citação editorial) à
            direita, ambas ANCORADAS NO TOPO (items-start: começam juntas). */}
        <div className="grid grid-cols-1 items-start gap-9 min-[881px]:grid-cols-[minmax(0,480px)_1fr] min-[881px]:gap-[88px]">
          {/* Prancha before/after. */}
          <div
            className="s5-rise mx-auto w-full max-w-[400px] min-[881px]:mx-0 min-[881px]:max-w-none"
            style={delay(140)}
          >
            <div className="relative aspect-square overflow-hidden rounded-[3px] bg-sand [outline:1px_solid_color-mix(in_srgb,var(--olive)_22%,transparent)] [outline-offset:-1px]">
              {PLATES.map((src, i) => (
                <Image
                  key={src}
                  src={src}
                  alt="Before and after of a holistic facial treatment by Nikolle"
                  fill
                  sizes="(max-width: 880px) min(calc(100vw - 48px), 400px), 480px"
                  className={cn(
                    "object-cover transition-opacity duration-[900ms] ease-out motion-reduce:transition-none",
                    i === plate ? "opacity-100" : "opacity-0",
                  )}
                />
              ))}
              {/* Scrim sutil no topo (contraste dos rótulos). */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-16 bg-(image:--s5-scrim)"
              />
              {/* Linha d'água fina na costura before|after (a assinatura); se
                  desenha do centro (scaleY) no reveal. */}
              <span
                aria-hidden="true"
                className="s5-seam pointer-events-none absolute inset-y-0 left-[calc(50%-0.5px)] z-[3] w-px origin-center bg-(image:--s5-seam)"
              />
              <span className="absolute top-4 left-[18px] z-[4] text-[10px] uppercase tracking-[0.24em] text-linen/90">
                Before
              </span>
              <span className="absolute top-4 right-[18px] z-[4] text-[10px] uppercase tracking-[0.24em] text-linen/90">
                After
              </span>
            </div>

            {/* Navegação manual: dots + setas (base v3), sem autoplay. Todos os
                alvos de toque têm 44px (o ponto visual é menor, centrado). */}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center gap-2">
                {PLATES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setPlate(i)}
                    aria-label={`Show before and after ${i + 1} of ${PLATES.length}`}
                    aria-current={i === plate ? "true" : undefined}
                    className="focus-ripple inline-flex h-11 w-11 items-center justify-center rounded-full"
                  >
                    <span
                      aria-hidden="true"
                      className={cn(
                        "block h-[7px] rounded-full transition-all duration-300 motion-reduce:transition-none",
                        i === plate ? "w-5 bg-olive" : "w-[7px] bg-sage/40",
                      )}
                    />
                  </button>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => goPlate(-1)}
                  aria-label="Previous before and after"
                  className="focus-ripple flex h-11 w-11 items-center justify-center rounded-full border border-sage/40 text-olive transition-colors hover:border-olive active:scale-95"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M9 2 L4 7 L9 12"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => goPlate(1)}
                  aria-label="Next before and after"
                  className="focus-ripple flex h-11 w-11 items-center justify-center rounded-full border border-sage/40 text-olive transition-colors hover:border-olive active:scale-95"
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 14 14"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M5 2 L10 7 L5 12"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Voz da cliente em CITAÇÃO EDITORIAL, ancorada no topo (coluna
              direita). A autoridade (selo + revista) migrou para o Interlúdio de
              Imprensa (Press.tsx); aqui fica só a prova emocional. */}
          <div>
            {/* Wrapper do reveal (s5-rise). ASPA GIGANTE de abertura como TETO
                (Cormorant itálico, olive translúcido; mesmo device do interlúdio
                de imprensa, parentesco entre as duas seções de prova),
                decorativa e fora do fluxo (não empurra o texto nem entra na
                reserva de altura). Dentro: um sizer invisível (depoimento mais
                longo) reserva a altura e o div visível fica sobreposto em
                absoluto — UM único depoimento por vez, fade-swap na opacidade só
                desse nó, nunca dois sobrepostos, e a coluna não pula ao trocar. */}
            <figure className="s5-rise relative" style={delay(200)}>
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -top-6 -left-1 z-0 font-voice text-[72px] leading-none text-olive/30 italic select-none min-[881px]:-top-9 min-[881px]:text-[96px]"
              >
                {"“"}
              </span>
              <div className="relative z-[1]">
                <div aria-hidden="true" className="invisible">
                  <blockquote className={QUOTE_CLS}>{LONGEST.quote}</blockquote>
                  <Attribution name={LONGEST.name} city={LONGEST.city} />
                </div>
                <div
                  className="absolute inset-0 transition-opacity duration-500 motion-reduce:transition-none"
                  style={{ opacity: voiceShown ? 1 : 0 }}
                >
                  <blockquote className={cn(QUOTE_CLS, "text-graphite")}>
                    {t.quote}
                  </blockquote>
                  <Attribution name={t.name} city={t.city} />
                  {/* [PENDENTE] Info de tratamento real da Nik (claim clínico) —
                      NÃO inventar. Quando ela enviar o dado verdadeiro (ex.:
                      "Barrier Recovery · results after 6 weeks"), preencher
                      `treatment` no array TESTIMONIALS; renderiza aqui, pareado
                      à voz. Vazio por ora. */}
                  {t.treatment && (
                    <div className="mt-2 text-[11.5px] tracking-[0.04em] text-graphite-soft">
                      {t.treatment}
                    </div>
                  )}
                </div>
              </div>
            </figure>

            {/* Disclaimer FTC (proteção legal para as pranchas before/after),
                discreto pelo tamanho — legível para AA. */}
            <p
              className="s5-rise mt-9 text-[11px] tracking-[0.04em] text-graphite-soft"
              style={delay(280)}
            >
              Individual results may vary.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
