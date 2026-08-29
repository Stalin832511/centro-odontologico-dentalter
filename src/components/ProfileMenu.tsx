"use client";

// ============================================================
// ProfileMenu
// Reemplaza el bloque de "perfil" estático de cada Topbar.
// Muestra foto y nombre reales: primero busca si la cuenta está
// vinculada a una fila de `doctores` (ej. la Dra. Fajardo, sea
// que esté parada en el panel admin o en el médico); si no,
// cae de vuelta al metadata del usuario, y si tampoco hay nada,
// muestra las iniciales. Al hacer clic, abre un menú con el rol
// actual y, SOLO si la cuenta tiene doble rol, un botón para
// saltar al otro panel.
// ============================================================

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, ArrowLeftRight } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { obtenerMiPerfilDoctor, PerfilDoctorActual } from "@/services/medico";

type Rol = "administrador" | "medico" | "paciente";

function extraerRoles(rawRol: unknown): Rol[] {
  if (Array.isArray(rawRol)) return rawRol as Rol[];
  if (typeof rawRol === "string") return [rawRol as Rol];
  return [];
}

const ETIQUETA_ROL: Record<Rol, string> = {
  administrador: "Administrador",
  medico: "Médico",
  paciente: "Paciente",
};

export default function ProfileMenu({
  currentPanel,
}: {
  currentPanel: "administrador" | "medico";
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [email, setEmail] = useState("");
  const [perfilDoctor, setPerfilDoctor] = useState<PerfilDoctorActual | null>(null);
  const [nombreMeta, setNombreMeta] = useState("");
  const [fotoMeta, setFotoMeta] = useState<string | null>(null);
  const [roles, setRoles] = useState<Rol[]>([]);
  const contenedorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const meta = data.user?.user_metadata ?? {};
      setNombreMeta((meta.nombres as string) ?? "");
      setEmail(data.user?.email ?? "");
      setFotoMeta((meta.foto_url as string) ?? null);
      setRoles(extraerRoles(meta.rol));
    });
    obtenerMiPerfilDoctor().then(setPerfilDoctor);
  }, []);

  // Cierra el menú si se hace clic afuera
  useEffect(() => {
    function manejarClickAfuera(e: MouseEvent) {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    }
    document.addEventListener("mousedown", manejarClickAfuera);
    return () => document.removeEventListener("mousedown", manejarClickAfuera);
  }, []);

  const nombreMostrar =
    (perfilDoctor && `${perfilDoctor.nombres} ${perfilDoctor.apellidos}`) ||
    nombreMeta ||
    email.split("@")[0] ||
    "Usuario";

  const fotoUrl = perfilDoctor?.foto_url ?? fotoMeta;

  const inicial = nombreMostrar.charAt(0).toUpperCase();
  const tieneDobleRol = roles.includes("administrador") && roles.includes("medico");

  const destinoOtroPanel =
    currentPanel === "administrador"
      ? { ruta: "/medico/dashboard", etiqueta: "Cambiar a Médico" }
      : { ruta: "/admin/dashboard", etiqueta: "Cambiar a Administrador" };

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        onClick={() => setAbierto((v) => !v)}
        className="flex items-center gap-2 sm:gap-3 bg-white rounded-2xl px-2 sm:px-3 py-2 shadow-sm hover:bg-slate-50 transition-colors"
      >
        {fotoUrl ? (
          <img
            src={fotoUrl}
            alt={nombreMostrar}
            className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-white font-bold shrink-0">
            {inicial}
          </div>
        )}
        <div className="hidden md:block min-w-0 text-left">
          <h3 className="text-sm font-bold text-slate-800 truncate max-w-[140px]">
            {nombreMostrar}
          </h3>
          <p className="text-xs text-slate-500">{ETIQUETA_ROL[currentPanel]}</p>
        </div>
        <ChevronDown
          size={16}
          className={`hidden md:block text-slate-400 transition-transform ${abierto ? "rotate-180" : ""}`}
        />
      </button>

      {abierto && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-slate-100">
            <p className="text-sm font-bold text-slate-800 truncate">{nombreMostrar}</p>
            <p className="text-xs text-slate-500 truncate">{email}</p>
          </div>

          {tieneDobleRol && (
            <button
              onClick={() => {
                setAbierto(false);
                router.push(destinoOtroPanel.ruta);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-cyan-50 hover:text-cyan-700 transition-colors"
            >
              <ArrowLeftRight size={15} />
              {destinoOtroPanel.etiqueta}
            </button>
          )}

          {!tieneDobleRol && (
            <p className="px-4 py-3 text-xs text-slate-400">
              Sesión activa como {ETIQUETA_ROL[currentPanel]}
            </p>
          )}
        </div>
      )}
    </div>
  );
}