"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { TideButton } from "@/components/ui/TideButton";
import { BOOKING_SMS_HREF } from "@/lib/booking";
import { cn } from "@/lib/utils";

// Navbar "a superfície" (design.md): fixa, transparente sobre o hero; ao rolar
// ganha fundo linen translúcido + linha d'água 1px sage na base; esconde ao
// rolar para baixo e reaparece ao subir. Drawer do menu mobile fica para outra
// sessão (botão presente e inerte).

const NAV_LINKS = [
  { label: "Philosophy", href: "#philosophy" },
  { label: "Treatments", href: "#treatments" },
  { label: "Program", href: "#program" },
  { label: "About", href: "#about" },
  { label: "FAQ", href: "#faq" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      setHidden(y > lastY.current && y > 120);
      lastY.current = y;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    lastY.current = window.scrollY;
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-transform duration-[400ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none",
        hidden ? "-translate-y-full" : "translate-y-0",
      )}
    >
      <nav
        aria-label="Main"
        className={cn(
          // Respiro do header conforme os mocks: 5.5vw / 22px no mobile,
          // 3.6vw / 40px no desktop (era 48px/22px, apertado demais).
          "relative grid grid-cols-[1fr_auto_1fr] items-center px-[5.5vw] py-[22px] transition-colors duration-300 md:px-[3.6vw] md:py-[40px]",
          scrolled && "bg-(--nav-bg-scrolled)",
        )}
      >
        {/* Scrim da "superfície": sobre o hero em fotografia os links em grafite
            caíam sobre o cabelo escuro do vídeo (reprovava AA). Este degradê de
            linho cobre a faixa dos links e derrete logo abaixo. Ao rolar ele
            sai e o fundo --nav-bg-scrolled assume (mesma família de cor, a
            troca não aparece). */}
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 -z-10 h-[215%] bg-(image:--nav-scrim) transition-opacity duration-300",
            scrolled ? "opacity-0" : "opacity-100",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-(--waterline) transition-opacity duration-300",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        />

        {/* MOBILE (lockup dos mocks): hambúrguer à esquerda, logo CENTRADA,
            Book à direita. DESKTOP: logo à esquerda, links no centro, Book à
            direita. Uma instância só da logo (o SVG é pesado; duplicar por
            breakpoint sairia caro) reposicionada pela grade. */}
        <button
          type="button"
          aria-label="Open menu"
          className="focus-ripple col-start-1 -ml-2 flex h-11 w-11 cursor-pointer items-center justify-center justify-self-start rounded-[2px] text-graphite min-[861px]:hidden"
        >
          <svg
            width="22"
            height="10"
            viewBox="0 0 22 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              d="M1 1h20"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
            <path
              d="M1 9h20"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
            />
          </svg>
        </button>

        {/* Logo AMPLIADA 27/07 (+27%): a presença que a Nik pediu vive aqui,
            não numa segunda logo no centro do hero (que competia com esta). */}
        <Logo className="col-start-2 h-auto w-[19vw] max-w-[88px] justify-self-center text-graphite md:w-[clamp(126px,10.5vw,180px)] md:max-w-none min-[861px]:col-start-1 min-[861px]:justify-self-start" />

        <ul className="col-start-2 hidden items-center gap-[38px] justify-self-center min-[861px]:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="focus-ripple relative inline-block pb-[3px] text-[13px] uppercase leading-[normal] tracking-[0.19em] text-graphite after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-sage after:transition-transform after:duration-[450ms] after:ease-[cubic-bezier(.22,1,.36,1)] hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:after:transition-none"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="col-start-3 justify-self-end">
          <TideButton
            size="sm"
            href={BOOKING_SMS_HREF}
            className="h-[44px] w-[94px] px-0 py-0 text-[11px] tracking-[0.18em] md:h-[52px] md:w-[120px] md:text-[12px]"
          >
            Book
          </TideButton>
        </div>
      </nav>
    </header>
  );
}
