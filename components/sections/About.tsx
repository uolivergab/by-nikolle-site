"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { TideButton } from "@/components/ui/TideButton";

// Seção 6 — Sobre Nikolle. VALE morno (design.md item 6): o momento pessoal e
// humano do site, depois do pico do Programa e da prova. Carta em 1ª pessoa (a
// cliente é a heroína, Nikolle a mentora). LAYOUT assimétrico: retrato em ARCO
// SUAVE à esquerda (~0.82fr) + a nota à direita (~1fr), gap 88px, campo LINHO
// SEM olive (o calor vem da fotografia e da voz). Copy 100% do roteiro.md
// (intocável — o texto segue o roteiro, não o mock, que havia alterado o 2º
// parágrafo). Gabarito visual: mock-secao6-sobre-v3.html.
//
// Reveal por data-live como as demais vales (S2/S3/S5): nasce visível e estático
// sem JS/observer e some em prefers-reduced-motion. A assinatura Parisienne
// (terceira voz, uso único) se revela esquerda->direita ('sendo escrita') por
// clip-path progressivo, não stroke-draw.

// REVISÃO 30/07 (item 6 da Nikolle):
// (a) TÍTULO: "Nice to meet you," virou "Aloha, I'm Nikolle." e o texto deixou
//     de repetir o nome logo abaixo (ela: "não é necessário repetir meu nome
//     novamente; começar diretamente com Founder of By Nikolle").
// (b) A seção estava COMPRIDA DEMAIS ("gostaria de manter todo o conteúdo
//     atual, porém mostrar apenas o início do texto e adicionar um botão abaixo
//     para expandir"). Nada foi cortado: a carta abre com a apresentação e o
//     primeiro parágrafo, e o resto (2 parágrafos + credenciais) vive atrás do
//     botão "Full Story", que é um dos rótulos que ela mesma sugeriu.

// Delay (ms) do stagger de reveal por elemento (valor dinâmico por índice),
// inerte sem data-live e sob prefers-reduced-motion (igual às S3/S5).
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

export function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);
  const [openStory, setOpenStory] = useState(false);

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

  return (
    <section
      ref={sectionRef}
      id="about"
      data-live={live ? "true" : undefined}
      className="about bg-linen"
    >
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-10 px-6 pt-14 pb-10 min-[881px]:grid-cols-[0.82fr_1fr] min-[881px]:gap-[88px] min-[881px]:px-12 min-[881px]:pt-[88px] min-[881px]:pb-16">
        {/* Retrato em ARCO SUAVE (a forma sancionada para retratos): raio grande
            no topo, base quase reta. Contorno oliva 1px (outline, não sombra);
            object-position mira o rosto (lei óptica: rosto bem iluminado). */}
        <div
          className="s6-rise mx-auto w-full max-w-[340px] min-[881px]:mx-0 min-[881px]:max-w-none"
          style={delay(0)}
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[150px] rounded-b-[8px] bg-sand [outline:1px_solid_color-mix(in_srgb,var(--olive)_20%,transparent)] [outline-offset:-1px] min-[881px]:rounded-t-[190px]">
            <Image
              src="/images/retrato-nikolle.webp"
              alt="Portrait of Nikolle, founder of by Nikolle."
              fill
              sizes="(max-width: 880px) min(calc(100vw - 48px), 340px), 460px"
              className="object-cover [object-position:center_10%]"
            />
          </div>
        </div>

        {/* Coluna direita: a carta. max-width ~520px. */}
        <div className="max-w-[520px]">
          {/* Eyebrow: graphite-soft (AA — sage sobre linho em texto pequeno dá
              ~3.5:1; mesma correção da S2/S5, e casa com as demais eyebrows). */}
          <p
            className="s6-rise mb-5 text-[11px] uppercase tracking-[0.28em] text-graphite-soft"
            style={delay(80)}
          >
            The founder
          </p>

          {/* Título no tratamento v2 (acessibilidade espelhada do Hero): CAIXA
              ALTA só no visual (aria-hidden + uppercase por CSS) + 'Nikolle.' em
              itálico minúsculo (N maiúsculo — é o nome dela, a palavra pessoal);
              o leitor de tela lê o sr-only em caixa de sentença. Quebra fixa em 2
              linhas via <br/>: 'NICE TO MEET YOU,' / 'I'M Nikolle.' (o 'I'm' desce
              com o nome; desktop e mobile). Cada linha nowrap, clamp dimensionado
              para a linha mais longa caber na coluna. */}
          <h2
            className="s6-rise font-display leading-[1.12] text-graphite [font-size:clamp(30px,3.4vw,46px)]"
            style={delay(160)}
          >
            <span className="sr-only">{"Aloha, I'm Nikolle."}</span>
            <span
              aria-hidden="true"
              className="font-[550] tracking-[0.03em] whitespace-nowrap uppercase"
            >
              Aloha,
              <br />
              {"I'm "}
              <em className="font-voice font-medium tracking-normal normal-case italic">
                Nikolle.
              </em>
            </span>
          </h2>

          {/* Subtítulo: Cormorant itálico sage (design.md — o acento de voz
              suave da marca; único elemento sage desta coluna). */}
          <p
            className="s6-rise mt-4 mb-8 font-voice text-[clamp(18px,1.6vw,22px)] font-medium text-sage italic"
            style={delay(220)}
          >
            True beauty begins from within
          </p>

          {/* Nota dela: Hanken, texto NOVO integral do roteiro.md (revisão
              Nikolle 26/07): abertura Aloha + 3 parágrafos. O em-dash do
              original virou vírgula no P3 (regra 7, sem travessão visível). */}
          <div
            className="s6-rise text-[15.5px] leading-[1.75] text-graphite-soft"
            style={delay(280)}
          >
            {/* Abertura SEM repetir o nome (o título já disse). */}
            <p className="mb-4">
              {"Founder of By Nikolle | skin • nourishment • balance."}
            </p>
            <p>
              With over a decade of experience in skincare, By Nikolle was born
              from my passion for holistic skincare, integrative health,
              nutrition, and spirituality, and from the desire to create a space
              where skin health, wellness, and conscious living come together.
            </p>
          </div>

          {/* O RESTO DA CARTA + as credenciais: presentes no DOM, revelados pelo
              botão. grid-template-rows 0fr->1fr é a mecânica de expansão da casa
              (mesma do FAQ e do painel dos Programas). */}
          <div
            id="about-full-story"
            className="grid transition-[grid-template-rows] duration-[520ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none"
            style={{ gridTemplateRows: openStory ? "1fr" : "0fr" }}
          >
            <div className="overflow-hidden">
              <div className="pt-4 text-[15.5px] leading-[1.75] text-graphite-soft">
                <p className="mb-4">
                  Over the years, my vision of aesthetics and health has deeply
                  evolved. Through my studies and personal journey, I came to
                  understand that skin health goes far beyond surface-level
                  treatments, it reflects the balance of the body, mind, and
                  daily habits.
                </p>
                <p>
                  Today, By Nikolle is a reflection of my own evolution,
                  bringing together holistic skincare and wellness to support
                  transformation from the inside out.
                </p>
              </div>

              {/* Credentials & Training (roteiro.md — a Nik pediu 'mantenha
                  como está'; segue integral, só passou para dentro do painel). */}
              <div className="mt-7">
                <p className="text-[11px] uppercase tracking-[0.22em] text-graphite-soft">
                  Credentials & Training
                </p>
                <ul className="mt-3 space-y-1.5 text-[13.5px] leading-[1.6] text-graphite-soft">
                  <li>Licensed Esthetician - Flávia Leal Beauty Institute | Boston, MA</li>
                  <li>
                    Certified Integrative Nutrition Health Coach - Institute of
                    Integrative Nutrition (IIN) | Online
                  </li>
                  <li>Certified Marma Therapist - Ayuskama Ayurveda | Rishikesh, India</li>
                  <li>Ayurveda Nutrition & Cooking - Ayuskama Ayurveda | Rishikesh, India</li>
                  <li>
                    200-Hour Yoga Teacher Training - World Peace Yoga School |
                    Bali, Indonesia
                  </li>
                  <li>Reiki Level I & II Practitioner - Starseed Healing Journeys | Hawaii</li>
                </ul>
              </div>
            </div>
          </div>

          {/* O gatilho. Sem rótulo alternado (não inventamos copy): quem marca
              o estado é o chevron que gira, e o aria-expanded para o leitor. */}
          <div className="s6-rise mt-6" style={delay(340)}>
            <button
              type="button"
              onClick={() => setOpenStory((prev) => !prev)}
              aria-expanded={openStory}
              aria-controls="about-full-story"
              className="focus-ripple group inline-flex cursor-pointer items-center gap-3 border-b border-olive/45 pb-2 text-[11.5px] uppercase leading-[normal] tracking-[0.22em] text-graphite transition-colors hover:border-olive"
            >
              Full Story
              <svg
                width="13"
                height="8"
                viewBox="0 0 13 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                className={`transition-transform duration-[420ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none ${openStory ? "rotate-180" : ""}`}
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

          {/* Assinatura Parisienne — o único toque à mão do site, o pico humano.
              Ganha a revelação esquerda->direita ('sendo escrita') via s6-sign;
              em prefers-reduced-motion aparece inteira. aria-hidden: o nome já foi
              anunciado no título (evita repetição fora de contexto no leitor). */}
          <div className="mt-6 mb-1">
            <span
              aria-hidden="true"
              className="s6-sign inline-block font-signature text-[52px] leading-none text-graphite"
            >
              Nikolle Coelho
            </span>
          </div>

          {/* CTA maré (reusa o TideButton: borda 1px olive, água que sobe no
              hover, texto -> linho): 1 linha (nowrap), SEM sublinhado, link para
              #program. No mobile full-width com texto reduzido (11.5px / 0.08em)
              para caber em 1 linha em ~360-375px. */}
          <div className="s6-rise mt-6" style={delay(420)}>
            <TideButton
              href="#program"
              className="w-full px-4 text-[10.5px] tracking-[0.05em] min-[881px]:w-auto min-[881px]:px-8 min-[881px]:text-[13px] min-[881px]:tracking-[0.14em]"
            >
              Explore the Holistic Skincare Programs
            </TideButton>
          </div>
        </div>
      </div>
    </section>
  );
}
