import { Logo } from "@/components/brand/Logo";

// ROTA TEMPORÁRIA, fonte do OG card. Existe só para ser fotografada a 1200x630
// e virar app/opengraph-image.png. Apagar depois de gerar (a fonte fica salva
// em design-references/og-card/). Usa a <Logo /> real, os tokens reais e as
// fontes reais do site, que é o que garante fidelidade de tipografia.
//
// design.md, Porão: "OG card desenhado (não foto solta)". Por isso o campo é a
// ATMOSFERA da marca (o plate de gesso com sombra de folhagem e cáusticas
// d'água da Seção 5b), não uma fotografia de rosto ou de tratamento.
// Copy: só string já aprovada. O wordmark carrega "SKIN · NOURISHMENT ·
// BALANCE"; a linha de baixo é o título de página que já está no ar.

const LINHA = "HOLISTIC FACIAL TREATMENTS · KAKA'AKO, HONOLULU";

// Vira para true e recarrega para fotografar a variante com o carimbo.
const COM_SELO = true;

export default function OgCardSource() {
  return (
    <>
      {/* A captura tem que sair EXATAMENTE 1200x630: sem barra de rolagem e sem
          o indicador de dev do Next, que senão é assado dentro do PNG. */}
      <style>{`
        html, body { margin:0; padding:0; overflow:hidden; width:1200px; height:630px; }
        nextjs-portal { display: none !important; }
      `}</style>

      <div
        style={{
          position: "relative",
          width: 1200,
          height: 630,
          overflow: "hidden",
          backgroundColor: "var(--linen)",
        }}
      >
        {/* Atmosfera da marca: gesso quente, sombra de folhagem, cáustica d'água. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('/images/press/press-background-desktop.png')",
            backgroundSize: "cover",
            backgroundPosition: "center 38%",
          }}
        />
        {/* Véu de linho: garante o AA do grafite sobre a textura. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(120% 90% at 50% 45%, color-mix(in srgb, var(--linen) 80%, transparent) 0%, color-mix(in srgb, var(--linen) 52%, transparent) 100%)",
          }}
        />

        <div
          style={{
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            // Centragem ÓPTICA, não geométrica: o viewBox do wordmark tem folga
            // interna no topo, então a caixa centrada deixa a TINTA 12px baixa.
            transform: "translateY(-12px)",
          }}
        >
          {/* O wordmark é SVG fluido: sem uma caixa com largura ele preenche o
              card inteiro e encosta nas bordas. */}
          <div style={{ width: 560 }}>
            <Logo className="text-graphite" />
          </div>
          {/* Linha d'água: a forma-assinatura da casa. */}
          <span
            aria-hidden="true"
            style={{
              display: "block",
              width: 132,
              height: 1,
              marginTop: 44,
              background:
                "linear-gradient(90deg, transparent, var(--sage) 22%, var(--sage) 78%, transparent)",
            }}
          />
          <p
            style={{
              margin: 0,
              marginTop: 38,
              fontSize: 19,
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              color: "var(--graphite-soft)",
              fontWeight: 500,
            }}
          >
            {LINHA}
          </p>
        </div>

        {COM_SELO && (
          /* Carimbo Best of Honolulu, o mesmo gesto da Seção 5b. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src="/images/press/press-best-of-honolulu-seal.png"
            alt=""
            width={124}
            height={124}
            style={{
              position: "absolute",
              right: 68,
              bottom: 60,
              transform: "rotate(6deg)",
            }}
          />
        )}
      </div>
    </>
  );
}
