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
          "relative flex items-center justify-between px-[22px] py-4 transition-colors duration-300 min-[701px]:px-12 min-[701px]:py-[22px]",
          scrolled && "bg-(--nav-bg-scrolled)",
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-(--waterline) transition-opacity duration-300",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        />
        <Logo className="h-7 w-auto text-graphite min-[701px]:h-[33px]" />
        <ul className="hidden items-center gap-[30px] min-[701px]:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="focus-ripple relative inline-block pb-[3px] text-[12px] uppercase leading-[normal] tracking-[0.15em] text-graphite after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-sage after:transition-transform after:duration-[450ms] after:ease-[cubic-bezier(.22,1,.36,1)] hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:after:transition-none"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-2 min-[701px]:gap-0">
          <TideButton size="sm" href={BOOKING_SMS_HREF}>
            Book
          </TideButton>
          <button
            type="button"
            aria-label="Open menu"
            className="focus-ripple -mr-2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-[2px] text-graphite min-[701px]:hidden"
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
        </div>
      </nav>
    </header>
  );
}
