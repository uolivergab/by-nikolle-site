import { cn } from "@/lib/utils";

// CTA do hero (mocks aprovados): pill marfim com disco olive e seta fina.
// Mantém a gramática da casa no hover (a maré olive sobe e inverte a peça) e,
// parado, roda A GOTA: uma ondulação única a cada 6.4s saindo do disco, que é
// o que mantém a peça viva no mobile sem depender de cursor.
// Estilos: bloco .hero-cta* no globals.css.

function Arrow({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="17"
      height="11"
      viewBox="0 0 17 11"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M0.5 5.5h15M11.3 1.3 15.5 5.5l-4.2 4.2"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function HeroInvite({
  href,
  className,
  discClassName,
  children,
}: {
  href: string;
  className?: string;
  discClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <a href={href} className={cn("hero-cta focus-ripple", className)}>
      <span aria-hidden="true" className="hero-cta__fill">
        <span className="hero-cta__water" />
      </span>

      <span className="leading-[normal]">{children}</span>

      <span aria-hidden="true" className={cn("hero-cta__disc", discClassName)}>
        <span className="hero-cta__drop absolute inset-0" />
        <Arrow className="hero-cta__arrow hero-cta__arrow--out" />
        <Arrow className="hero-cta__arrow hero-cta__arrow--in" />
      </span>
    </a>
  );
}
