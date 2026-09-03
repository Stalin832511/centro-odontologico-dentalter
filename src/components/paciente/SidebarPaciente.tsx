"use client";

import Link from "next/link";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarPlus,
  FileText,
  ScanLine,
  MessageSquareText,
  History,
  UserCog,
  LogOut,
  ChevronRight,
  X,
} from "lucide-react";
import { usePacienteActual } from "@/hooks/usePacienteActual";
import { supabase } from "@/lib/supabase";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function SidebarPaciente({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { paciente, cargando } = usePacienteActual();

  // El parámetro ?agendar=1 decide si "Agendar Cita" está activo,
  // en vez de solo comparar la ruta base — así "Mi Panel" y
  // "Agendar Cita" nunca se marcan activos los dos a la vez,
  // aunque ambos apunten a /paciente/dashboard.
  const agendarActivo = searchParams.get("agendar") === "1";

  const menus = [
    {
      icon: LayoutDashboard,
      title: "Mi Panel",
      href: "/paciente/dashboard",
      isActive: pathname === "/paciente/dashboard" && !agendarActivo,
    },
    {
      icon: CalendarPlus,
      title: "Agendar Cita",
      href: "/paciente/dashboard?agendar=1",
      isActive: pathname === "/paciente/dashboard" && agendarActivo,
    },
    {
      icon: FileText,
      title: "Mi Receta Médica",
      href: "/paciente/receta",
      isActive: pathname === "/paciente/receta",
    },
    {
      icon: ScanLine,
      title: "Mis Resultados",
      href: "/paciente/resultados",
      isActive: pathname === "/paciente/resultados",
    },
    {
      icon: History,
      title: "Historial",
      href: "/paciente/historial",
      isActive: pathname === "/paciente/historial",
    },
    {
      icon: UserCog,
      title: "Mis Datos",
      href: "/paciente/perfil",
      isActive: pathname === "/paciente/perfil",
    },
  ];

  const nombreCompleto = paciente
    ? `${paciente.nombres} ${paciente.apellidos}`
    : null;

  async function handleCerrarSesion() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed lg:static top-0 left-0 h-screen
          w-[280px] sm:w-[300px] z-50
          bg-gradient-to-b from-sky-600 via-cyan-600 to-blue-700
          text-white flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          overflow-y-auto
        `}
      >
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/20 flex items-center justify-center text-2xl sm:text-3xl">
              🦷
            </div>
            <div>
              <h1 className="font-black text-xl sm:text-2xl">DentalTER</h1>
              <p className="text-white/70 text-sm">Portal Paciente</p>
            </div>
          </div>
        </div>

        <div className="px-6">
          <div className="bg-white/10 rounded-3xl p-5 backdrop-blur-xl">
            <img
              src={paciente?.foto_url || "/imagenes/Quienes-somos.jpeg"}
              alt={nombreCompleto ?? "Paciente"}
              className="w-20 h-20 rounded-full object-cover border-4 border-white mx-auto"
            />
            {cargando ? (
              <div className="h-4 w-28 mx-auto mt-4 rounded-full bg-white/20 animate-pulse" />
            ) : (
              <h2 className="text-center font-bold mt-4">
                {nombreCompleto ?? "Paciente"}
              </h2>
            )}
            <p className="text-center text-white/70 text-sm">Paciente</p>
          </div>
        </div>

        <div className="flex-1 mt-8 px-4">
          <div className="space-y-2">
            {menus.map((item, index) => {
              const Icon = item.icon;
              return (
                <Link key={index} href={item.href} onClick={onClose}>
                  <button
                    className={`
                      w-full flex items-center justify-between
                      px-5 py-4 rounded-2xl transition-all
                      ${item.isActive ? "bg-white text-cyan-600 shadow-xl" : "hover:bg-white/10"}
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <Icon size={20} />
                      <span className="font-medium">{item.title}</span>
                    </div>
                    <ChevronRight size={16} />
                  </button>
                </Link>
              );
            })}

            <button
              disabled
              className="w-full flex items-center justify-between px-5 py-4 rounded-2xl opacity-50 cursor-not-allowed"
            >
              <div className="flex items-center gap-4">
                <MessageSquareText size={20} />
                <span className="font-medium">Chat con mi Doctor</span>
              </div>
              <span className="text-[9px] font-bold uppercase bg-white/20 px-2 py-1 rounded-full">
                Próx.
              </span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <button
            onClick={handleCerrarSesion}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-red-500 hover:bg-red-600 transition-all"
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}