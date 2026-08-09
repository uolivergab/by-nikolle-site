"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { BOOKING_PHONE_DISPLAY, BOOKING_SMS_HREF } from "@/lib/booking";

// Seção 8 — Footer (design.md item 8, REVISADO 30/07 pela Nikolle).
// O campo saiu do OLIVE e foi para o SAND (o bege da casa): pedido direto dela,
// e a troca fortalece o sistema em vez de enfraquecer — o olive passa a aparecer
// UMA vez só no site (o Programa vira o único mergulho escuro, que era a decisão
// da fronteira S4/S5) e o fecho fica na alternância linho/bege que ela pediu no
// áudio para marcar as divisórias entre etapas. LOCKUP CERIMONIAL preservado:
// logo (AMPLIADA a pedido) + linha d'água + reflexo a ~9% (o 2º e ÚLTIMO uso do
// reflexo no site). Copy e dados 100% do roteiro.md. TELEFONE: só o (808)
// 457-8823 — ela confirmou em 30/07 que o 721-7476 sai do site. SEM botão extra
// (a ação única já vive no hero/navbar; aqui o telefone É o link de SMS).
// Reveal por data-live; a linha se desenha do centro; degrada em reduced-motion.
// NOTA PERF: o reflexo duplica o SVG da logo (~95KB) — reforça a pendência de
// otimizar a logo (SVGO) antes do go-live.

const INSTAGRAM_URL = "https://www.instagram.com/by_nikolle_snb";

// Delay (ms) do stagger de reveal por elemento (inline por índice).
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

export function Footer() {
  const sectionRef = useRef<HTMLElement>(null);
  const [live, setLive] = useState(false);

  // Dispara o reveal quando o footer entra em view (uma vez). Sem observer/JS
  // tudo nasce visível e estático.
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

  return (
    <footer
      ref={sectionRef}
      data-live={live ? "true" : undefined}
      className="footer relative overflow-hidden bg-sand"
    >
      {/* Fronteira de cima: linha d'água fina (posse do footer sobre o linho). */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-sage/35"
      />

      <div className="mx-auto max-w-[1100px] px-6 pt-16 pb-10 min-[881px]:pt-20 min-[881px]:pb-12">
        {/* Lockup cerimonial: logo + linha + reflexo (scaleY(-1), ~9%, máscara
            derretendo para baixo). aria-hidden no reflexo (decorativo).
            Logo AMPLIADA a pedido da Nikolle (h-9/h-10 -> h-12/h-14). */}
        <div className="ft-rise flex flex-col items-center" style={delay(0)}>
          <Logo className="h-12 w-auto text-graphite min-[881px]:h-14" />
          <span
            aria-hidden="true"
            className="ft-line mt-5 h-px w-[110px] origin-center bg-sage/70"
          />
          <span
            aria-hidden="true"
            className="mt-1.5 inline-block opacity-[0.09] [transform:scaleY(-1)] [mask-image:linear-gradient(180deg,transparent_18%,black_92%)]"
          >
            <Logo className="h-12 w-auto text-graphite min-[881px]:h-14" />
          </span>
        </div>

        {/* Frase central (roteiro, revisão 26/07). */}
        <p
          className="ft-rise mx-auto mt-7 max-w-[36ch] text-center font-voice text-[clamp(19px,2vw,24px)] font-medium italic leading-[1.45] text-graphite"
          style={delay(140)}
        >
          Supporting your journey to skin health, nourishment, and balance.
        </p>

        {/* Dados práticos: rótulos exatamente como no roteiro. */}
        <div
          className="ft-rise mx-auto mt-12 grid max-w-[860px] grid-cols-1 gap-9 text-center min-[881px]:mt-16 min-[881px]:grid-cols-3 min-[881px]:gap-8 min-[881px]:text-left"
          style={delay(260)}
        >
          <div>
            <p className="text-[11px] uppercase leading-[normal] tracking-[0.22em] text-graphite-soft">
              Location
            </p>
            <p className="mt-3 text-[14.5px] leading-[1.7] text-graphite">
              Moa Wellness Center
              <br />
              {"Kakaʻako, Honolulu, HI"}
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase leading-[normal] tracking-[0.22em] text-graphite-soft">
              Text to Book
            </p>
            {/* UM número só (Nikolle, 30/07): o 721-7476 saiu do site. */}
            <p className="mt-3">
              <a
                href={BOOKING_SMS_HREF}
                className="focus-ripple text-[14.5px] leading-[1.7] text-graphite underline decoration-sage/50 underline-offset-4 transition-colors hover:decoration-olive"
              >
                {BOOKING_PHONE_DISPLAY}
              </a>
            </p>
            <p className="mt-5 text-[11px] uppercase leading-[normal] tracking-[0.22em] text-graphite-soft">
              Instagram
            </p>
            <p className="mt-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="focus-ripple text-[14.5px] leading-[1.7] text-graphite underline decoration-sage/50 underline-offset-4 transition-colors hover:decoration-olive"
              >
                @by_nikolle_snb
              </a>
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase leading-[normal] tracking-[0.22em] text-graphite-soft">
              Studio Hours
            </p>
            <p className="mt-3 text-[14.5px] leading-[1.7] text-graphite">
              Tuesday - Friday
              <br />
              10:30 AM - 6:00 PM
            </p>
            <p className="mt-2 text-[14.5px] leading-[1.7] text-graphite">
              First & Third Saturday of the month
              <br />
              10:30 AM - 5:00 PM
            </p>
            <p className="mt-2 text-[13px] leading-[1.7] text-graphite-soft">
              Appointments by booking only.
            </p>
          </div>
        </div>

        {/* Fecho (roteiro, revisão 26/07). Safe-area para iOS. */}
        <p
          className="ft-rise mt-12 pb-[env(safe-area-inset-bottom)] text-center font-voice text-[16px] italic text-graphite-soft min-[881px]:mt-16"
          style={delay(380)}
        >
          Mahalo for supporting our holistic practice!
        </p>
      </div>
    </footer>
  );
}
