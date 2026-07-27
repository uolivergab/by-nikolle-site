"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { HeroInvite } from "@/components/ui/HeroInvite";
import { BOOKING_SMS_HREF } from "@/lib/booking";

// Hero — gabarito ABSOLUTO: os dois mocks aprovados do Gabriel (desktop
// 1672x943, mobile 943x1672). roteiro.md manda na copy; design.md item 1 traz a
// geometria medida nos mocks.
//
// LEIS DESTA SEÇÃO (o que a versão anterior errava):
// 1. A fotografia é FULL-BLEED nos dois breakpoints. No mobile ela NÃO é um
//    card com margem: o espaço negativo de linho do topo faz parte do próprio
//    asset 9:16 e o texto pousa sobre ele.
// 2. A headline tem TRÊS LINHAS REAIS no markup e uma DUPLA tipográfica:
//    Inter Tight 500 na estrutura, Bodoni Moda itálico em Conscious / Health /
//    Well-Being. A última palavra é FIXA: "Well-Being" (o slot que ciclava saiu,
//    ver design.md).
// 3. Sem lavagem branca sobre a foto. Só um sopro local na coluna de texto do
//    desktop, e nada no mobile (o linho do asset já dá o contraste).

const OKINA = "ʻ"; // ʻokina de Kakaʻako

// Atraso de entrada de cada peça, em segundos.
const d = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

export function Hero() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Deriva de saída MUITO contida (o briefing pede o estado estático aprovado
  // como prioridade, e proíbe parallax intenso): a copy só se apaga enquanto o
  // hero deixa a tela. Sem deslocamento, sem escala, nada que mude as relações
  // visuais que estão sendo comparadas com o mock.
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const copyOpacity = useTransform(
    scrollYProgress,
    [0, 0.8],
    [1, reduced ? 1 : 0.25],
  );

  // O vídeo ambiente também respeita prefers-reduced-motion: pausa no frame.
  useEffect(() => {
    if (!reduced || !sectionRef.current) return;
    sectionRef.current
      .querySelectorAll("video")
      .forEach((video) => video.pause());
  }, [reduced]);

  return (
    <section
      ref={sectionRef}
      data-live="true"
      className="hero relative h-svh min-h-[600px] overflow-hidden bg-linen"
    >
      {/* ---------- 1. FOTOGRAFIA, full-bleed nos dois breakpoints ----------
          O quadro do mobile é 8% MAIS ALTO que a seção e ancorado na BASE: o
          vídeo 9:16 traz a modelo um pouco mais alta que o still do mock, e o
          parágrafo caía sobre o rosto e a credencial sobre o queixo. Cortando o
          topo, ela sobe para a faixa 57%-79% da altura, que é onde o modelo
          aprovado a coloca, e a tigela segue aparecendo cortada no canto
          inferior direito. */}
      <div className="hero-media absolute inset-x-0 top-0 bottom-0 overflow-hidden">
        <video
          className="absolute inset-0 hidden h-full w-full object-cover [object-position:62%_50%] md:block"
          autoPlay
          muted
          loop
          playsInline
          poster="/videos/hero-desktop-poster.jpg"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/videos/hero-desktop.mp4" type="video/mp4" />
        </video>
        <video
          className="absolute inset-x-0 top-0 block h-[107%] w-full object-cover [object-position:55%_0%] md:hidden"
          autoPlay
          muted
          loop
          playsInline
          poster="/videos/hero-mobile-poster.jpg"
          aria-hidden="true"
          tabIndex={-1}
        >
          <source src="/videos/hero-mobile.mp4" type="video/mp4" />
        </video>
      </div>

      {/* ---------- 2. SOPRO local da coluna de texto (só desktop) ----------
          Máximo 26% de linho e some antes da metade da tela. Não é véu. No
          mobile não existe: o campo de linho do próprio asset já dá contraste. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden bg-(image:--hero-copy-breath) md:block"
      />

      {/* ---------- 3. MOLDURA ----------
          Desktop: retângulo fino enquadrando a modelo (left 52% / right 7% /
          top 11.5% / bottom 6.5%), atrás de tudo.
          Mobile: moldura ABERTA — laterais a 5.5% e topo partido em dois
          segmentos, com o vão central caindo sobre o cabelo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
      >
        {/* desktop */}
        <span className="hero-frame-rule hidden md:block top-[11.5%] left-[52%] right-[7%] h-px" />
        <span className="hero-frame-rule hidden md:block bottom-[6.5%] left-[52%] right-[7%] h-px" />
        <span className="hero-frame-rule hidden md:block top-[11.5%] bottom-[6.5%] left-[52%] w-px" />
        <span className="hero-frame-rule hidden md:block top-[11.5%] bottom-[6.5%] right-[7%] w-px" />
        {/* mobile: topo em dois segmentos + laterais */}
        <span className="hero-frame-rule top-[56%] left-[5.5%] w-[28%] h-px md:hidden" />
        <span className="hero-frame-rule top-[56%] right-[5.5%] w-[28%] h-px md:hidden" />
        <span className="hero-frame-rule top-[56%] bottom-[10%] left-[5.5%] w-px md:hidden" />
        <span className="hero-frame-rule top-[56%] bottom-[10%] right-[5.5%] w-px md:hidden" />
      </div>

      {/* ---------- 4. COPY ----------
          Mobile: centrada, eyebrow a 17% da altura.
          Desktop: à esquerda (3.6vw), bloco centrado a 52% da altura, que é
          onde o mock o coloca (eyebrow em 264 de 943). */}
      <motion.div
        style={{ opacity: copyOpacity }}
        className="absolute inset-x-0 top-[max(92px,11.5%)] z-[3] px-[5.5vw] text-center md:inset-x-auto md:top-[53.5%] md:left-[3.6vw] md:max-w-[58vw] md:-translate-y-1/2 md:px-0 md:text-left"
      >
        <p
          style={d(0.15)}
          className="hero-rise mb-[22px] font-(family-name:--font-hero-ui) text-[11.5px] uppercase leading-[normal] tracking-[0.26em] text-(--hero-olive-ink) md:mb-[clamp(24px,4.9vh,46px)] md:text-[15px] md:tracking-[0.28em]"
        >
          {`Holistic Wellness Kaka${OKINA}ako`}
        </p>

        <h1 className="hero-title">
          <span className="sr-only">
            A Conscious Approach to Skincare, Health, and Well-Being
          </span>
          <span aria-hidden="true">
            <span style={d(0.3)} className="hero-title-line hero-rise">
              <span className="hero-sans">A </span>
              <span className="hero-italic">Conscious</span>
              <span className="hero-sans"> Approach</span>
            </span>
            <span style={d(0.42)} className="hero-title-line hero-rise">
              <span className="hero-sans">to Skincare, </span>
              <span className="hero-italic">Health</span>
              <span className="hero-sans">,</span>
            </span>
            <span style={d(0.54)} className="hero-title-line hero-rise">
              <span className="hero-sans">and </span>
              <span className="hero-italic">Well-Being</span>
            </span>
          </span>
        </h1>

        <p
          style={d(0.72)}
          className="hero-fade mx-auto mt-[26px] max-w-[78vw] font-(family-name:--font-hero-ui) text-[15px] font-light leading-[1.68] text-(--hero-ink) md:mx-0 md:mt-[clamp(26px,5.9vh,56px)] md:max-w-[520px] md:text-[19px] md:leading-[1.62]"
        >
          Discover personalized holistic facials and integrative wellness
          designed to nurture your skin, nourish your body, and restore balance.
        </p>
      </motion.div>

      {/* ---------- 5. RECONHECIMENTO ----------
          Desktop: encaixado no fio de baixo da moldura, com o filete correndo
          para a direita, como no mock. Mobile: logo acima do CTA. */}
      <motion.div
        style={{ opacity: copyOpacity }}
        aria-hidden="false"
        className="absolute inset-x-0 bottom-[calc(2.5svh+clamp(50px,6.6svh,58px)+16px)] z-[3] flex items-center justify-center px-[8%] md:inset-x-auto md:right-[7%] md:bottom-[calc(6.5%-7px)] md:left-[37.7%] md:justify-start md:gap-[22px] md:px-0"
      >
        <span
          aria-hidden="true"
          style={d(1.05)}
          className="hero-fade hidden h-px w-[30px] shrink-0 bg-(--hero-border) md:block"
        />
        <p
          style={d(1.05)}
          className="hero-fade font-(family-name:--font-hero-ui) text-[10.5px] uppercase leading-[normal] tracking-[0.26em] whitespace-nowrap text-(--hero-olive-ink) md:text-[13.5px] md:tracking-[0.24em]"
        >
          Best of Honolulu 2024 Winner
        </p>
        <span
          aria-hidden="true"
          style={d(1.05)}
          className="hero-fade hidden h-px flex-1 bg-(--hero-border) md:block"
        />
      </motion.div>

      {/* ---------- 6. CTA ---------- */}
      <div
        style={d(0.95)}
        className="hero-rise absolute bottom-[2.5svh] left-1/2 z-[4] w-[84%] -translate-x-1/2 md:bottom-[clamp(48px,10vh,95px)] md:w-[min(900px,54vw)]"
      >
        <HeroInvite
          href={BOOKING_SMS_HREF}
          className="h-[clamp(50px,6.6svh,58px)] w-full pr-[58px] pl-[26px] text-[11px] tracking-[0.2em] md:h-[clamp(56px,7.2vh,70px)] md:pr-[78px] md:pl-[42px] md:text-[13.5px] md:tracking-[0.21em]"
          discClassName="right-[5px] h-[clamp(40px,5.4svh,48px)] w-[clamp(40px,5.4svh,48px)] md:right-[7px] md:h-[clamp(44px,5.75vh,56px)] md:w-[clamp(44px,5.75vh,56px)]"
        >
          Book My Consultation
        </HeroInvite>
      </div>
    </section>
  );
}
