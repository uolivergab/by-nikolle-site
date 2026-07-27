// Ícones de TRAÇO dos três pilares (Seção 2, narrativa de scroll 27/07).
// Novos e distintos dos ícones-assinatura VTracer (IconSkin/IconNourish/
// IconBalance): aqueles são line-art de PREENCHIMENTO e não têm stroke para
// "se desenhar" (lição registrada). Estes são stroke puro, com pathLength={1}
// normalizado em cada path: o CSS anima stroke-dashoffset 1 -> 0 quando o
// card fica ativo (.ph-ico no globals.css), sem medir comprimento em JS.
// Traço fino, currentColor, decorativos (aria-hidden no ponto de uso).

type IconProps = { className?: string };

const strokeProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.3,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

/** Rosto feminino de perfil dentro de um contorno circular incompleto. */
export function LineSkin({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      {...strokeProps}
    >
      {/* contorno circular incompleto */}
      <path pathLength={1} d="M 51 15 A 24.5 24.5 0 1 0 55 40" />
      {/* cabelo */}
      <path
        pathLength={1}
        d="M 35.5 17.5 C 30 15 24.5 17.5 23.5 23.5 C 22.5 29.5 25.5 35 25 41.5 C 24.8 44.5 24 46.5 23 48.5"
      />
      {/* perfil: testa, nariz, lábios, queixo */}
      <path
        pathLength={1}
        d="M 35.5 17.5 C 37.5 21 38 24.5 39 27 C 40 29.5 41 30.5 41 31.5 C 41 32.5 40 33 39.4 33.4 C 40.4 34.4 40.4 35.6 39.6 36.3 C 40.3 37.2 40 38.4 38.8 38.8 C 39.4 40.4 38.6 42 37 42.4 C 35.6 42.8 34.4 42.5 33.8 42.1"
      />
    </svg>
  );
}

/** Perfil feminino delicado com uma folha surgindo próxima ao pescoço. */
export function LineNourish({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      {...strokeProps}
    >
      {/* cabelo */}
      <path
        pathLength={1}
        d="M 34 11 C 28.5 9 23.5 11.5 23 17 C 22.5 22.5 25 27 24.5 33 C 24.2 36.5 23.2 39 22 41.5"
      />
      {/* perfil */}
      <path
        pathLength={1}
        d="M 34 11 C 36 14 36.5 17.5 37.5 20 C 38.5 22.5 39.5 23.5 39.5 24.5 C 39.5 25.5 38.6 26 38 26.4 C 39 27.4 39 28.6 38.2 29.3 C 38.9 30.2 38.6 31.4 37.4 31.8 C 38 33.4 37.2 35 35.6 35.4 C 34.4 35.7 33.4 35.5 32.8 35.1"
      />
      {/* folha no pescoço */}
      <path
        pathLength={1}
        d="M 36 44.5 C 38.5 40.5 44.5 39.5 47.5 42.5 C 46.5 47 40.5 48.5 36 44.5 Z"
      />
      {/* pecíolo da folha */}
      <path pathLength={1} d="M 36 44.5 C 34 46.5 32.8 49.5 32.8 53" />
    </svg>
  );
}

/** Círculos concêntricos orgânicos com uma folha delicada no centro. */
export function LineBalance({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      xmlns="http://www.w3.org/2000/svg"
      {...strokeProps}
    >
      {/* círculo externo, aberto */}
      <path pathLength={1} d="M 47 13.5 A 24 24 0 1 0 55.5 27" />
      {/* círculo interno, aberto no lado oposto */}
      <path pathLength={1} d="M 24 46 A 16 16 0 1 1 44.5 42" />
      {/* folha central */}
      <path
        pathLength={1}
        d="M 25.5 36.5 C 26 29.5 31.5 24.5 38.5 25.5 C 39 32.5 34 37.8 27.2 37.4 C 26.5 37.3 25.9 37 25.5 36.5 Z"
      />
      {/* nervura */}
      <path pathLength={1} d="M 27.5 35 C 30 31.5 33 28.8 36.5 27.5" />
    </svg>
  );
}
