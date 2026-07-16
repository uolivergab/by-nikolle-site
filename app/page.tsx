import { Navbar } from "@/components/layout/Navbar";
import { Hero } from "@/components/sections/Hero";
import { Method } from "@/components/sections/Method";
import { Services } from "@/components/sections/Services";
import { Program } from "@/components/sections/Program";
import { Proof } from "@/components/sections/Proof";
import { Press } from "@/components/sections/Press";
import { About } from "@/components/sections/About";

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
        <Press />
        <About />
      </main>
    </>
  );
}
