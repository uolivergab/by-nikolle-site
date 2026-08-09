"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { HeroInvite } from "@/components/ui/HeroInvite";
import { BOOKING_SMS_HREF } from "@/lib/booking";

// Hero — gabarito: os dois mocks aprovados do Gabriel (desktop 1672x943, mobile
// 943x1672). roteiro.md manda na copy; design.md item 1 traz a geometria.
//
// LEIS DESTA SEÇÃO:
// 1. A fotografia é FULL-BLEED nos dois breakpoints. No mobile ela NÃO é um
//    card com margem: o espaço negativo de linho do topo faz parte do próprio
//    asset 9:16 e o texto pousa sobre ele.
// 2. DUPLA TIPOGRÁFICA: Inter Tight na estrutura, Bodoni Moda itálico nas
//    palavras emocionais. Uma itálica por linha.
// 3. Sem lavagem branca sobre a foto. Só um sopro local na coluna de texto do
//    desktop, e nada no mobile (o linho do asset já dá o contraste).
//
// REVISÃO 30/07 (três pedidos diretos da Nikolle):
// (a) LOGO GRANDE de volta, centralizada no topo. A razão dela é de negócio e é
//     boa: "as pessoas entram no site e não sabem o nome do meu business, tá
//     sumido". Ela também resolveu o conflito das duas logos que tinha feito a
//     versão anterior sair (a grande centralizada AQUI, a "pequenininha do lado"
//     na navbar, que encolheu junto).
// (b) A FRASE VOLTA A RESPIRAR: as palavras Skincare / Health / Well-Being
//     aparecem uma de cada vez no fim da frase, em dissolve lento. Isso encurta
//     a headline de 3 para 2 linhas, que é justamente o espaço vertical que a
//     logo grande precisava. O slot é um inline-grid com as três candidatas
//     empilhadas na mesma célula: a largura já nasce da palavra mais larga, sem
//     medir nada em JS e sem a caixa pular na troca.
// (c) FRASES MENORES (overline e apoio) para o visual ficar mais limpo, sem
//     cair no "letra pequena demais" que ela criticou na referência de IA.

const OKINA = "ʻ"; // ʻokina de Kakaʻako

// Palavras do slot, na ordem que a Nikolle pediu. A frase inteira do roteiro
// vive no sr-only; aqui só a renderização.
const SLOT_WORDS = ["Skincare", "Health", "Well-Being"];
const SLOT_HOLD_MS = 2600;

// Atraso de entrada de cada peça, em segundos.
const d = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

export function Hero() {
  const reduced = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);

  // Slot vivo. Nasce em "Skincare" (a primeira da lista dela), então a frase
  // está inteira no ar já no SSR, sem buraco esperando JS. Com reduced-motion
  // o ciclo não roda e a frase descansa em "Well-Being", o fecho do roteiro.
  const [slot, setSlot] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const timer = setInterval(
      () => setSlot((prev) => (prev + 1) % SLOT_WORDS.length),
      SLOT_HOLD_MS,
    );
    return () => clearInterval(timer);
  }, [reduced]);
  const activeSlot = reduced ? SLOT_WORDS.length - 1 : slot;

  // TENTATIVA DESCARTADA (registrada para não se repetir): medir a palavra ativa
  // e transicionar a LARGURA do slot, para a frase fechar colada em todos os
  // estados. A medição realimenta o layout que ela mesma mede, e o resultado
  // medido no browser foi a palavra piscando e sumindo por ciclos inteiros. A
  // caixa fica com a largura da candidata mais larga, que é estável, e o vão
  // resolve-se no alinhamento (ver .hero-slot no globals.css).

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

      {/* ---------- 4. COPY (agora encabeçada pela LOGO GRANDE) ----------
          Mobile: tudo centrado sobre o campo de linho do próprio asset 9:16.
          Desktop: à esquerda (3.6vw), bloco centrado na faixa que sobra.
          A logo grande vive DENTRO deste bloco, não no centro geométrico da
          tela: no desktop o meio da cena é o rosto da modelo, e a marca ali
          fica ilegível e suja a fotografia. Encabeçando a coluna de texto ela
          ganha o destaque que a Nikolle pediu e continua pousada no campo
          claro. */}
      <motion.div
        style={{ opacity: copyOpacity }}
        className="absolute inset-x-0 top-[max(96px,11.5%)] z-[3] px-[5.5vw] text-center md:inset-x-auto md:top-[54%] md:left-[3.6vw] md:max-w-[58vw] md:-translate-y-1/2 md:px-0 md:text-left"
      >
        {/* Decorativa para o leitor de tela: o h1 logo abaixo nomeia a página e
            a navbar já carrega a marca acessível. */}
        <span
          aria-hidden="true"
          style={d(0.08)}
          className="hero-rise mb-[26px] block md:mb-[clamp(22px,4.4vh,40px)]"
        >
          {/* Mobile um passo menor (30/07): a 44vw a marca gritava; a 37vw ela
              comanda a tela sem perder a elegância. Desktop inalterado. */}
          <Logo className="mx-auto h-auto w-[clamp(132px,37vw,170px)] text-(--hero-ink) md:mx-0 md:w-[clamp(196px,15.5vw,262px)]" />
        </span>

        <p
          style={d(0.22)}
          className="hero-rise mb-[18px] font-(family-name:--font-hero-ui) text-[10.5px] uppercase leading-[normal] tracking-[0.26em] text-(--hero-olive-ink) md:mb-[clamp(20px,4vh,36px)] md:text-[13px] md:tracking-[0.28em]"
        >
          {`Holistic Wellness · Kaka${OKINA}ako`}
        </p>

        <h1 className="hero-title">
          <span className="sr-only">
            A Conscious Approach to Skincare, Health, and Well-Being
          </span>
          <span aria-hidden="true">
            <span style={d(0.34)} className="hero-title-line hero-rise">
              <span className="hero-sans">A </span>
              <span className="hero-italic">Conscious</span>
              <span className="hero-sans"> Approach</span>
            </span>
            <span style={d(0.46)} className="hero-title-line hero-rise">
              <span className="hero-sans">to </span>
              {/* SLOT: as três candidatas empilhadas na mesma célula do grid.
                  A largura é a da palavra mais larga desde o primeiro frame,
                  então a linha nunca reflui na troca. */}
              <span className="hero-slot">
                {SLOT_WORDS.map((word, i) => (
                  <span
                    key={word}
                    data-on={i === activeSlot ? "true" : undefined}
                    className="hero-slot-word hero-italic"
                  >
                    {word}
                  </span>
                ))}
              </span>
            </span>
          </span>
        </h1>

        <p
          style={d(0.64)}
          className="hero-fade mx-auto mt-[22px] max-w-[78vw] font-(family-name:--font-hero-ui) text-[14px] font-light leading-[1.68] text-(--hero-ink) md:mx-0 md:mt-[clamp(22px,4.6vh,44px)] md:max-w-[470px] md:text-[17px] md:leading-[1.62]"
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

      {/* ---------- 6. CTA ----------
          No desktop o convite tinha largura fixa de até 900px e lia como uma
          BARRA atravessando a cena, não como um botão. Agora a pill se dimensiona
          pelo próprio conteúdo (texto + respiro + a pista do disco), que é o que
          faz uma peça parecer desenhada em vez de esticada. O mobile mantém a
          largura cheia, onde ela é a área de toque da tela inteira. */}
      <div
        style={d(0.95)}
        className="hero-rise absolute bottom-[2.5svh] left-1/2 z-[4] w-[84%] -translate-x-1/2 md:bottom-[clamp(48px,10vh,95px)] md:left-[3.6vw] md:w-auto md:translate-x-0"
      >
        <HeroInvite
          href={BOOKING_SMS_HREF}
          className="h-[clamp(50px,6.6svh,58px)] w-full pr-[58px] pl-[26px] text-[11px] tracking-[0.2em] md:h-[clamp(54px,6.6vh,64px)] md:w-auto md:pr-[76px] md:pl-[40px] md:text-[12.5px] md:tracking-[0.2em]"
          discClassName="right-[5px] h-[clamp(40px,5.4svh,48px)] w-[clamp(40px,5.4svh,48px)] md:right-[6px] md:h-[clamp(42px,5.4vh,52px)] md:w-[clamp(42px,5.4vh,52px)]"
        >
          Book My Consultation
        </HeroInvite>
      </div>
    </section>
  );
}
