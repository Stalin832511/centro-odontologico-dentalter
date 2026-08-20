// Importamos Navbar
import Navbar from "@/components/Navbar";

// Importamos Hero
import Hero from "@/sections/Hero";


// Página principal
export default function Page() {

  // Retorna interfaz
  return (

    // Main principal
    <main

      className="

        // Ancho completo
        w-full

        // Altura mínima pantalla
        min-h-screen

        // Fondo negro
        bg-black

        // Texto blanco
        text-white

        // Evita scroll horizontal
        overflow-x-hidden
      "
    >

      {/* Navbar */}
      <Navbar />

      {/* Hero */}
      <Hero />

    </main>
  );
}