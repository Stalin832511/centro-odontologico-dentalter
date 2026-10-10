"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export interface AnuncioSala {
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  image: string;
  accent: string;
}

export const ANUNCIOS_SALA: AnuncioSala[] = [
  {
    eyebrow: "Experiencia DentalTER",
    title: "Tu sonrisa merece un cuidado extraordinario.",
    description:
      "Tecnología de precisión, especialistas que escuchan y una atención diseñada para que te sientas en confianza.",
    action: "Conoce nuestros servicios",
    image:
      "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1200&q=85",
    accent: "#7ee7dd",
  },
  {
    eyebrow: "Odontología preventiva",
    title: "Prevenir hoy es sonreír por muchos años.",
    description:
      "Agenda tu valoración y descubre un plan de cuidado personalizado para toda tu familia.",
    action: "Agenda tu valoración",
    image:
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=85",
    accent: "#b9a7ff",
  },
  {
    eyebrow: "Tu bienestar es primero",
    title: "Una clínica pensada para tu tranquilidad.",
    description:
      "Ambientes premium, protocolos seguros y un equipo humano listo para acompañarte en cada paso.",
    action: "Conoce nuestro consultorio",
    image:
      "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=85",
    accent: "#f6c98f",
  },
];

interface PublicidadSalaProps {
  anuncios?: AnuncioSala[];
}

export default function PublicidadSala({
  anuncios = ANUNCIOS_SALA,
}: PublicidadSalaProps) {
  const [indice, setIndice] = useState(0);

  useEffect(() => {
    const intervalo = window.setInterval(() => {
      setIndice((actual) => (actual + 1) % anuncios.length);
    }, 9000);
    return () => window.clearInterval(intervalo);
  }, [anuncios.length]);

  const anuncio = anuncios[indice];
  const cambiar = (direccion: number) =>
    setIndice((actual) => (actual + direccion + anuncios.length) % anuncios.length);

  return (
    <section className="relative flex min-h-[360px] flex-1 overflow-hidden rounded-[30px] border border-white/10 bg-[#111a2d] shadow-[0_24px_80px_-30px_rgba(0,0,0,.8)] lg:min-h-0">
      <img
        key={anuncio.image}
        src={anuncio.image}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-45 transition-opacity duration-700"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0d1628] via-[#0d1628]/90 to-[#0d1628]/20" />
      <div
        className="absolute -right-20 -top-24 h-72 w-72 rounded-full blur-3xl"
        style={{ backgroundColor: `${anuncio.accent}20` }}
      />

      <div className="relative z-10 flex w-full flex-col justify-between p-7 sm:p-9">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-white/60">
            <Sparkles size={14} style={{ color: anuncio.accent }} />
            Inspiración DentalTER
          </span>
          <div className="flex gap-1.5">
            {anuncios.map((item, i) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setIndice(i)}
                aria-label={`Ver anuncio ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === indice ? "w-8" : "w-1.5 bg-white/30"
                }`}
                style={i === indice ? { backgroundColor: anuncio.accent } : undefined}
              />
            ))}
          </div>
        </div>

        <div className="max-w-xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em]" style={{ color: anuncio.accent }}>
            {anuncio.eyebrow}
          </p>
          <h2 className="max-w-lg text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-4xl">
            {anuncio.title}
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-300">
            {anuncio.description}
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm font-semibold text-white">
            <span>{anuncio.action}</span>
            <ArrowRight size={17} style={{ color: anuncio.accent }} />
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => cambiar(-1)} aria-label="Anuncio anterior" className="rounded-full border border-white/15 p-2 text-white/70 transition hover:bg-white/10 hover:text-white">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => cambiar(1)} aria-label="Anuncio siguiente" className="rounded-full border border-white/15 p-2 text-white/70 transition hover:bg-white/10 hover:text-white">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}
