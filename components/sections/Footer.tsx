"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { BOOKING_SMS_HREF } from "@/lib/booking";

// Seção 8 — Footer (design.md item 8). Fecho olive ESCURO: a 2ª e última vez
// que o olive aparece como campo (a outra é o Programa). LOCKUP CERIMONIAL:
// logo + linha d'água + reflexo a ~11% (o 2º e ÚLTIMO uso do reflexo no site,
// lei da forma-assinatura). Copy e dados 100% do roteiro.md (revisão Nikolle
// 26/07): frase central nova, Location, Text to Book (só o número confirmado;
// o 2º telefone do PDF aguarda confirmação), Instagram @by_nikolle_snb,
// Studio Hours e o fecho Mahalo. SEM botão extra (a ação única já vive no
// hero/navbar; aqui o telefone É o link de SMS). Reveal por data-live; a
// linha se desenha do centro; degrada em prefers-reduced-motion.
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
      className="footer relative overflow-hidden bg-[color:var(--olive-deep)]"
    >
      {/* Fronteira de cima: linha d'água fina (posse do footer sobre o linho). */}
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-linen/20"
      />

      <div className="mx-auto max-w-[1100px] px-6 pt-16 pb-10 min-[881px]:pt-20 min-[881px]:pb-12">
        {/* Lockup cerimonial: logo + linha + reflexo (scaleY(-1), ~11%, máscara
            derretendo para baixo). aria-hidden no reflexo (decorativo). */}
        <div className="ft-rise flex flex-col items-center" style={delay(0)}>
          <Logo className="h-9 w-auto text-linen min-[881px]:h-10" />
          <span
            aria-hidden="true"
            className="ft-line mt-5 h-px w-[88px] origin-center bg-linen/40"
          />
          <span
            aria-hidden="true"
            className="mt-1.5 inline-block opacity-[0.11] [transform:scaleY(-1)] [mask-image:linear-gradient(180deg,transparent_18%,black_92%)]"
          >
            <Logo className="h-9 w-auto text-linen min-[881px]:h-10" />
          </span>
        </div>

        {/* Frase central (roteiro, revisão 26/07). */}
        <p
          className="ft-rise mx-auto mt-7 max-w-[36ch] text-center font-voice text-[clamp(19px,2vw,24px)] font-medium italic leading-[1.45] text-linen"
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
            <p className="text-[11px] uppercase leading-[normal] tracking-[0.22em] text-linen/70">
              Location
            </p>
            <p className="mt-3 text-[14.5px] leading-[1.7] text-linen/95">
              Moa Wellness Center
              <br />
              {"Kakaʻako, Honolulu, HI"}
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase leading-[normal] tracking-[0.22em] text-linen/70">
              Text to Book
            </p>
            <p className="mt-3">
              <a
                href={BOOKING_SMS_HREF}
                className="focus-ripple text-[14.5px] leading-[1.7] text-linen/95 underline decoration-linen/30 underline-offset-4 transition-colors hover:text-linen hover:decoration-linen/60"
              >
                (808) 721-7476
              </a>
            </p>
            {/* 2º número: adição em LARANJA da Nik no PDF (confirmada na
                reauditoria 27/07). O SMS estruturado continua indo pro número
                principal; este liga/abre SMS pro próprio número. */}
            <p className="mt-1.5">
              <a
                href="sms:+18084578823"
                className="focus-ripple text-[14.5px] leading-[1.7] text-linen/95 underline decoration-linen/30 underline-offset-4 transition-colors hover:text-linen hover:decoration-linen/60"
              >
                (808) 457-8823
              </a>
            </p>
            <p className="mt-5 text-[11px] uppercase leading-[normal] tracking-[0.22em] text-linen/70">
              Instagram
            </p>
            <p className="mt-3">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                className="focus-ripple text-[14.5px] leading-[1.7] text-linen/95 underline decoration-linen/30 underline-offset-4 transition-colors hover:text-linen hover:decoration-linen/60"
              >
                @by_nikolle_snb
              </a>
            </p>
          </div>

          <div>
            <p className="text-[11px] uppercase leading-[normal] tracking-[0.22em] text-linen/70">
              Studio Hours
            </p>
            <p className="mt-3 text-[14.5px] leading-[1.7] text-linen/95">
              Tuesday - Friday
              <br />
              10:30 AM - 6:00 PM
            </p>
            <p className="mt-2 text-[14.5px] leading-[1.7] text-linen/95">
              First & Third Saturday of the month
              <br />
              10:30 AM - 5:00 PM
            </p>
            <p className="mt-2 text-[13px] leading-[1.7] text-linen/80">
              Appointments by booking only.
            </p>
          </div>
        </div>

        {/* Fecho (roteiro, revisão 26/07). Safe-area para iOS. */}
        <p
          className="ft-rise mt-12 pb-[env(safe-area-inset-bottom)] text-center font-voice text-[16px] italic text-linen/85 min-[881px]:mt-16"
          style={delay(380)}
        >
          Mahalo for supporting our holistic practice!
        </p>
      </div>
    </footer>
  );
}
