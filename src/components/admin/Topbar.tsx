"use client";

import { Search, Bell, Settings, Menu } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ProfileMenu from "@/components/ProfileMenu";

interface TopbarProps {
  onMenuClick?: () => void;
}

export default function Topbar({ onMenuClick }: TopbarProps) {
  const { user } = useAuth();

  const fecha = new Date().toLocaleDateString("es-EC", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 md:px-8 py-4 print:hidden">
      <div className="flex items-center justify-between gap-4">
        {/* IZQUIERDA */}
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <button
            onClick={onMenuClick}
            className="lg:hidden shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-100 flex items-center justify-center"
          >
            <Menu size={22} />
          </button>

          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl md:text-2xl font-black text-slate-800 truncate">
              Centro Odontológico
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 capitalize truncate">
              {fecha}
            </p>
          </div>
        </div>

        {/* BUSCADOR */}
        <div className="hidden lg:flex items-center relative">
          <Search size={18} className="absolute left-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar pacientes, citas o doctores..."
            className="w-[280px] xl:w-[380px] py-3 pl-11 pr-4 rounded-2xl bg-slate-100 outline-none focus:ring-2 focus:ring-cyan-400"
          />
        </div>

        {/* DERECHA */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
          </button>

          <button className="hidden sm:flex w-12 h-12 rounded-xl bg-slate-100 items-center justify-center">
            <Settings size={20} />
          </button>

          {/* PERFIL — ahora es un menú desplegable con foto real
              (si existe) y, si la cuenta tiene doble rol, el
              botón para cambiar de panel */}
          <ProfileMenu currentPanel="administrador" />
        </div>
      </div>
    </header>
  );
}