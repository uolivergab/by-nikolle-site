import { cn } from "@/lib/utils";

// Botão primário "maré" (design.md): borda 1px olive, radius 2px, caps tracked.
// Linha d'água de 1px na base que sobe preenchendo o botão no hover (~550ms);
// o texto transiciona para linen. Implementado com transform (translateY) em vez
// de height para animar só transform/opacity, com resultado visual idêntico.

type TideButtonProps = {
  size?: "sm" | "lg";
  /** Quando presente, renderiza um link <a> (ex.: SMS de agendamento). */
  href?: string;
  className?: string;
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLElement>;
  type?: "button" | "submit";
};

export function TideButton({
  size = "lg",
  href,
  className,
  children,
  onClick,
  type = "button",
}: TideButtonProps) {
  const classes = cn(
    "focus-ripple group relative inline-flex cursor-pointer items-center justify-center overflow-hidden",
    "rounded-[2px] border border-(--button-border) bg-transparent",
    "font-sans font-normal uppercase tracking-[0.14em] text-(--button-ink)",
    "[transition:color_.5s_ease_.05s,transform_.15s_ease] hover:text-(--button-ink-hover) active:scale-[.98]",
    size === "sm" ? "px-[22px] py-[10px] text-[11.5px]" : "px-8 py-[15px] text-[13px]",
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

  if (href) {
    return (
      <a href={href} className={classes} onClick={onClick}>
        {inner}
      </a>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {inner}
    </button>
  );
}
