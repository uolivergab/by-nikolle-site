"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TideButton } from "@/components/ui/TideButton";
import { BOOKING_SMS_HREF } from "@/lib/booking";

// Pop-up de boas-vindas (roteiro.md, revisão Nikolle 26/07): a "carta da casa".
// Aparece ~30s depois da navegação, UMA vez por sessão (sessionStorage), como
// convite discreto. MODO A: sem urgência, sem countdown, sem pulso. Papel sand,
// contorno olive fino, linha d'água que se desenha no topo (forma-assinatura) e
// sombra de papel (mesma exceção sancionada dos artefatos do Interlúdio). Fecha
// no X, no Esc e ao tocar o CTA (que abre o SMS de agendamento). Não rouba o
// foco ao aparecer (diálogo não-modal); reduced-motion degrada para fade.

const SHOW_DELAY_MS = 30_000;
const SESSION_KEY = "bn-welcome-gift-shown";
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export function WelcomeGift() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);

  // Agenda a aparição única da sessão. O flag grava no momento em que mostra,
  // então navegações/reloads na mesma sessão não repetem o convite.
  useEffect(() => {
    let shown = false;
    try {
      shown = sessionStorage.getItem(SESSION_KEY) === "1";
    } catch {
      // sessionStorage indisponível (modo privado estrito): mostra mesmo assim.
    }
    if (shown) return;
    const timer = setTimeout(() => {
      try {
        sessionStorage.setItem(SESSION_KEY, "1");
      } catch {
        // sem storage, sem flag; o convite só repete se recarregar a página.
      }
      setOpen(true);
    }, SHOW_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  // Esc fecha enquanto o convite está aberto.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          role="dialog"
          aria-labelledby="welcome-gift-title"
          initial={{ opacity: 0, y: reduced ? 0 : 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 0 }}
          transition={{ duration: reduced ? 0.3 : 0.7, ease: EASE }}
          className="fixed inset-x-4 bottom-[calc(16px+env(safe-area-inset-bottom))] z-[60] max-w-[400px] rounded-[4px] border border-olive/20 bg-sand p-6 pb-7 shadow-[0_16px_44px_-14px_color-mix(in_srgb,var(--graphite)_26%,transparent)] min-[701px]:inset-x-auto min-[701px]:right-8 min-[701px]:bottom-8 min-[701px]:w-[400px] min-[701px]:p-7"
        >
          {/* Linha d'água que se desenha no topo da carta (forma-assinatura). */}
          <motion.span
            aria-hidden="true"
            initial={{ scaleX: reduced ? 1 : 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, ease: EASE, delay: reduced ? 0 : 0.35 }}
            className="absolute inset-x-6 top-0 h-px origin-center bg-sage min-[701px]:inset-x-7"
          />

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="focus-ripple absolute top-1 right-1 flex h-11 w-11 items-center justify-center text-graphite-soft transition-colors hover:text-graphite"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M1.5 1.5 L10.5 10.5 M10.5 1.5 L1.5 10.5"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <h2
            id="welcome-gift-title"
            className="pr-8 font-display text-[21px] font-medium leading-[1.25] text-graphite"
          >
            A special welcome gift for new clients
          </h2>
          <p className="mt-3 text-[14px] leading-[1.65] text-graphite-soft">
            Enjoy 15% off your first holistic skincare experience and discover a
            conscious approach to healthy, radiant skin.
          </p>
          <div className="mt-5">
            <TideButton
              size="sm"
              href={BOOKING_SMS_HREF}
              className="w-full py-[13px]"
              onClick={() => setOpen(false)}
            >
              Start your skin journey
            </TideButton>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
