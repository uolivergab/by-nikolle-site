import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Method } from "@/components/sections/Method";
import { Services } from "@/components/sections/Services";
import { Program } from "@/components/sections/Program";
import { Proof } from "@/components/sections/Proof";
import { Voices } from "@/components/sections/Voices";
import { Press } from "@/components/sections/Press";
import { About } from "@/components/sections/About";
import { ComingSoon } from "@/components/sections/ComingSoon";
import { Faq } from "@/components/sections/Faq";
import { Footer } from "@/components/sections/Footer";
import { WelcomeGift } from "@/components/ui/WelcomeGift";
import { BookingDialog } from "@/components/ui/BookingDialog";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Method />
        <Services />
        <Program />
        <Proof />
        <Voices />
        <Press />
        <About />
        <ComingSoon />
        <Faq />
      </main>
      <Footer />
      {/* Convite de boas-vindas (roteiro.md): 1x por sessão, aos ~20s ou a 30%
          da rolagem, o que vier primeiro. */}
      <WelcomeGift />
      {/* Formulário de agendamento (10/08): os CTAs abrem este diálogo, que
          coleta os dados em campos reais e monta o SMS já preenchido. */}
      <BookingDialog />
    </>
  );
}
