import Link from "next/link";
import { CalendarCheck, Stethoscope } from "lucide-react";
import { clinicConfig } from "@/config/clinicConfig";

export default function Hero() {
  return (
    <section className="relative min-h-[100svh] flex items-center overflow-hidden">
      {/* VIDEO DE FONDO */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="
          absolute inset-0 w-full h-full object-cover
          scale-110 sm:scale-100
          z-0 pointer-events-none
        "
      >
        <source src={clinicConfig.heroVideo} type="video/mp4" />
      </video>

      {/* OVERLAY */}
      <div
        className="absolute inset-0 z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(2,6,23,0.75) 0%, rgba(2,6,23,0.45) 45%, rgba(2,6,23,0.8) 100%)",
        }}
      />

      {/* CONTENIDO */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-5 sm:px-6 pt-28 sm:pt-32 md:pt-40 pb-20 md:pb-24">
        <p
          className="
            font-semibold tracking-[3px] sm:tracking-[5px]
            mb-4 sm:mb-5 text-xs sm:text-sm md:text-base
          "
          style={{ color: "#02D3F1" }}
        >
          CLÍNICA ODONTOLÓGICA PREMIUM
        </p>

        <h1
          className="
            text-4xl sm:text-5xl md:text-7xl lg:text-8xl
            font-bold leading-[1.05] text-white
            max-w-5xl mb-6 sm:mb-8
          "
        >
          Sonrisas modernas con tecnología avanzada
        </h1>

        <p
          className="
            text-base sm:text-lg md:text-2xl
            text-slate-200 leading-relaxed
            max-w-3xl mb-8 sm:mb-12
          "
        >
          Especialistas en estética dental, ortodoncia y rehabilitación oral
          con atención premium y tecnología moderna.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
          {/* AGENDAR CONSULTA — sólido, con pulso en el ícono */}
          <Link
            href="/agendar"
            className="
              group relative flex items-center justify-center gap-2.5 overflow-hidden
              transition-transform duration-300 hover:scale-[1.03]
              px-8 sm:px-10 py-4 sm:py-5
              rounded-2xl text-white text-base sm:text-lg font-semibold
              text-center shadow-2xl shadow-cyan-950/30
            "
            style={{
              background: `linear-gradient(135deg, ${clinicConfig.primaryColor}, #0e7490)`,
            }}
          >
            <span className="absolute inset-0 bg-slate-950/10" />
            <span className="relative flex items-center gap-2.5">
              <span className="relative flex items-center justify-center w-5 h-5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-white/50 opacity-60 animate-ping" />
                <CalendarCheck size={20} className="relative" />
              </span>
              Agendar Consulta
            </span>
          </Link>

          {/* VER SERVICIOS — mismo tratamiento, sin pulso */}
          <Link
            href="/servicios"
            className="
              relative flex items-center justify-center gap-2.5 overflow-hidden
              transition-transform duration-300 hover:scale-[1.03]
              px-8 sm:px-10 py-4 sm:py-5
              rounded-2xl text-white text-base sm:text-lg font-semibold
              text-center shadow-2xl shadow-cyan-950/30
            "
            style={{
              background: `linear-gradient(135deg, ${clinicConfig.primaryColor}, #0e7490)`,
            }}
          >
            <span className="absolute inset-0 bg-slate-950/10" />
            <span className="relative flex items-center gap-2.5">
              <Stethoscope size={20} />
              Ver Servicios
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}