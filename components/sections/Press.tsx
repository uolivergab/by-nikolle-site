"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  cubicBezier,
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { cn } from "@/lib/utils";

// Seção 5b — IN THE PRESS, REFORMULADA 27/07 como EXPERIÊNCIA EDITORIAL DE
// SCROLL (briefing longo do Gabriel; gabaritos ABSOLUTOS em
// design-references/press-section/: key visual desktop + 3 estados mobile).
// O clipping estático saiu; entrou uma cena sticky (~340svh) onde o scroll
// compõe uma natureza-morta editorial: tipografia monumental, a revista como
// objeto físico (folhas de papel atrás), a escultura de serum em primeiro
// plano e o selo azul flutuando em profundidade própria. Copy 100% do
// roteiro.md (bloco Interlúdio, fixado pelo briefing).
//
// ARQUITETURA (a mesma da Method, medida no browser): um único useScroll no
// wrapper alto; motion values SÓ para o contínuo (translate/rotate/scale);
// TODA opacidade em estados discretos (data-attributes + transição CSS) — a
// lição do congelamento de bindings de opacity re-anexados. O React só
// re-renderiza nas fronteiras de fase (useMotionValueEvent com guarda).
// Clip vive NA CENA (overflow em ancestral mata o sticky — 3ª vez).
//
// TIPOGRAFIA: a dupla editorial Inter Tight (fina, ~325) + Bodoni Moda
// itálico — as famílias já carregadas do hero, reutilizadas por ordem do
// briefing ("verifique as fontes disponíveis antes de instalar"). A quote
// fala em Cormorant (a voz da casa). prefers-reduced-motion degrada para uma
// composição estática vertical com TODO o conteúdo visível, sem pin.

const EASE_OUT = cubicBezier(0.22, 1, 0.36, 1);
// Curva do SCRUB (movimento ligado à rolagem). Quem dita o tempo aqui é o dedo
// do usuário, não uma duração, e por isso a EASE_OUT da casa NÃO serve: ela é
// ótima para reveal com duração própria e péssima para scrub, porque entrega a
// quase totalidade do percurso no comecinho da rolagem. MEDIDO no browser com
// a curva antiga: a revista andava 5.5x mais rápido que o dedo nos primeiros
// 72px e ficava PARADA nos 500px seguintes. Esta curva é quase simétrica: o
// objeto ganha e perde velocidade junto com o gesto, e é isso que lê como peso.
const EASE_SCRUB = cubicBezier(0.42, 0, 0.28, 1);
const DESK_MQ = "(min-width: 1024px)";

// ---- Copy do roteiro.md (Interlúdio — Imprensa, briefing 27/07) ----
const EYEBROW = "IN THE PRESS";
const HEAD_SANS = "NAMED BEST";
const HEAD_ITALIC = "natural facial.";
const WINNER = "BEST OF HONOLULU 2024 WINNER";
const QUOTE = "You leave with a radiant glow and a relaxed state of mind.";
const SOURCE = "HONOLULU MAGAZINE · 2024";
const CTA_LABEL = "VIEW THE FEATURE";
const HINT = "SCROLL TO UNFOLD";
const IND = ["01 / 03", "02 / THE FEATURE UNFOLDS", "03 / 03"];

// Não existe URL real da matéria (roteiro.md): o CTA abre o próprio recorte
// da revista em nova aba, com rel de segurança.
const FEATURE_HREF = "/images/press/press-magazine-honolulu.png";

const MAG_ALT =
  "Honolulu Magazine clipping naming By Nikolle the Best Natural Facial.";

// Fases discretas da narrativa (regem TODA a opacidade via data-attributes):
// 1 atmosfera · 2 headline · 3 materialidade · 4 selo/ápice · 5 conclusão
// (quote) · 6 encerramento (CTA).
// Cada tabela guarda as FRONTEIRAS: passar t[i] entra na fase i+1.
//
// DESKTOP (key visual, intocado): tudo que entra FICA, e a composição se
// acumula até virar o quadro do gabarito.
//
// MOBILE tem tabela PRÓPRIA e narrativa de DOIS PRATOS (direção do Gabriel,
// 08/08): 1/2/3 nascem em ZERO, ou seja, a seção CHEGA com o título E a
// revista já na tela (o artefato é a prova, não faz sentido escondê-lo); 4 a
// headline sai e a revista sobe para o lugar dela; 5 a citação entra abaixo
// do artefato; 6 fecha com fonte + CTA. O lockup que repetia a headline saiu,
// e com ele o terceiro prato inteiro: a citação e o CTA agora convivem com a
// revista, e a seção custa metade da rolagem que custava.
const PH_DESK = [0.012, 0.06, 0.19, 0.4, 0.6, 0.78];
const PH_MOB = [0, 0, 0, 0.16, 0.42, 0.54];
const phaseOf = (v: number, t: number[]) => {
  for (let i = t.length - 1; i >= 0; i--) if (v >= t[i]) return i + 1;
  return 0;
};

// Seta fina ↗ do disco do CTA (decorativa; o texto do link é o rótulo).
function ArrowNE({ className }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4.5 13.5 13.2 4.8M6.6 4.5h6.9v6.9"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// Seta ↓ do hint de scroll (decorativa).
function ArrowDown() {
  return (
    <svg
      width="9"
      height="14"
      viewBox="0 0 9 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.5 0.5v12M1 9.6l3.5 3.4L8 9.6"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Press() {
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

  // Desktop (>=1024px) = a composição do key visual; abaixo = a narrativa
  // própria do mobile (3 estados). As duas variantes vivem no MESMO DOM
  // (classes responsivas); o desk só escolhe QUAL conjunto de motion values
  // anima cada camada.
  const [desk, setDesk] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(DESK_MQ);
    const update = () => setDesk(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: sp } = useScroll({
    target: wrapRef,
    offset: ["start start", "end end"],
  });

  const table = desk ? PH_DESK : PH_MOB;
  const [live, setLive] = useState(false);
  const [phase, setPhase] = useState(0);
  useMotionValueEvent(sp, "change", (v) => {
    const p = phaseOf(v, table);
    setPhase((prev) => (prev === p ? prev : p));
  });
  useEffect(() => {
    // Reload no meio da página: a fase nasce do progresso atual (medido
    // pós-layout, num frame) e só então a coreografia arma — sem flicker.
    // Vale também para a troca de tabela quando o breakpoint muda.
    const raf = requestAnimationFrame(() => {
      setPhase(phaseOf(sp.get(), table));
      setLive(true);
    });
    return () => cancelAnimationFrame(raf);
  }, [sp, table]);

  // Presença de cada peça. A única que troca de regra entre as variantes é a
  // headline: no desktop ela FICA (é o key visual se compondo), no mobile ela
  // cede o lugar para a revista subir. O artefato, uma vez em cena, não sai
  // mais em nenhuma das duas.
  const on = (v: boolean) => (v ? "" : undefined);
  const inAtmo = on(phase >= 1);
  const inHead = on(desk ? phase >= 2 : phase >= 2 && phase < 4);
  const inArt = on(phase >= 3);
  // O selo é o carimbo do SEGUNDO prato: na chegada da seção ele ainda não
  // existe, senão o cartaz de entrada nasce com três objetos disputando.
  const inSeal = on(desk ? phase >= 3 : phase >= 4);
  const inQuote = on(phase >= 5);
  const inEnd = on(phase >= 6);
  const inHint = on(phase >= 1 && phase < 5);
  // Indicador: 3 estados no desktop, 2 no mobile (lá a seção tem 2 pratos).
  const step = desk
    ? phase >= 5
      ? 2
      : phase >= 4
        ? 1
        : 0
    : phase >= 4
      ? 1
      : 0;

  // ---- Contínuo (motion values; só transform) ----
  // Fundo: deriva vertical lentíssima + câmera assentando (a camada é um slot
  // trocável: substituir o <Image> por <video> no futuro não muda a cena).
  // UNIDADE VERTICAL DA CENA: svh, nunca vh (corrigido 09/08). O palco é
  // height:100svh e o wrapper 170svh, mas todo o percurso viajava em vh. No
  // Safari do iPhone vh é o viewport GRANDE (barra de URL escondida) e svh é o
  // PEQUENO (barra visível), com 10% a 15% de diferença; no DevTools os dois
  // são iguais, porque a emulação não simula a barra. Resultado: no celular
  // real cada deslocamento passava ~12% do ponto (a revista chegava mais baixa,
  // a folha de papel ficava pendurada), e nada disso aparecia no DevTools.
  // Caixa e percurso agora medem pela MESMA régua.
  const bgY = useTransform(sp, [0, 1], ["0svh", "-3svh"]);
  const bgScale = useTransform(sp, [0, 0.4], [1.045, 1]);

  // DESKTOP — entradas curtas e elegantes + deriva de saída diferenciada
  // (velocidades relativas do briefing: headline 0.15 < folhas 0.22 <
  // revista 0.32 < serum 0.55 < selo 0.72).
  const dNamedX = useTransform(sp, [0.06, 0.26], ["-3.2vw", "0vw"], { ease: EASE_OUT });
  const dNatX = useTransform(sp, [0.1, 0.3], ["3vw", "0vw"], { ease: EASE_OUT });
  const dHeadY = useTransform(sp, [0.6, 0.92], ["0svh", "-3svh"]);
  const dSheetY = useTransform(sp, [0.17, 0.42, 1], ["15svh", "0svh", "-2.2svh"], { ease: EASE_OUT });
  const dSheet2Y = useTransform(sp, [0.2, 0.46, 1], ["18svh", "0svh", "-3svh"], { ease: EASE_OUT });
  const dMagY = useTransform(sp, [0.22, 0.5, 1], ["24svh", "0svh", "-3.6svh"], { ease: EASE_OUT });
  const dMagR = useTransform(sp, [0.22, 0.5], [-6.5, -2.5]);
  const dSerumY = useTransform(sp, [0.26, 0.7, 1], ["78svh", "0svh", "-6.5svh"], { ease: EASE_OUT });
  const dSerumR = useTransform(sp, [0.26, 0.7], [5, 0]);
  const dSealY = useTransform(sp, [0.4, 0.66, 1], ["52svh", "0svh", "-5svh"], { ease: EASE_OUT });
  const dSealR = useTransform(sp, [0.4, 0.66], [-4, 6]);

  // MOBILE — os 2 pratos. A pilha de papel viaja como UM OBJETO (o y e a
  // escala moram no <figure>; as folhas só ATRASAM alguns vh dentro dele, o
  // que lê como profundidade em vez de três folhas soltas). Um movimento
  // principal e nada mais: a revista SOBE para o lugar da headline, e é essa
  // subida única que conta a seção inteira. Tudo em transform, opacidade é
  // das fases.
  const mHeadY = useTransform(sp, [0, 0.18, 0.44], ["0svh", "-1.5svh", "-30svh"], { ease: EASE_SCRUB });
  // Na chegada a revista está mais perto (1.06) e mais baixa: ela DEITA na
  // metade de baixo, embaixo do título. Ao subir, ela também assenta de
  // tamanho, e é esse "vir para o lugar" que faz a troca ler como uma coisa
  // só e não como dois quadros diferentes.
  // A subida ocupa METADE da rolagem presa (0.03 a 0.52), não um terço: com o
  // percurso espremido num terço, sobrava um trecho longo em que a rolagem não
  // produzia nada, e cena parada com o dedo andando lê como travamento.
  const mStackY = useTransform(sp, [0.02, 0.6, 1], ["40svh", "0svh", "-1svh"], { ease: EASE_SCRUB });
  const mStackS = useTransform(sp, [0.02, 0.6], [1.06, 1], { ease: EASE_SCRUB });
  // FOLHAS: o percurso encolheu (era 5vh e 8vh). Na CHEGADA a rolagem está em
  // zero, ou seja, o offset está no máximo, e é justamente esse o quadro que a
  // pessoa vê primeiro: com 5vh e 8vh o papel de trás pendurava meia folha
  // branca abaixo da revista e lia como bug de layout, não como pilha. Agora
  // elas só espiam, e quem faz o escalonamento é sobretudo a rotação própria
  // de cada uma (3.4deg e -5deg), que existe mesmo com o percurso em zero.
  const mSheetY = useTransform(sp, [0.04, 0.56], ["2.2svh", "0svh"], { ease: EASE_SCRUB });
  const mSheet2Y = useTransform(sp, [0.04, 0.6], ["3.6svh", "0svh"], { ease: EASE_SCRUB });
  const mMagR = useTransform(sp, [0.02, 0.62], [-6.5, -3.2]);
  // O selo é o carimbo: desce atrás da revista e assenta no canto DEPOIS dela,
  // que é o que faz a cena inteira parecer uma coisa só assentando.
  const mSealY = useTransform(sp, [0.2, 0.66, 1], ["44svh", "0svh", "-3svh"], { ease: EASE_SCRUB });
  const mSealR = useTransform(sp, [0.2, 0.66], [-8, 5]);
  // A citação e o CTA sobem um passo curto atrás do artefato (o pé da cena).
  const mQuoteY = useTransform(sp, [0.4, 0.74], ["12svh", "0svh"], { ease: EASE_SCRUB });

  // ---- Deriva de cursor (desktop, pointer fine, sem reduce): serum e selo
  // respiram ±6-10px com mola; nunca seguem o cursor direto. ----
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const drift = { stiffness: 40, damping: 14, mass: 0.6 };
  const serumDX = useSpring(useTransform(px, [-1, 1], [-6, 6]), drift);
  const serumDY = useSpring(useTransform(py, [-1, 1], [-4, 4]), drift);
  const sealDX = useSpring(useTransform(px, [-1, 1], [-10, 10]), drift);
  const sealDY = useSpring(useTransform(py, [-1, 1], [-7, 7]), drift);
  useEffect(() => {
    if (!desk || reduced) {
      px.set(0);
      py.set(0);
      return;
    }
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const el = stageRef.current;
    if (!el) return;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      px.set(((e.clientX - r.left) / r.width) * 2 - 1);
      py.set(((e.clientY - r.top) / r.height) * 2 - 1);
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    return () => el.removeEventListener("pointermove", onMove);
  }, [desk, reduced, px, py]);

  const mv = <T,>(d: T, m: T) => (anim ? (desk ? d : m) : undefined);

  return (
    <section
      aria-labelledby="press-heading"
      data-live={anim && live ? "" : undefined}
      className="press relative"
    >
      {/* Wrapper alto: o tempo da narrativa (240svh no mobile, 340svh no
          desktop — ver .pe-wrap). Reduced: altura natural. */}
      <div ref={wrapRef} className={cn("relative", anim && "pe-wrap")}>
        {/* A cena. O clip mora AQUI (nunca em ancestral do sticky). */}
        <div
          ref={stageRef}
          className={cn(
            anim
              ? "sticky top-0 h-screen [height:100svh] overflow-clip"
              : "relative overflow-clip",
          )}
        >
          {/* 0 · FUNDO próprio da seção (slot trocável por <video> no futuro):
              gesso quente + sombra de folhagem + cáusticas d'água, deriva
              lentíssima. Sem gradiente por cima (o asset já traz a luz). */}
          <motion.div
            aria-hidden="true"
            style={anim ? { y: bgY, scale: bgScale } : undefined}
            className="absolute -inset-y-[4%] inset-x-0 z-0"
          >
            <Image
              src="/images/press/press-background-desktop.png"
              alt=""
              fill
              sizes="100vw"

              className="hidden object-cover min-[768px]:block"
            />
            <Image
              src="/images/press/press-background-mobile.png"
              alt=""
              fill
              sizes="100vw"

              className="block object-cover min-[768px]:hidden"
            />
          </motion.div>

          {anim ? (
            <>
              {/* 1 · Eyebrow (pill) + indicador de progressão. UMA pill só, do
                  começo ao fim, nas duas variantes: no mobile a antiga troca
                  por uma segunda pill idêntica dentro da conclusão fazia duas
                  aparecerem juntas por meio segundo, e lia como bug. */}
              {/* No mobile a dupla vive ATRÁS dos artefatos (z-15): quando a
                  revista sobe para sair, ela PASSA POR CIMA do rótulo em vez
                  de o rótulo boiar sobre a página da revista. Objeto na frente
                  ocultando etiqueta é física; etiqueta sobre a página é bug.
                  No desktop nada cruza esse canto, então a ordem antiga fica. */}
              <p
                data-in={inAtmo}
                className="pe-fade pe-rise pe-pill absolute left-[5vw] top-[max(96px,11svh)] z-[15] min-[1024px]:top-[7svh] min-[1024px]:z-[46]"
              >
                {EYEBROW}
              </p>
              <p
                aria-hidden="true"
                data-in={inAtmo}
                data-step={step}
                className="pe-fade pe-ind absolute right-[5vw] top-[max(104px,11.8svh)] z-[15] min-[1024px]:top-[8svh] min-[1024px]:z-[45]"
              >
                {IND.map((t, i) => (
                  <span key={t} data-on={step === i ? "" : undefined}>
                    {t}
                  </span>
                ))}
              </p>

              {/* 2 · HEADLINE monumental (camada que sai pelo topo no mobile).
                  Caixa alta é do próprio roteiro; sr-only em caixa de
                  sentença para leitura limpa. */}
              <motion.div
                style={mv(undefined, { y: mHeadY })}
                className="absolute inset-0 z-10 [will-change:transform]"
              >
                {/* No mobile a headline + microcopy fluem numa coluna (que sai
                    pelo topo juntas); no desktop o invólucro vira contents e
                    cada peça assume a coordenada do key visual. */}
                <div className="absolute inset-x-[5vw] top-[max(168px,19.5svh)] min-[1024px]:[display:contents]">
                  <h2 id="press-heading">
                    <span className="sr-only">Named Best natural facial.</span>
                    {/* Desktop: a tensão editorial do key visual. */}
                    <span aria-hidden="true" className="hidden min-[1024px]:block">
                      <motion.span
                        data-in={inHead}
                        style={mv({ x: dNamedX, y: dHeadY }, undefined)}
                        className="pe-fade pe-sans absolute left-[4.6vw] top-[13.5svh] block whitespace-nowrap leading-[0.85] text-[color:var(--press-ink)] [font-size:clamp(84px,9.5vw,182px)] [will-change:transform]"
                      >
                        {HEAD_SANS}
                      </motion.span>
                      <motion.span
                        data-in={inHead}
                        style={mv({ x: dNatX, y: dHeadY }, undefined)}
                        className="pe-fade pe-italic absolute left-[29vw] top-[26.5svh] block whitespace-nowrap leading-[1] text-[color:var(--press-ink)] [font-size:clamp(78px,9.2vw,176px)] [will-change:transform]"
                      >
                        {HEAD_ITALIC}
                      </motion.span>
                    </span>
                    {/* Mobile: NAMED / BEST+natural / facial. (estado 01). */}
                    <span
                      aria-hidden="true"
                      data-in={inHead}
                      className="pe-fade block text-[color:var(--press-ink)] min-[1024px]:hidden"
                    >
                      <span className="pe-sans block leading-[0.88] [font-size:14.5vw] min-[768px]:[font-size:9vw]">
                        NAMED
                      </span>
                      <span className="pe-sans block whitespace-nowrap leading-[0.88] [font-size:14.5vw] min-[768px]:[font-size:9vw]">
                        BEST
                        {/* Fio de ar antes do itálico: encostado, 'BESTnatural'
                            lia como palavra única, não como tensão editorial. */}
                        <span className="pe-italic relative -top-[1.2vw] ms-[0.07em] [font-size:1.26em] [letter-spacing:-0.02em]">
                          natural
                        </span>
                      </span>
                      <span className="pe-italic block pl-[33vw] leading-[0.92] [font-size:19vw] min-[768px]:[font-size:11.5vw]">
                        facial.
                      </span>
                    </span>
                  </h2>
                  {/* Microcopy de reconhecimento: presente desde a entrada. */}
                  <p
                    data-in={inHead}
                    className="pe-fade pe-rise pe-label mt-7 min-[1024px]:absolute min-[1024px]:left-[4.8vw] min-[1024px]:top-[32.5svh] min-[1024px]:mt-0"
                  >
                    {WINNER}
                  </p>
                </div>
              </motion.div>

              {/* 3 · A REVISTA como objeto físico: folhas de papel atrás
                  (HTML/CSS), o recorte real por cima, tudo em velocidades
                  próprias. figure carrega o alt significativo. */}
              <motion.figure
                style={mv(undefined, { y: mStackY, scale: mStackS })}
                className="pe-stack absolute left-[12vw] top-[max(166px,19.6svh)] z-[22] w-[64vw] max-[1023px]:[will-change:transform] min-[768px]:left-[26vw] min-[768px]:w-[44vw] min-[1024px]:left-[5.5vw] min-[1024px]:top-[38svh] min-[1024px]:w-[clamp(360px,28vw,570px)]"
              >
                <motion.span
                  aria-hidden="true"
                  data-in={inArt}
                  style={mv({ y: dSheetY }, { y: mSheetY })}
                  className="pe-fade pe-sheet absolute inset-0 rotate-[3.4deg] [will-change:transform]"
                />
                <motion.span
                  aria-hidden="true"
                  data-in={inArt}
                  style={mv({ y: dSheet2Y }, { y: mSheet2Y })}
                  className="pe-fade pe-sheet pe-sheet-2 absolute inset-0 -rotate-[5deg] [will-change:transform]"
                />
                <motion.span
                  data-in={inArt}
                  style={mv({ y: dMagY, rotate: dMagR }, { rotate: mMagR })}
                  className="pe-fade relative block [will-change:transform]"
                >
                  <Image
                    src="/images/press/press-magazine-honolulu.png"
                    alt={MAG_ALT}
                    width={796}
                    height={936}

                    sizes="(max-width: 767px) 64vw, (max-width: 1023px) 44vw, 27vw"
                    className="pe-mag block h-auto w-full"
                  />
                </motion.span>
              </motion.figure>

              {/* 4 · QUOTE + fonte + CTA (a conclusão editorial). No mobile é
                  o PÉ do segundo prato: entra abaixo do artefato, no lugar do
                  lockup que repetia a headline. Ancorado pela base porque a
                  revista é ancorada pelo topo, e assim os dois nunca disputam
                  o mesmo pixel em telas de altura diferente. No desktop,
                  display:contents solta cada peça na coordenada do key visual. */}
              <motion.div
                style={mv(undefined, { y: mQuoteY })}
                className="pe-conclusion absolute inset-x-[5vw] bottom-[4svh] z-[24] max-[1023px]:[will-change:transform] min-[1024px]:[display:contents]"
              >
                <figure
                  data-in={inQuote}
                  className="max-w-[86vw] min-[1024px]:absolute min-[1024px]:left-[46vw] min-[1024px]:top-[56svh] min-[1024px]:w-[clamp(270px,20vw,380px)] min-[1024px]:max-w-none"
                >
                  <span
                    aria-hidden="true"
                    className="pe-qmark font-display italic"
                  >
                    {"“"}
                  </span>
                  <blockquote className="font-display font-medium text-graphite">
                    <span className="sr-only">{QUOTE}</span>
                    {/* Desktop: 3 linhas serenas (key visual). */}
                    <span
                      aria-hidden="true"
                      className="hidden text-[clamp(19px,1.75vw,27px)] leading-[1.5] min-[1024px]:block"
                    >
                      <span className="pe-qline"><span>You leave with a</span></span>
                      <span className="pe-qline [--qd:0.12s]"><span>radiant glow and a</span></span>
                      <span className="pe-qline [--qd:0.24s]"><span>relaxed state of mind.</span></span>
                    </span>
                    {/* Mobile: 3 LINHAS, com 'radiant glow' em itálico maior
                        na linha do meio (a ênfase do mock fica; o que saiu foi
                        a quebra em 4, que empilhava demais para o tamanho do
                        pé da cena). */}
                    <span
                      aria-hidden="true"
                      className="pe-q-m block text-[6.4vw] leading-[1.32] min-[768px]:text-[4.2vw] min-[1024px]:hidden"
                    >
                      <span className="pe-qline"><span>You leave with a</span></span>
                      <span className="pe-qline [--qd:0.12s]">
                        <span className="pe-italic py-[0.06em] text-[1.38em] leading-[1.05]">
                          radiant glow
                        </span>
                      </span>
                      <span className="pe-qline [--qd:0.24s]">
                        <span>and a relaxed state of mind.</span>
                      </span>
                    </span>
                  </blockquote>
                  <figcaption
                    data-in={inEnd}
                    className="pe-fade pe-rise pe-label mt-7 min-[1024px]:mt-5"
                  >
                    {SOURCE}
                  </figcaption>
                </figure>
                <a
                  href={FEATURE_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-in={inEnd}
                  className="pe-fade pe-rise pe-cta focus-ripple mt-10 self-start min-[1024px]:absolute min-[1024px]:right-[4.4vw] min-[1024px]:top-[43svh] min-[1024px]:mt-0 min-[1024px]:flex-col"
                >
                  <span className="pe-cta-disc">
                    <ArrowNE className="pe-cta-arrow" />
                  </span>
                  <span className="pe-cta-label">{CTA_LABEL}</span>
                </a>
              </motion.div>

              {/* 5 · SERUM SCULPTURE: o primeiro plano translúcido, a camada
                  mais rápida, cruzando a tipografia. SÓ NO DESKTOP (ordem do
                  Gabriel, 08/08): no mobile ele aparecia sozinho na lateral,
                  sem relação com nada, e era ele que ocupava o espaço que
                  agora é da revista. O drift de cursor vive num wrapper
                  interno (não briga com o y do scroll). */}
              <motion.div
                aria-hidden="true"
                style={mv({ y: dSerumY, rotate: dSerumR }, undefined)}
                className="pointer-events-none absolute left-[57.5vw] top-[24svh] z-30 hidden w-[clamp(470px,38.5vw,780px)] min-[1024px]:block [will-change:transform]"
              >
                <motion.span
                  style={anim && desk ? { x: serumDX, y: serumDY } : undefined}
                  className="block"
                >
                  <Image
                    src="/images/press/press-serum-sculpture.png"
                    alt=""
                    width={1086}
                    height={1448}

                    sizes="33vw"
                    className="pe-serum block h-auto w-full"
                  />
                </motion.span>
              </motion.div>

              {/* 6 · O SELO: independente, mais rápido, leve rotação. A
                  microcopy WINNER já dá o equivalente textual (alt vazio). No
                  mobile ele é o CARIMBO do segundo prato: chega depois da
                  revista pousar e assenta no canto de baixo dela. */}
              <motion.div
                aria-hidden="true"
                data-in={inSeal}
                style={mv({ y: dSealY, rotate: dSealR }, { y: mSealY, rotate: mSealR })}
                className="pe-seal-w pe-fade pointer-events-none absolute left-[62vw] top-[45svh] z-40 w-[24vw] min-[768px]:left-[60vw] min-[768px]:w-[15vw] min-[1024px]:left-[31vw] min-[1024px]:top-[78svh] min-[1024px]:w-[clamp(130px,10.8vw,205px)] [will-change:transform]"
              >
                <motion.span
                  style={anim && desk ? { x: sealDX, y: sealDY } : undefined}
                  className="block"
                >
                  <Image
                    src="/images/press/press-best-of-honolulu-seal.png"
                    alt=""
                    width={600}
                    height={600}
                    sizes="(max-width: 767px) 24vw, (max-width: 1023px) 15vw, 11vw"
                    className="pe-seal block h-auto w-full"
                  />
                </motion.span>
              </motion.div>

              {/* 7 · Hint de entrada. SÓ NO DESKTOP: no mobile a revista chega
                  cortada pela borda de baixo, e um objeto cortado é uma deixa
                  de rolagem melhor do que um rótulo (que ainda por cima cairia
                  em cima dela). */}
              <p
                aria-hidden="true"
                data-in={inHint}
                className="pe-fade pe-label absolute bottom-[3svh] left-[5vw] z-[12] hidden items-center gap-3 min-[1024px]:left-auto min-[1024px]:right-[4.6vw] min-[1024px]:bottom-[5svh] min-[1024px]:flex"
              >
                {HINT}
                <ArrowDown />
              </p>
            </>
          ) : (
            /* ---- REDUCED MOTION: composição estática vertical, sem pin,
                   todo o conteúdo acessível. ---- */
            <div className="relative z-[1] mx-auto max-w-[1080px] px-6 py-24 min-[768px]:px-12">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-[16%] top-[8%] w-[64%] max-w-[520px] opacity-90"
              >
                <Image
                  src="/images/press/press-serum-sculpture.png"
                  alt=""
                  width={1086}
                  height={1448}
                  sizes="(max-width: 767px) 64vw, 520px"
                  className="pe-serum block h-auto w-full"
                />
              </div>
              <p className="pe-pill inline-block">{EYEBROW}</p>
              <h2 id="press-heading" className="relative mt-10 text-[color:var(--press-ink)]">
                <span className="sr-only">Named Best natural facial.</span>
                <span aria-hidden="true">
                  <span className="pe-sans block leading-[0.88] [font-size:clamp(52px,11vw,150px)]">
                    {HEAD_SANS}
                  </span>
                  <span className="pe-italic block leading-[1.02] pl-[8%] [font-size:clamp(44px,9.5vw,132px)]">
                    {HEAD_ITALIC}
                  </span>
                </span>
              </h2>
              <p className="pe-label mt-6">{WINNER}</p>
              <figure className="relative mt-14 w-[min(420px,82%)]">
                <span aria-hidden="true" className="pe-sheet absolute inset-0 rotate-[3.4deg]" />
                <span aria-hidden="true" className="pe-sheet pe-sheet-2 absolute inset-0 -rotate-[5deg]" />
                <span className="relative block rotate-[-2.5deg]">
                  <Image
                    src="/images/press/press-magazine-honolulu.png"
                    alt={MAG_ALT}
                    width={796}
                    height={936}
                    sizes="(max-width: 767px) 82vw, 420px"
                    className="pe-mag block h-auto w-full"
                  />
                </span>
                <span
                  aria-hidden="true"
                  className="absolute -bottom-[9%] -right-[7%] block w-[38%] rotate-[6deg]"
                >
                  <Image
                    src="/images/press/press-best-of-honolulu-seal.png"
                    alt=""
                    width={600}
                    height={600}
                    sizes="160px"
                    className="pe-seal block h-auto w-full"
                  />
                </span>
              </figure>
              <figure className="mt-20 max-w-[560px]">
                <span aria-hidden="true" className="pe-qmark font-display italic">
                  {"“"}
                </span>
                <blockquote className="font-display text-[clamp(22px,3.4vw,30px)] font-medium leading-[1.45] text-graphite">
                  {QUOTE}
                </blockquote>
                <figcaption className="pe-label mt-6">{SOURCE}</figcaption>
              </figure>
              <a
                href={FEATURE_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="pe-cta focus-ripple mt-12"
              >
                <span className="pe-cta-disc">
                  <ArrowNE className="pe-cta-arrow" />
                </span>
                <span className="pe-cta-label">{CTA_LABEL}</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
