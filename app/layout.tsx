import type { Metadata, Viewport } from "next";
import { Cormorant, Hanken_Grotesk, Parisienne } from "next/font/google";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "by Nikolle | Holistic Facial Treatments in Kaka'ako, Honolulu",
  description:
    "Holistic, personalized facial treatments in Kaka'ako, Honolulu.",
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
      className={`${cormorant.variable} ${hanken.variable} ${parisienne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
