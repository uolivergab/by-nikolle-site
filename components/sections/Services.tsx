"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  type Variant,
  type Variants,
} from "framer-motion";
import { TransitionPanel } from "@/components/ui/TransitionPanel";
import { cn } from "@/lib/utils";

// Seção 3 — Serviços. VALE editorial.
//
// REFORMULADA 08/08 (crítica do Gabriel: "genérica, e quando abre os serviços
// fica confusa, texto demais, sem separação e sem contraste de cor"). O que
// mudou e por quê:
//
// 1. TRILHO no lugar do acordeão. As três categorias eram três gatilhos
//    empilhados que deixavam a coluna direita com ~350px de vazio quando
//    fechadas (lia como inacabado) e permitiam abrir/fechar tudo. Agora são um
//    TABLIST real: uma categoria sempre à vista, altura previsível, um clique a
//    menos até o preço. A LINHA D'ÁGUA (forma-assinatura) corre sob a ativa e
//    DESLIZA entre elas (layoutId) — a assinatura da marca virou o indicador.
// 2. CARTA de areia. Os tratamentos assentam no card "pedra sobre o linho"
//    (bg sand, raio 16, sombra quase nula e difusa, meniscos em 2 cantos
//    opostos se desenhando no reveal). É a "cor diferente" que faltava, e vem
//    da lei de ritmo da revisão 30/07 (linho e sand alternam para marcar
//    fronteira), não de cor nova.
// 3. ANATOMIA do item. Era nome + "75 min · $145" + descrição, tudo no mesmo
//    peso e cor, com um filete embaixo de cada linha (parede de texto). Agora:
//    nome em display, DURAÇÃO em caps pequena e PREÇO em display na sua própria
//    calha à direita, descrição um passo menor e mais clara. O ponto médio
//    saiu. A leitura ganhou colunas em vez de mais filetes.
// 4. LARGURA. A coluna da imagem encolheu (0.62fr) e a do menu cresceu
//    (1.38fr): descrição mais larga = menos linhas = seção mais curta.
// 5. VIDA. Troca de página pelo TransitionPanel (21st.dev / motion-primitives,
//    trazido com a animação dele) + stagger dos itens, linha d'água que desliza,
//    meniscos que se desenham, fotografia que pousa e a SOMBRA DE FOLHAGEM que
//    o design.md prevê para esta seção e estava pendente desde a construção.
//
// Copy 100% do roteiro.md (intocável). ÚNICA microcopy retirada: o rótulo
// "View services" do gatilho do acordeão (microcopy nossa, e o gatilho deixou
// de existir); nada foi inventado. design.md item 3 + revisão 30/07.

type Service = { name: string; duration?: string; price: string; desc: string };
type AddOn = { name: string; price: string; desc: string };
type Category = {
  key: string;
  name: string;
  intro: string;
  items?: Service[];
  addons?: AddOn[];
};

// Categorias, intros, nomes, durações, preços e descrições: roteiro.md Seção 3
// (revisão Nikolle 26/07): entra a Skin Consultation (obrigatória para novos
// clientes), descrições novas em todos os tratamentos, Add-Ons agora DENTRO de
// Signature Facials (LED e Intro to Marma Points; Ultrasound e Extended Massage
// saíram) e a categoria nova Nervous System Reset.
const CATEGORIES: Category[] = [
  {
    key: "signature",
    name: "Signature Facials",
    intro:
      "Customized holistic facials designed to nourish the skin, restore balance, and support long-term skin health through a natural, results-driven approach.",
    items: [
      {
        name: "Skin Consultation + Customized Holistic Facial",
        duration: "80 min",
        price: "$150",
        desc: "A 20 minutes consultation to assess your skin concerns and goals, followed by a customized holistic facial tailored to your skin's current needs. All first-time clients are required to book this treatment.",
      },
      {
        name: "Deep Pore Detox Facial",
        duration: "75 min",
        price: "$145",
        desc: "Clarifying and balancing treatment that deeply cleanses pores, removes impurities and excess oil. Ideal for congested, oily or acne-prone skin.",
      },
      {
        name: "Stimulating Herbal Facial",
        duration: "60 min",
        price: "$140",
        desc: "Invigorating herbal treatment designed to stimulate circulation and reveal radiant skin. Ideal for mature or fatigued skin.",
      },
      {
        name: "Superfood Renewal Facial",
        duration: "60 min",
        price: "$135",
        desc: "Nourishing treatment to restore hydration, brightness and vitality. Ideal for normal, dry, dull, dehydrated or tired skin.",
      },
      {
        name: "Soothing Recovery Facial",
        duration: "60 min",
        price: "$125",
        desc: "Calming and restorative treatment to strengthen the skin barrier, reduce inflammation and support sensitive, reactive or stressed skin.",
      },
    ],
    addons: [
      {
        name: "LED Light Therapy",
        price: "+15 min · $20",
        desc: "Reduces inflammation and stimulates collagen.",
      },
      {
        name: "Intro to Marma Points",
        price: "+15 min · $25",
        desc: "More time for deep relaxation and tension release.",
      },
    ],
  },
  {
    key: "advanced",
    name: "Advanced Treatments",
    intro:
      "Non-invasive yet powerful treatments designed to promote deeper skin renewal through advanced technologies that support collagen, improve circulation, and restore overall skin vitality.",
    items: [
      {
        name: "Age Corrective Treatment",
        duration: "75 min",
        price: "$165",
        desc: "Targets visible signs of aging including fine lines, dehydration and loss of elasticity for smoother, firmer-looking skin.",
      },
      {
        name: "Pigment Balance Treatment",
        duration: "75 min",
        price: "$165",
        desc: "Helps improve the appearance of pigmentation, sun damage and uneven skin tone for a brighter, more balanced complexion.",
      },
      {
        name: "Dermal Infusion Micro-Crystal Treatment",
        duration: "90 min",
        price: "$230",
        desc: "Advanced skin renewal treatment designed to stimulate collagen production and enhance product infusion for smoother, brighter, radiant skin. A gentle alternative to traditional microneedling with no downtime.",
      },
    ],
  },
  {
    key: "reset",
    name: "Nervous System Reset",
    intro:
      "A restorative experience designed to calm the nervous system, reduce stress, and promote deep relaxation and balance.",
    items: [
      {
        name: "Deep Relaxation Facial",
        duration: "60 min",
        price: "$130",
        desc: "A soothing facial designed to nourish the skin while promoting deep relaxation. This treatment includes a prolonged facial, scalp, neck, and shoulder massage, introductory Marma point stimulation, and vibrational sound to calm the mind.",
      },
      {
        name: "Marma Therapy",
        duration: "60 min",
        price: "$115",
        desc: "An Ayurvedic energy therapy that stimulates vital energy points to encourage the flow of prana (life force), release tension, and support the body's natural healing response. This treatment includes Marma point stimulation on the head, face, neck, shoulders, and feet, combined with vibrational sound to promote nervous system balance and overall well-being.",
      },
      {
        name: "Marma Monthly Sessions",
        price: "$99",
        desc: "To support your nervous system through regular care.",
      },
    ],
  },
];

// Delay (ms) do stagger de reveal por elemento — valor dinâmico (por índice),
// inerte enquanto a seção não está data-live e sob prefers-reduced-motion.
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

const EASE = [0.22, 1, 0.36, 1] as const;

// Menisco: fio côncavo (quarto de arco) da forma-assinatura, em 2 cantos
// opostos da carta. Comprimento do path ~58px; o dasharray 64 do CSS cobre o
// traçado inteiro no stroke draw.
function Menisco({ className }: { className?: string }) {
  return (
    <svg
      className={cn("s3-menisco", className)}
      width="34"
      height="34"
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

// Larguras a partir das quais a coluna do menu é larga o bastante para as
// descrições ficarem todas à vista (o mesmo 981 do resto da seção).
const WIDE_MQ = "(min-width: 981px)";

export function Services() {
  const sectionRef = useRef<HTMLElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const shellRef = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);
  // SSR-safe: constante no servidor e no 1º render do cliente (a 1ª categoria
  // sempre à vista, sem matchMedia e sem flash de estado).
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();

  // No MOBILE o menu vira lista de revelação: nome, duração e preço sempre à
  // vista, descrição no toque (um aberto por vez, como no FAQ). A 1ª de cada
  // categoria nasce aberta, e na Signature essa é a Skin Consultation, cuja
  // descrição carrega a informação que um cliente novo PRECISA ver ("all
  // first-time clients are required to book this treatment").
  const [openRow, setOpenRow] = useState<Record<string, number | null>>(() =>
    Object.fromEntries(CATEGORIES.map((c) => [c.key, 0])),
  );
  const toggleRow = (key: string, index: number) =>
    setOpenRow((prev) => ({ ...prev, [key]: prev[key] === index ? null : index }));

  // O gatilho só EXISTE onde a lista é de revelação. No desktop a descrição
  // fica à vista pelo CSS (media query), então a troca de <button> por <div>
  // acontece depois da montagem sem mudar um pixel: nada pisca.
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(WIDE_MQ);
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

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

  // A carta só TRANSICIONA de altura na troca de categoria. No acordeão ela
  // acompanha o painel quadro a quadro: com transição ligada, a altura ficaria
  // perseguindo o painel que está abrindo e o conteúdo apareceria cortado
  // durante os 420ms. (Efeito declarado ANTES do de medição de propósito: o
  // atributo precisa estar no nó antes da primeira escrita de altura.)
  useEffect(() => {
    const root = shellRef.current;
    if (!root) return;
    root.dataset.swap = "";
    const t = setTimeout(() => {
      delete root.dataset.swap;
    }, 480);
    return () => clearTimeout(t);
  }, [active]);

  // A carta segue a altura da PÁGINA ATIVA. Sem isto o AnimatePresence em
  // popLayout tira a página que sai do fluxo e a carta salta de altura de um
  // frame para o outro (o conteúdo abaixo pula). Mede a página ativa pelo
  // data-attribute (a que está saindo tem outro índice, então não confunde) e
  // reobserva a cada troca; o ResizeObserver cobre resize e carga das fontes.
  //
  // A altura é escrita DIRETO no nó, nunca em estado: o acordeão faz a página
  // crescer quadro a quadro e um setState por quadro derrubaria o mobile. É a
  // mesma lei dos motion values, valor contínuo não passa pelo React.
  useEffect(() => {
    const root = shellRef.current;
    if (!root) return;
    const page = root.querySelector<HTMLElement>(`[data-s3-page="${active}"]`);
    if (!page) return;
    const measure = () => {
      root.style.height = `${page.offsetHeight}px`;
    };
    measure();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(measure);
    ro.observe(page);
    return () => ro.disconnect();
  }, [active]);

  // Trilho: navegação por setas do padrão de tabs (roving tabindex).
  const focusTab = useCallback((index: number) => {
    const tabs =
      railRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[index]?.focus();
  }, []);

  const onRailKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const last = CATEGORIES.length - 1;
    let next = -1;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = active === last ? 0 : active + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = active === 0 ? last : active - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = last;
    }
    if (next < 0) return;
    event.preventDefault();
    setActive(next);
    focusTab(next);
  };

  // Movimento da carta (dono: Framer Motion, dentro desta seção). A página
  // inteira dissolve e sobe; os tratamentos entram em cascata por dentro.
  const pageVariants: { enter: Variant; center: Variant; exit: Variant } = reduce
    ? {
        enter: { opacity: 1 },
        center: { opacity: 1 },
        exit: { opacity: 0, transition: { duration: 0 } },
      }
    : {
        enter: { opacity: 0, y: 16 },
        center: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.5,
            ease: EASE,
            delayChildren: 0.06,
            staggerChildren: 0.055,
          },
        },
        exit: { opacity: 0, y: -12, transition: { duration: 0.26 } },
      };

  const rowVariants: Variants = reduce
    ? { enter: { opacity: 1 }, center: { opacity: 1 }, exit: { opacity: 1 } }
    : {
        enter: { opacity: 0, y: 12 },
        center: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
        exit: { opacity: 0, transition: { duration: 0.16 } },
      };

  return (
    <section
      id="treatments"
      ref={sectionRef}
      data-live={live ? "true" : undefined}
      className="services relative bg-linen"
    >
      {/* SOMBRA DE FOLHAGEM (design.md item 3, pendente desde a construção): a
          natureza entra como sombra e luz, nunca como folha desenhada. O
          recorte vive NESTE irmão absoluto — pôr overflow na section mataria o
          position:sticky da imagem-âncora (bug já documentado 3 vezes). */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden overflow-hidden min-[981px]:block"
      >
        <span className="s3-canopy-layer" />
      </span>

      <div className="relative mx-auto grid max-w-[1200px] grid-cols-1 items-start gap-10 px-6 pt-14 pb-20 min-[981px]:grid-cols-[0.64fr_1.36fr] min-[981px]:gap-14 min-[981px]:px-12 min-[981px]:pt-18 min-[981px]:pb-26">
        {/* Coluna imagem — STICKY no desktop (o scroll lateral). Nenhum ancestral
            pode ter overflow, senão o sticky quebra (bug do v4). */}
        <div className="min-[981px]:sticky min-[981px]:top-24">
          <div className="s3-rise relative aspect-[4/3.4] overflow-hidden rounded-[3px] min-[981px]:aspect-[4/5]">
            <Image
              src="/images/cena-tratamento-vapor.webp"
              alt="A facial treatment in progress."
              fill
              sizes="(max-width: 980px) calc(100vw - 48px), 400px"
              className="s3-settle object-cover"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-(image:--s3-frame-veil)"
            />
          </div>
          <p
            className="s3-rise mt-4 font-voice text-[17px] font-medium text-[color:var(--s3-quill)] italic"
            style={delay(90)}
          >
            Every treatment tailored to your skin needs.
          </p>
        </div>

        {/* Coluna menu — título, apoio, trilho de categorias e a carta. */}
        <div className="min-w-0">
          <h2
            id="s3-title"
            className="s3-rise font-display text-graphite [font-size:clamp(30px,3.4vw,48px)] leading-[1.05]"
            style={delay(40)}
          >
            {/* Tratamento v2 (mesma acessibilidade do Hero/Method): frase em
                CAIXA ALTA só no visual (aria-hidden, uppercase por CSS) +
                'unique needs' em itálico minúsculo peso 500; o leitor de tela
                lê o sr-only em caixa de sentença. */}
            <span className="sr-only">Care designed for your unique needs</span>
            <span
              aria-hidden="true"
              className="font-[550] tracking-[0.03em] uppercase"
            >
              Care designed for your{" "}
              <em className="font-voice font-medium tracking-normal normal-case italic">
                unique needs
              </em>
            </span>
          </h2>
          <p
            className="s3-rise mt-4 max-w-[430px] text-[15.5px] leading-[1.6] text-graphite-soft"
            style={delay(110)}
          >
            A holistic and personalized approach to help you look, feel, and
            live well.
          </p>

          {/* TRILHO DE CATEGORIAS — tablist real. No mobile ele desliza na
              horizontal (sangrando até a borda da tela) em vez de quebrar. */}
          <div
            ref={railRef}
            role="tablist"
            aria-labelledby="s3-title"
            onKeyDown={onRailKeyDown}
            // scroll-px-6 acompanha o px-6: sem ele o snap alinha a 1ª
            // categoria à borda do container e COME os 24px de respiro (a
            // palavra nasce cortada no mobile).
            className="s3-rail s3-rise mt-8 -mx-6 flex snap-x snap-mandatory scroll-px-6 gap-7 overflow-x-auto border-b border-sage/20 px-6 min-[981px]:mx-0 min-[981px]:mt-11 min-[981px]:gap-10 min-[981px]:scroll-px-0 min-[981px]:px-0"
            style={delay(180)}
          >
            {CATEGORIES.map((cat, i) => {
              const selected = i === active;
              return (
                <button
                  key={cat.key}
                  id={`s3-tab-${cat.key}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={selected ? `s3-panel-${cat.key}` : undefined}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(i)}
                  className="focus-ripple relative flex min-h-11 flex-none snap-start items-center py-4"
                >
                  <span
                    className={cn(
                      "font-display whitespace-nowrap uppercase [font-size:clamp(13px,1.15vw,15.5px)] tracking-[0.12em] transition-colors duration-300",
                      // A inativa NÃO desbota até reprovar contraste (sage e
                      // grafites translúcidos ficam em ~3:1 sobre o linho): a
                      // distância entre ativa e inativa vive no PESO e na linha
                      // d'água, não na opacidade.
                      selected
                        ? "font-semibold text-graphite"
                        : "font-medium text-graphite-soft hover:text-graphite",
                    )}
                  >
                    {cat.name}
                  </span>
                  {/* A LINHA D'ÁGUA da marca virou o indicador: desliza de uma
                      categoria para a outra em vez de piscar. */}
                  {selected && (
                    <motion.span
                      layoutId="s3-waterline"
                      aria-hidden="true"
                      className="absolute inset-x-0 -bottom-px h-[2px] bg-(image:--s3-waterline)"
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 320, damping: 34 }
                      }
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* A CARTA — card 'pedra sobre o linho' (design.md): areia sobre o
              linho, raio 16, sem borda dura, sombra quase nula e difusa, com os
              meniscos da forma-assinatura em 2 cantos opostos. */}
          <div
            className="s3-rise relative mt-7 rounded-[16px] bg-sand p-6 min-[981px]:mt-9 min-[981px]:p-9"
            style={{ ...delay(240), boxShadow: "var(--s3-card-shadow)" }}
          >
            <Menisco className="absolute top-3 left-3 text-sage/45" />
            <Menisco className="absolute right-3 bottom-3 rotate-180 text-sage/45" />

            <div ref={shellRef} className="s3-shell overflow-hidden">
              <TransitionPanel activeIndex={active} variants={pageVariants}>
                {CATEGORIES.map((cat, c) => (
                  <div
                    key={cat.key}
                    data-s3-page={c}
                    id={`s3-panel-${cat.key}`}
                    role="tabpanel"
                    aria-labelledby={`s3-tab-${cat.key}`}
                    tabIndex={0}
                    className="focus-ripple rounded-[8px]"
                  >
                    {/* A categoria segue existindo como cabeçalho para o leitor
                        de tela (h2 título -> h3 categoria); no visual quem a
                        nomeia é o trilho. */}
                    <h3 className="sr-only">{cat.name}</h3>

                    <motion.p
                      variants={rowVariants}
                      className="max-w-[72ch] font-voice text-[16.5px] leading-[1.45] font-medium text-olive italic min-[981px]:text-[19px]"
                    >
                      {cat.intro}
                    </motion.p>

                    <div className="mt-6 min-[981px]:mt-7">
                      {cat.items?.map((item, r) => {
                        const open = openRow[cat.key] === r;
                        const descId = `s3-desc-${cat.key}-${r}`;
                        // A cabeça da linha é a mesma nas duas variantes; o que
                        // muda é ela ser ou não um gatilho.
                        const head = (
                          <>
                            <span className="font-display font-medium text-graphite [font-size:clamp(19px,1.45vw,22px)] leading-[1.2]">
                              {item.name}
                            </span>
                            <span className="flex flex-none items-baseline gap-3">
                              {item.duration && (
                                <span className="text-[12px] tracking-[0.16em] text-graphite-soft uppercase">
                                  {item.duration}
                                </span>
                              )}
                              <span className="font-display text-[19px] font-semibold text-graphite">
                                {item.price}
                              </span>
                            </span>
                          </>
                        );
                        // relative: o "+" se centra no CABEÇALHO, não na linha
                        // (na linha aberta ele cairia no meio da descrição).
                        const headClass =
                          "relative flex w-full flex-col gap-1.5 pr-8 text-left min-[981px]:flex-row min-[981px]:items-baseline min-[981px]:justify-between min-[981px]:gap-8 min-[981px]:pr-0";
                        return (
                          <motion.div
                            key={item.name}
                            variants={rowVariants}
                            className="s3-row relative -mx-3 border-t border-sage/20 px-3 py-4 first:border-t-0 min-[981px]:-mx-4 min-[981px]:px-4 min-[981px]:py-5"
                          >
                            {wide ? (
                              <div className={headClass}>{head}</div>
                            ) : (
                              <button
                                type="button"
                                aria-expanded={open}
                                aria-controls={descId}
                                onClick={() => toggleRow(cat.key, r)}
                                className={cn("focus-ripple", headClass)}
                              >
                                {head}
                                {/* O "+" de fios d'água da casa (mesmo indicador
                                    do FAQ): o vertical se recolhe ao abrir. */}
                                <span
                                  aria-hidden="true"
                                  className="absolute top-1/2 right-0 h-[14px] w-[14px] -translate-y-1/2"
                                >
                                  <span className="absolute inset-x-0 top-1/2 block h-px -translate-y-1/2 bg-sage" />
                                  <span
                                    className={cn(
                                      "absolute inset-y-0 left-1/2 block w-px -translate-x-1/2 origin-center bg-sage transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                                      open && "scale-y-0",
                                    )}
                                  />
                                </span>
                              </button>
                            )}
                            <div
                              id={descId}
                              className={cn(
                                "grid transition-[grid-template-rows] duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none",
                                open
                                  ? "grid-rows-[1fr]"
                                  : "grid-rows-[0fr] min-[981px]:grid-rows-[1fr]",
                              )}
                            >
                              <div className="min-h-0 overflow-hidden">
                                <p className="mt-2 max-w-[68ch] text-[14px] leading-[1.62] text-graphite-soft min-[981px]:text-[13.5px]">
                                  {item.desc}
                                </p>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Add-Ons: material INVERTIDO (linho dentro da areia) para
                        separar o tier sem inventar cor nem mais um filete. */}
                    {cat.addons && (
                      <motion.div
                        variants={rowVariants}
                        className="mt-7 rounded-[10px] bg-linen/70 p-5 min-[981px]:p-6"
                      >
                        <p className="text-[12px] tracking-[0.22em] text-graphite-soft uppercase">
                          Add-Ons
                        </p>
                        <p className="mt-1 font-voice text-[17px] font-medium text-[color:var(--s3-quill)] italic">
                          Elevate your session.
                        </p>
                        <div className="mt-3">
                          {cat.addons.map((addon) => (
                            <div
                              key={addon.name}
                              className="border-t border-sage/15 py-3 first:border-t-0 min-[981px]:flex min-[981px]:items-baseline min-[981px]:gap-4"
                            >
                              {/* No mobile nome e preço dividem a mesma linha
                                  (cabem, e empilhados custavam uma linha por
                                  add-on); no desktop o contents devolve os dois
                                  à fileira original. */}
                              <div className="flex items-baseline gap-3 min-[981px]:contents">
                                <span className="font-display text-[18px] font-medium whitespace-nowrap text-graphite">
                                  {addon.name}
                                </span>
                                <span className="text-[12.5px] font-medium tracking-[0.04em] whitespace-nowrap text-olive">
                                  {addon.price}
                                </span>
                              </div>
                              <span className="mt-0.5 block text-[13px] leading-[1.6] text-graphite-soft min-[981px]:mt-0 min-[981px]:flex-1 min-[981px]:text-right">
                                {addon.desc}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </div>
                ))}
              </TransitionPanel>
            </div>
          </div>

          {/* Nota do roteiro (revisão 26/07): o programa de wellness que vem aí.
              A seção própria "Coming Soon" da home entra depois. */}
          <p
            className="s3-rise mt-7 font-voice text-[18px] font-medium text-olive italic"
            style={delay(320)}
          >
            Coming soon: Integrative Wellness Coaching Program
          </p>
        </div>
      </div>
    </section>
  );
}
