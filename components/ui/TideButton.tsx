"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// Botão primário "maré" (design.md): borda 1px olive, radius 2px, caps tracked.
// Linha d'água de 1px na base que sobe preenchendo o botão no hover (~550ms);
// o texto transiciona para linen. Implementado com transform (translateY) em vez
// de height para animar só transform/opacity, com resultado visual idêntico.
//
// VARIANTES:
// - "tide"  (padrão): fantasma sobre o linho. O botão do corpo do site.
// - "still" (água funda, hero): olive SÓLIDO + menisco. Nasceu porque o
//   fantasma sumia sobre a fotografia do hero; ver bloco .tide-still no
//   globals.css.
//
// MAGNETISMO (opcional, só onde o design pede): a peça é atraída pelo cursor
// em ±5px, com mola. Só em ponteiro fino e sem prefers-reduced-motion. Usa
// motion values (fora do ciclo de render do React, nunca useState).

const MAGNET_STRENGTH = 0.28;
const MAGNET_MAX = 5;

type TideButtonProps = {
  size?: "sm" | "lg";
  variant?: "tide" | "still";
  /** Atração magnética ao cursor (desktop). Usar com parcimônia. */
  magnetic?: boolean;
  /** Quando presente, renderiza um link <a> (ex.: SMS de agendamento). */
  href?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
  type?: "button" | "submit";
  /** Para botões que abrem/fecham painel (ex.: Programas). */
  ariaExpanded?: boolean;
  ariaControls?: string;
  /** Tira a peça da ordem de tabulação quando o painel-pai está fechado. */
  tabIndex?: number;
};

export function TideButton({
  size = "lg",
  variant = "tide",
  magnetic = false,
  href,
  className,
  children,
  onClick,
  type = "button",
  ariaExpanded,
  ariaControls,
  tabIndex,
}: TideButtonProps) {
  const reduced = useReducedMotion();
  const hostRef = useRef<HTMLElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 150, damping: 18, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 150, damping: 18, mass: 0.4 });

  const magnetOn =
    magnetic &&
    !reduced &&
    typeof window !== "undefined" &&
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  const onMove = (event: React.MouseEvent<HTMLElement>) => {
    if (!magnetOn || !hostRef.current) return;
    const r = hostRef.current.getBoundingClientRect();
    const dx = (event.clientX - (r.left + r.width / 2)) * MAGNET_STRENGTH;
    const dy = (event.clientY - (r.top + r.height / 2)) * MAGNET_STRENGTH;
    rawX.set(Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dx)));
    rawY.set(Math.max(-MAGNET_MAX, Math.min(MAGNET_MAX, dy)));
  };
  const onLeave = () => {
    rawX.set(0);
    rawY.set(0);
  };

  const classes = cn(
    "focus-ripple group relative inline-flex cursor-pointer items-center justify-center overflow-hidden",
    // bg: a variante "still" pinta o fundo no .tide-still (globals.css). O
    // utilitário bg-transparent venceria essa regra (utilities > components),
    // então ele só entra na variante fantasma.
    "rounded-[2px] border border-(--button-border)",
    variant === "tide" && "bg-transparent",
    "font-sans font-normal uppercase tracking-[0.14em] text-(--button-ink)",
    "[transition:color_.5s_ease_.05s,transform_.15s_ease] hover:text-(--button-ink-hover) active:scale-[.98]",
    size === "sm" ? "px-[22px] py-[10px] text-[11.5px]" : "px-8 py-[15px] text-[13px]",
    variant === "still" && "tide-still",
    // depois do text-* para o tailwind-merge não descartar o line-height
    "leading-[normal]",
    className,
  );

  const inner = (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 translate-y-[calc(100%-1px)] bg-(--button-water) transition-transform duration-[550ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:translate-y-0 motion-reduce:transition-none"
      />
      <span className="relative z-[1] whitespace-nowrap">{children}</span>
    </>
  );

  const motionProps = magnetic
    ? { style: { x, y }, onMouseMove: onMove, onMouseLeave: onLeave }
    : {};

  if (href) {
    return (
      <motion.a
        ref={hostRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        className={classes}
        onClick={onClick}
        tabIndex={tabIndex}
        {...motionProps}
      >
        {inner}
      </motion.a>
    );
  }

  return (
    <motion.button
      ref={hostRef as React.RefObject<HTMLButtonElement>}
      type={type}
      className={classes}
      onClick={onClick}
      tabIndex={tabIndex}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      {...motionProps}
    >
      {inner}
    </motion.button>
  );
}
