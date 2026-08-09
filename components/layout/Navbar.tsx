"use client";

import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { TideButton } from "@/components/ui/TideButton";
import { BOOKING_SMS_HREF } from "@/lib/booking";
import { cn } from "@/lib/utils";

// Navbar "a superfície" (design.md): fixa, transparente sobre o hero; ao rolar
// ganha fundo linen translúcido + linha d'água 1px sage na base; esconde ao
// rolar para baixo e reaparece ao subir.
//
// REVISÃO 30/07 (duas queixas diretas da Nikolle):
// (a) O HAMBÚRGUER ERA INERTE — a navegação mobile simplesmente não existia.
//     Agora abre a CORTINA: um painel de linho que desce do topo com os links
//     em caixa alta editorial. Não é um drawer genérico de template; é a mesma
//     gramática do site (linha d'água que aflora, Cormorant caps, ritmo lento).
// (b) A BARRA ESTAVA ALTA DEMAIS ("o site ficou curto, tampou o início"): eram
//     ~132px no desktop (padding 40+40 e logo de até 62px de altura). A logo
//     tinha sido ampliada +27% porque o hero não tinha logo; como a logo GRANDE
//     volta ao hero (pedido dela), esta volta a ser a "logo menor na lateral" e
//     a barra cai para ~80px no desktop / ~74px no mobile.

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
  const [open, setOpen] = useState(false);
  // A logo da barra só existe DEPOIS do hero (ajuste 30/07): no hero quem
  // carrega a marca é a logo grande, e duas logos na mesma tela competem.
  const [pastHero, setPastHero] = useState(false);
  const lastY = useRef(0);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const y = window.scrollY;
      setScrolled(y > 24);
      // O hero ocupa 100svh (com piso de 600px), então a própria viewport é a
      // régua: a 72% dele a logo grande já saiu de cena e a barra assume a
      // marca. Sem seletor global e sem acoplar a Navbar ao Hero.
      setPastHero(y > Math.max(window.innerHeight, 600) * 0.72);
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

  // Cortina aberta: trava a rolagem do corpo, fecha no Esc e mantém o foco
  // dentro do painel (ciclo simples entre os focáveis, sem biblioteca).
  useEffect(() => {
    if (!open) return;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const focusables = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables?.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-transform duration-[400ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none",
        // Com a cortina aberta a barra nunca se esconde (o X vive nela).
        hidden && !open ? "-translate-y-full" : "translate-y-0",
      )}
    >
      {/* A CORTINA: painel de linho que desce do topo. Fica ABAIXO da barra no
          empilhamento (o header já cria o contexto), então o X e a logo seguem
          visíveis e clicáveis por cima dele.
          PEGADINHA MEDIDA NO BROWSER: o header usa `translate` (Tailwind v4
          escreve translate-y-* nessa propriedade, não em transform), e um valor
          de `translate` faz o header virar o CONTAINING BLOCK dos descendentes
          `fixed`. Com inset-0 o painel herdava a altura da BARRA (74px) e a
          cortina abria invisível. Por isso as medidas de viewport são
          explícitas aqui. */}
      <div
        ref={panelRef}
        id="nav-drawer"
        data-open={open ? "true" : "false"}
        className="nav-curtain fixed top-0 left-0 z-0 h-svh w-screen bg-linen min-[861px]:hidden"
        aria-hidden={!open}
      >
        <nav
          aria-label="Site"
          className="flex h-full flex-col justify-center px-[8vw] pt-[92px] pb-[max(32px,env(safe-area-inset-bottom))]"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link, i) => (
              <li key={link.href} style={{ ["--i" as string]: i }}>
                <a
                  href={link.href}
                  tabIndex={open ? undefined : -1}
                  onClick={() => setOpen(false)}
                  className="nav-curtain-link focus-ripple group relative block py-[10px] font-display text-[clamp(30px,9.5vw,44px)] leading-[1.16] font-medium tracking-[0.03em] uppercase text-graphite"
                >
                  {link.label}
                  {/* A linha d'água da marca aflorando sob o link. */}
                  <span
                    aria-hidden="true"
                    className="absolute bottom-[6px] left-0 h-px w-full origin-left scale-x-0 bg-sage transition-transform duration-[550ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-x-100 group-focus-visible:scale-x-100 motion-reduce:transition-none"
                  />
                </a>
              </li>
            ))}
          </ul>

          <div
            className="nav-curtain-foot mt-12"
            style={{ ["--i" as string]: NAV_LINKS.length }}
          >
            <TideButton
              size="lg"
              href={BOOKING_SMS_HREF}
              tabIndex={open ? undefined : -1}
              onClick={() => setOpen(false)}
            >
              Book My Consultation
            </TideButton>
          </div>
        </nav>
      </div>

      <nav
        aria-label="Main"
        className={cn(
          // Barra COMPACTA (queixa da Nikolle: estava tampando o início do
          // site no iPad e no desktop). ~74px no mobile, ~80px no desktop.
          "relative z-10 grid grid-cols-[1fr_auto_1fr] items-center px-[5.5vw] py-[15px] transition-colors duration-300 md:px-[3.6vw] md:py-[18px]",
          scrolled && !open && "bg-(--nav-bg-scrolled)",
          open && "bg-linen",
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
            scrolled || open ? "opacity-0" : "opacity-100",
          )}
        />
        <span
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-(--waterline) transition-opacity duration-300",
            scrolled && !open ? "opacity-100" : "opacity-0",
          )}
        />

        {/* MOBILE (lockup dos mocks): hambúrguer à esquerda, logo CENTRADA,
            Book à direita. DESKTOP: logo à esquerda, links no centro, Book à
            direita. Uma instância só da logo (o SVG é pesado; duplicar por
            breakpoint sairia caro) reposicionada pela grade. */}
        <button
          ref={toggleRef}
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="nav-drawer"
          className="focus-ripple col-start-1 -ml-2 flex h-11 w-11 cursor-pointer items-center justify-center justify-self-start rounded-[2px] text-graphite min-[861px]:hidden"
        >
          {/* Os dois traços viram um X girando: o gesto é o mesmo objeto, não
              troca de ícone. */}
          <svg
            width="22"
            height="10"
            viewBox="0 0 22 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="overflow-visible"
          >
            <path
              d="M1 1h20"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              className={cn(
                "origin-center transition-transform duration-[420ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none",
                open && "[transform:translateY(4px)_rotate(45deg)]",
              )}
            />
            <path
              d="M1 9h20"
              stroke="currentColor"
              strokeWidth="1.25"
              strokeLinecap="round"
              className={cn(
                "origin-center transition-transform duration-[420ms] ease-[cubic-bezier(.22,1,.36,1)] motion-reduce:transition-none",
                open && "[transform:translateY(-4px)_rotate(-45deg)]",
              )}
            />
          </svg>
        </button>

        {/* Logo MENOR na lateral (pedido da Nikolle 30/07): a presença da marca
            no hero é da logo grande. Aqui ela CHEGA quando o hero sai, num fade
            curto com um passo de subida, como se a barra assumisse a marca. Com
            a cortina aberta ela também aparece: aquela tela é da marca.
            Fica no DOM o tempo todo (só opacity) para não reflowar a grade nem
            sumir da árvore de acessibilidade. */}
        <Logo
          className={cn(
            "col-start-2 h-auto w-[clamp(84px,21vw,100px)] justify-self-center text-graphite transition-[opacity,transform] duration-[520ms] ease-[cubic-bezier(.22,1,.36,1)] md:w-[clamp(104px,8vw,124px)] min-[861px]:col-start-1 min-[861px]:justify-self-start motion-reduce:transition-none",
            pastHero || open
              ? "translate-y-0 opacity-100"
              : "-translate-y-1 opacity-0",
          )}
        />

        <ul className="col-start-2 hidden items-center gap-[34px] justify-self-center min-[861px]:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="focus-ripple relative inline-block pb-[3px] text-[12.5px] uppercase leading-[normal] tracking-[0.18em] text-graphite after:absolute after:bottom-0 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-sage after:transition-transform after:duration-[450ms] after:ease-[cubic-bezier(.22,1,.36,1)] hover:after:scale-x-100 focus-visible:after:scale-x-100 motion-reduce:after:transition-none"
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
            className="h-[42px] w-[92px] px-0 py-0 text-[10.5px] tracking-[0.18em] md:h-[44px] md:w-[112px] md:text-[11.5px]"
          >
            Book
          </TideButton>
        </div>
      </nav>
    </header>
  );
}
