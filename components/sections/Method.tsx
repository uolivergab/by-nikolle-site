"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  cubicBezier,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  LineBalance,
  LineNourish,
  LineSkin,
} from "@/components/icons/PillarLineIcons";
import { cn } from "@/lib/utils";

// Seção 2 — A Filosofia (Os Três Pilares), REFORMULADA 27/07 como NARRATIVA DE
// SCROLL. Gabarito ABSOLUTO: os dois mocks do Gabriel (desktop + mobile 9:16).
// Cena sticky de 100svh dentro de um wrapper alto; o progresso do scroll rege
// a coreografia (sem hijack: a página rola normal). Copy 100% do roteiro.md.
//
// CAMADAS: fundo botânico (a cena do amanhecer, MOVIDA da Real Results) ->
// linha conectiva -> portal fotográfico orgânico -> cards -> copy/CTA.
//
// ARQUITETURA DE ANIMAÇÃO: um único useScroll; tudo distribui por motion
// values (useTransform), fora do ciclo de render. O React só re-renderiza nas
// TROCAS DE ESTADO discretas (card ativo 0/1/2 + ícones desenhados), via
// useMotionValueEvent com guarda. prefers-reduced-motion degrada para uma
// pilha estática com todo o conteúdo visível.

const EASE_OUT = cubicBezier(0.22, 1, 0.36, 1);
const DESK_MQ = "(min-width: 1200px)";

// Marquee de palavras (roteiro.md, revisão 26/07). Decorativo, aria-hidden.
const MARQUEE_WORDS = [
  "Integrative Wellness",
  "Natural & Organic",
  "Reset",
  "Holistic",
  "Non-invasive",
  "Clean beauty",
];
const MARQUEE_HALF = Array.from({ length: 4 }, () => MARQUEE_WORDS).flat();

type Pillar = {
  num: string;
  key: string;
  title: string;
  Icon: React.ComponentType<{ className?: string }>;
  body: string;
};

const PILLARS: Pillar[] = [
  {
    num: "01",
    key: "skin",
    title: "Skin",
    Icon: LineSkin,
    body: "Holistic, non-invasive treatments that strengthen the skin barrier and support your skin's natural ability to heal, renew, and thrive. Lasting results without aggressive treatments.",
  },
  {
    num: "02",
    key: "nourishment",
    title: "Nourishment",
    Icon: LineNourish,
    body: "True beauty is nourished from the inside out. We pair aesthetics with lifestyle, integrative nutrition and practices that feed your body and your vitality.",
  },
  {
    num: "03",
    key: "balance",
    title: "Balance",
    Icon: LineBalance,
    body: "An integrative approach that supports harmony between body, mind, and nervous system through calm, connection, and intentional daily rituals.",
  },
];

// Seta diagonal do rodapé do card (decorativa).
function ArrowDiagonal() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M 2.5 11.5 L 11.5 2.5 M 4.5 2.5 h 7 v 7" />
    </svg>
  );
}

export function Method() {
  // O branch estático de reduced-motion só entra depois de montado (o SSR
  // renderiza o animado; trocar no cliente evita mismatch de hidratação).
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  const anim = !reduced;

  // Desktop (>=1200px) = coreografia absoluta com transforms por card.
  // Abaixo disso = coluna com card expandido/compacto (transforms só no CSS).
  const [desk, setDesk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(DESK_MQ);
    const update = () => setDesk(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const wrapRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: sp } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  // ESTADOS DISCRETOS regem toda a OPACIDADE (e o desenho dos ícones) via
  // data-attributes + transições CSS; os motion values ficam só com o
  // CONTÍNUO (y, scale, linha). Motivo medido no browser: bindings de
  // opacity re-anexados a cada re-render do setActive congelavam em valores
  // intermediários; classe + transição CSS é estável e igualmente editorial.
  // - intro: a cena entrou (eyebrow/headline/indicador revelam)
  // - active: qual card comanda (0/1/2)
  // - drawn: ícones já desenhados (monotônico: uma vez desenhado, fica)
  // - final: composição final (todos os cards crisp + CTA)
  const [intro, setIntro] = useState(false);
  const [active, setActive] = useState(0);
  const [drawn, setDrawn] = useState(0);
  const [final, setFinal] = useState(false);
  useMotionValueEvent(sp, "change", (v) => {
    setIntro((prev) => (prev === v >= 0.015 ? prev : v >= 0.015));
    const idx = v >= 0.62 ? 2 : v >= 0.36 ? 1 : 0;
    setActive((prev) => (prev === idx ? prev : idx));
    const d = v >= 0.62 ? 3 : v >= 0.36 ? 2 : v >= 0.12 ? 1 : 0;
    setDrawn((prev) => (prev >= d ? prev : d));
    setFinal((prev) => (prev === v >= 0.86 ? prev : v >= 0.86));
  });

  // ---- Camadas lentas (profundidade) ----
  const bgY = useTransform(sp, [0, 1], ["0%", "-3.5%"]);
  const lineDraw = useTransform(sp, [0.05, 0.8], [0, 1]);
  const portalScale = useTransform(sp, [0, 0.15, 0.68, 0.9], [0.945, 1, 1, 1.024]);
  const portalY = useTransform(sp, [0, 1], [12, -16]);
  const photoY = useTransform(sp, [0, 1], ["2.4%", "-2.4%"]);

  // ---- Deslocamento contínuo dos cards (velocidades distintas) ----
  const easeOpt = { ease: EASE_OUT };
  const skinY = useTransform(sp, [0.12, 0.3, 0.44, 0.5], [176, 0, -12, -12], easeOpt);
  const skinSc = useTransform(sp, [0.3, 0.4, 0.48, 0.86, 0.93], [1.014, 1.014, 0.97, 0.97, 1]);
  const nourY = useTransform(sp, [0.34, 0.52, 0.68, 0.74], [188, 0, 0, -10], easeOpt);
  const nourSc = useTransform(sp, [0.52, 0.66, 0.74, 0.86, 0.93], [1.014, 1.014, 0.97, 0.97, 1]);
  const balY = useTransform(sp, [0.6, 0.78], [188, 0], easeOpt);
  const balSc = useTransform(sp, [0.78, 0.9, 0.96], [1.014, 1.014, 1]);
  const cardMV = [
    { y: skinY, scale: skinSc },
    { y: nourY, scale: nourSc },
    { y: balY, scale: balSc },
  ];

  // Posições absolutas da composição final (desktop, do mock 1672x943).
  const deskSlot = [
    "min-[1200px]:absolute min-[1200px]:left-[19%] min-[1200px]:bottom-[9%] min-[1200px]:w-[clamp(295px,24.5vw,352px)]",
    "min-[1200px]:absolute min-[1200px]:right-[8.5%] min-[1200px]:top-[10%] min-[1200px]:w-[clamp(295px,24.5vw,352px)]",
    "min-[1200px]:absolute min-[1200px]:right-[5.5%] min-[1200px]:bottom-[8%] min-[1200px]:w-[clamp(285px,23vw,340px)]",
  ];

  // SEM overflow-hidden na section: ancestral com overflow MATA o sticky
  // (mesma lição da S3). O clip vive na própria cena.
  return (
    <section
      id="philosophy"
      data-intro={reduced || intro ? "true" : undefined}
      data-final={reduced || final ? "true" : undefined}
      className="method relative bg-linen"
    >
      {/* Marquee de palavras vivas: costura com o hero. Decorativo. */}
      <div
        aria-hidden="true"
        className="relative z-[4] overflow-hidden border-y border-sage/[0.18] bg-linen py-3"
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

      {/* Wrapper alto: o "tempo" da narrativa. Reduced: altura natural. */}
      <div
        ref={wrapRef}
        className={cn("relative", anim && "h-[350vh] min-[1200px]:h-[315vh]")}
      >
        {/* A cena. h-screen é o fallback de 100vh; 100svh vence onde existe. */}
        <div
          className={cn(
            "overflow-hidden",
            anim ? "sticky top-0 h-screen [height:100svh]" : "relative",
          )}
        >
          {/* 1. FUNDO BOTÂNICO (movido da Real Results): a cena do amanhecer +
              véu de linho, com deriva vertical bem mais lenta que os cards. */}
          <motion.div
            aria-hidden="true"
            style={anim ? { y: bgY } : undefined}
            className="absolute inset-x-0 -top-[4%] -bottom-[4%]"
          >
            <Image
              src="/images/proof-foliage-dawn.jpg"
              alt=""
              fill
              sizes="100vw"
              className="hidden object-cover min-[768px]:block"
            />
            <Image
              src="/images/proof-foliage-dawn-mobile.jpg"
              alt=""
              fill
              sizes="100vw"
              className="block object-cover min-[768px]:hidden"
            />
            {/* Véu de legibilidade (o mesmo papel que cumpria na S5): linho
                translúcido, mais denso nas pontas, ar no meio. */}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,color-mix(in_srgb,var(--linen)_74%,transparent),color-mix(in_srgb,var(--linen)_56%,transparent)_42%,color-mix(in_srgb,var(--linen)_80%,transparent))]" />
          </motion.div>

          {/* 2. LINHA CONECTIVA: se desenha com o scroll (pathLength real).
              Atrás do portal e dos cards, na frente do fundo. */}
          {anim && (
            <>
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[1] hidden h-full w-full min-[1200px]:block"
                viewBox="0 0 1440 800"
                preserveAspectRatio="none"
                fill="none"
              >
                <motion.path
                  d="M 84 452 C 190 508 268 610 388 646 C 520 682 610 726 764 738 C 950 752 1082 700 1152 640 C 1232 570 1262 478 1242 380 C 1226 300 1180 238 1128 206"
                  stroke="color-mix(in srgb, var(--sage) 52%, transparent)"
                  strokeWidth="1.1"
                  vectorEffect="non-scaling-stroke"
                  style={{ pathLength: lineDraw }}
                />
              </svg>
              <svg
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-[1] h-full w-full min-[1200px]:hidden"
                viewBox="0 0 400 800"
                preserveAspectRatio="none"
                fill="none"
              >
                <motion.path
                  d="M 58 110 C 26 210 40 320 96 396 C 140 456 130 560 86 648"
                  stroke="color-mix(in srgb, var(--sage) 45%, transparent)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                  style={{ pathLength: lineDraw }}
                />
              </svg>
            </>
          )}

          {/* Conteúdo da cena */}
          <div
            className={cn(
              "relative z-[2] h-full",
              anim
                ? "flex flex-col items-center px-6 pt-[max(84px,8.5svh)] min-[768px]:px-10 min-[861px]:pt-[124px] min-[1200px]:block min-[1200px]:px-0 min-[1200px]:pt-0"
                : "mx-auto flex max-w-[720px] flex-col items-center px-6 py-20",
            )}
          >
            {/* Eyebrow + headline */}
            <div
              className={cn(
                "text-center",
                anim &&
                  "min-[1200px]:absolute min-[1200px]:left-[7%] min-[1200px]:top-[14%] min-[1200px]:text-left",
              )}
            >
              <p className="ph-reveal text-[11px] uppercase leading-[normal] tracking-[0.28em] text-graphite-soft min-[1200px]:text-[12px]">
                The By Nikolle Philosophy
              </p>
              <h2 className="mt-2.5 font-display leading-[1.08] text-graphite [font-size:clamp(27px,7vw,40px)] min-[1200px]:mt-6 min-[1200px]:[font-size:clamp(38px,3.6vw,54px)]">
                <span className="sr-only">Discover our three pillars</span>
                <span aria-hidden="true" className="block font-[550] tracking-[0.03em] uppercase">
                  <span className="ph-reveal block whitespace-nowrap [--rd:0.12s]">
                    Discover our
                  </span>
                  <span className="ph-reveal block whitespace-nowrap [--rd:0.24s]">
                    {"three "}
                    <em className="font-voice font-medium normal-case tracking-normal italic">
                      pillars
                    </em>
                  </span>
                </span>
              </h2>
            </div>

            {/* Indicador 01/03 (decorativo; o traço é um fio, não um caractere) */}
            <p
              aria-hidden="true"
              className={cn(
                "ph-reveal [--rd:0.36s]",
                "mt-4 flex items-center gap-2.5 self-start text-[11.5px] tracking-[0.18em] text-graphite-soft",
                anim
                  ? "min-[1200px]:absolute min-[1200px]:left-[4.5%] min-[1200px]:top-1/2 min-[1200px]:mt-0"
                  : "self-center",
              )}
            >
              {String((reduced ? 2 : active) + 1).padStart(2, "0")}
              <span className="inline-block h-px w-6 bg-sage/60" />
              03
            </p>

            {/* 3. PORTAL FOTOGRÁFICO (forma orgânica, foto real) */}
            <div
              className={cn(
                "relative w-full",
                anim
                  ? "mt-[0.5svh] h-[28svh] w-[64%] max-w-[300px] flex-none min-[768px]:h-[30svh] min-[768px]:max-w-[340px] min-[861px]:h-[26svh] min-[1200px]:absolute min-[1200px]:left-[41%] min-[1200px]:top-1/2 min-[1200px]:mt-0 min-[1200px]:h-[74svh] min-[1200px]:w-[33%] min-[1200px]:max-w-none min-[1200px]:-translate-y-1/2"
                  : "my-10 h-[420px] max-w-[480px]",
              )}
            >
              <motion.div
                style={anim ? { scale: portalScale, y: portalY } : undefined}
                className="absolute inset-0 z-[2]"
              >
                <div className="ph-blob absolute inset-0 overflow-hidden">
                  <motion.div
                    style={anim ? { y: photoY } : undefined}
                    className="absolute inset-x-0 -inset-y-[3%]"
                  >
                    <Image
                      src="/images/cena-tratamento-ultrassom.webp"
                      alt="A holistic facial in progress at the by Nikolle studio: the esthetician glides an ultrasound device and a sponge over the client's skin"
                      fill
                      sizes="(max-width: 767px) 64vw, (max-width: 1199px) 66vw, 34vw"
                      className="object-cover object-[50%_85%] min-[768px]:object-[50%_30%] min-[1200px]:object-[52%_38%]"
                    />
                  </motion.div>
                </div>
                {/* contorno parcial, deslocado: não fecha a forma */}
                <span aria-hidden="true" className="ph-blob-line absolute -inset-[10px]" />
              </motion.div>
            </div>

            {/* 4. CARDS */}
            <div
              className={cn(
                "relative z-[3] w-full",
                anim
                  ? "mt-[-11svh] flex max-w-[560px] flex-col gap-2 min-[768px]:mt-[-11svh] min-[861px]:mt-[-12.5svh] min-[768px]:max-w-[620px] min-[1200px]:mt-0 min-[1200px]:max-w-none min-[1200px]:contents"
                  : "mt-4 flex max-w-[560px] flex-col gap-5",
              )}
            >
              {PILLARS.map((pillar, i) => {
                const { Icon } = pillar;
                return (
                  <motion.div
                    key={pillar.key}
                    style={anim && desk ? cardMV[i] : undefined}
                    className={cn("ph-slot relative", anim && deskSlot[i])}
                  >
                    {/* Grid com áreas: compacto = uma linha (número, título,
                        ícone, seta); ativo/desktop = a anatomia do mock. */}
                    <article
                      data-active={reduced || active === i ? "true" : undefined}
                      data-drawn={reduced || drawn > i ? "true" : undefined}
                      className="ph-card"
                    >
                      <span className="ph-num font-display text-olive">
                        {pillar.num}
                      </span>
                      <span aria-hidden="true" className="ph-ico text-olive">
                        <Icon className="h-full w-full" />
                      </span>
                      <h3 className="ph-title font-voice font-normal italic text-graphite">
                        {pillar.title}
                      </h3>
                      <div className="ph-body">
                        <div className="overflow-hidden">
                          <p className="pb-1 text-[14px] leading-[1.65] text-graphite-soft min-[1200px]:text-[15px] min-[1200px]:leading-[1.7]">
                            {pillar.body}
                          </p>
                        </div>
                      </div>
                      <span aria-hidden="true" className="ph-arrow inline-flex text-olive">
                        <ArrowDiagonal />
                      </span>
                    </article>
                  </motion.div>
                );
              })}
            </div>

            {/* 5. CTA (revelado na composição final) */}
            <div
              className={cn(
                "ph-cta mt-[1svh] pb-[max(12px,env(safe-area-inset-bottom))]",
                anim &&
                  "min-[1200px]:absolute min-[1200px]:left-[4.5%] min-[1200px]:bottom-[9%] min-[1200px]:mt-0 min-[1200px]:pb-0",
                !anim && "mt-8",
              )}
            >
              <a
                href="#about"
                className="focus-ripple group inline-flex items-center gap-3 border-b border-olive/45 pb-2 text-[11.5px] uppercase leading-[normal] tracking-[0.22em] text-graphite transition-colors hover:border-olive min-[1200px]:text-[12px]"
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
        </div>
      </div>
    </section>
  );
}
