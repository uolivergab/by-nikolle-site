import type { Metadata, Viewport } from "next";
import {
  Bodoni_Moda,
  Cormorant,
  Hanken_Grotesk,
  Inter_Tight,
  Parisienne,
} from "next/font/google";
import "./globals.css";

// ---- Dupla EXCLUSIVA da headline do hero (mocks aprovados do Gabriel) ----
// O hero é a única peça do site com este par. O resto segue o sistema v2
// (Cormorant + Hanken). Estrutural: Inter Tight 500, tracking apertado.
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

// Emocional: Bodoni Moda ITÁLICO, a didone de alto contraste das palavras
// Conscious / Health / Well-Being.
const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  style: ["italic", "normal"],
  variable: "--font-bodoni-moda",
  display: "swap",
});

// Display E voz da marca na MESMA família: Cormorant variável (SISTEMA v2).
// Roman para o caps do display (peso 500-600) e itálico para a voz (peso ~500).
const cormorant = Cormorant({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

// Corpo: Hanken Grotesk 300-500.
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
  weight: ["300", "400", "500"],
});

// Terceira voz (microdose única, SISTEMA v2): assinatura 'Nikolle' na Parisienne.
// Peso único 400; usada UMA vez no site (Seção 6, o único toque à mão).
const parisienne = Parisienne({
  subsets: ["latin"],
  variable: "--font-parisienne",
  display: "swap",
  weight: "400",
});

// Origem canônica do site. O domínio final ainda não foi batido (ver
// pendências), então: variável de ambiente se existir, senão o domínio de
// produção que a Vercel injeta, senão local. Quando o domínio próprio entrar,
// muda só NEXT_PUBLIC_SITE_URL no painel da Vercel.
// O último degrau NÃO pode ser localhost: se a Vercel não expuser a variável de
// domínio, o cartão sairia apontando para o localhost de QUEM RECEBEU o link, e
// a prévia viria quebrada no WhatsApp sem ninguém notar no deploy.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.NODE_ENV === "production"
      ? "https://by-nikolle-site.vercel.app"
      : "http://localhost:3000");

const TITLE = "by Nikolle | Holistic Facial Treatments in Kaka'ako, Honolulu";
const DESCRIPTION =
  "Holistic, personalized facial treatments in Kaka'ako, Honolulu.";

// O CARTÃO e os ÍCONES vêm dos arquivos de convenção do App Router, então o
// Next monta as tags sozinho, com URL absoluta e dimensões corretas:
// app/opengraph-image.jpg (+ .alt.txt), app/icon0.svg, app/icon1.png e
// app/apple-icon.png. metadataBase é o que torna essas URLs absolutas, e sem
// ela o WhatsApp e o Google não conseguem buscar a imagem.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "by Nikolle",
    locale: "en_US",
    url: "/",
    title: TITLE,
    description: DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f0e8",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${hanken.variable} ${parisienne.variable} ${interTight.variable} ${bodoniModa.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
