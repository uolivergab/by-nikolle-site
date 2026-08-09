"use client";

// TransitionPanel — componente do catálogo 21st.dev (motion-primitives, autor
// ibelick), trazido INTEIRO com a animação dele: troca de conteúdo com entrada
// e saída coreografadas por AnimatePresence em mode="popLayout" (o painel que
// sai deixa o fluxo, então o que entra não espera).
//
// Único ajuste na importação: o projeto usa "framer-motion" (o pacote instalado)
// em todas as seções, então o import segue essa família. Nenhuma cor, medida ou
// tipografia mora aqui: quem consome passa className e variants com os tokens
// da marca (a passada de tokens acontece na seção, não no componente).
//
// Dono do movimento DENTRO da Seção 3: Framer Motion (regra de posse por seção).

import {
  AnimatePresence,
  motion,
  type MotionProps,
  type Transition,
  type Variant,
} from "framer-motion";
import { cn } from "@/lib/utils";

type TransitionPanelProps = {
  children: React.ReactNode[];
  className?: string;
  transition?: Transition;
  activeIndex: number;
  variants?: { enter: Variant; center: Variant; exit: Variant };
} & MotionProps;

export function TransitionPanel({
  children,
  className,
  transition,
  variants,
  activeIndex,
  ...motionProps
}: TransitionPanelProps) {
  return (
    <div className={cn("relative", className)}>
      <AnimatePresence
        initial={false}
        mode="popLayout"
        custom={motionProps.custom}
      >
        <motion.div
          key={activeIndex}
          variants={variants}
          transition={transition}
          initial="enter"
          animate="center"
          exit="exit"
          {...motionProps}
        >
          {children[activeIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
