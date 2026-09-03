"use client";

import { Bell, Settings, Menu } from "lucide-react";
import { usePacienteActual } from "@/hooks/usePacienteActual";

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function TopbarPaciente({ onMenuClick }: TopbarProps) {
  const { paciente, cargando } = usePacienteActual();

  const fecha = new Date().toLocaleDateString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const nombreCompleto = paciente
    ? `${paciente.nombres} ${paciente.apellidos}`
    : "Paciente";

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 md:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-100 flex items-center justify-center"
          >
            <Menu size={22} />
          </button>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-800 truncate">
              Mi Portal de Salud
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 capitalize truncate">{fecha}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
          </button>
          <button className="hidden sm:flex w-12 h-12 rounded-xl bg-slate-100 items-center justify-center">
            <Settings size={20} />
          </button>
          <div className="flex items-center gap-3 bg-white rounded-2xl px-2 sm:px-3 py-2 shadow-sm">
            <img
              src={paciente?.foto_url || "/imagenes/Quienes-somos.jpeg"}
              alt={nombreCompleto}
              className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover"
            />
            <div className="hidden md:block">
              {cargando ? (
                <div className="h-3.5 w-20 rounded-full bg-slate-200 animate-pulse" />
              ) : (
                <h3 className="text-sm font-bold text-slate-800 truncate max-w-[140px]">
                  {nombreCompleto}
                </h3>
              )}
              <p className="text-xs text-slate-500">Paciente</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}