import Navbar from "@/components/Navbar";
import Hero from "@/sections/Hero";
import Stats from "@/sections/Stats";
import PorQueElegirnos from "@/sections/PorQueElegirnos";
import ServiciosPreview from "@/sections/ServiciosPreview";
import Tecnologia from "@/sections/Tecnologia";
import CTAFinal from "@/sections/CTAFinal";
import Footer from "@/sections/Footer";

export default function Page() {
  return (
    <main className="w-full min-h-screen bg-black text-white overflow-x-hidden">
      <Navbar />
      <Hero />
      <Stats />
      <PorQueElegirnos />
      <ServiciosPreview />
      <Tecnologia />
      <CTAFinal />
      <Footer />
    </main>
  );
}
