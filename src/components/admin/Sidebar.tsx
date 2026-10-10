"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Stethoscope,
  ClipboardList,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  X,
  FolderHeart,
  ScanLine,
  MonitorUp,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { obtenerMiPerfilDoctor, PerfilDoctorActual } from "@/services/medico";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({
  isOpen = false,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const [perfilDoctor, setPerfilDoctor] =
    useState<PerfilDoctorActual | null>(null);

  useEffect(() => {
    obtenerMiPerfilDoctor().then(setPerfilDoctor);
  }, []);

  const menus = [
    {
      icon: <LayoutDashboard size={20} />,
      title: "Dashboard",
      href: "/admin/dashboard",
    },
    {
      icon: <CalendarDays size={20} />,
      title: "Citas",
      href: "/admin/citas",
    },
    {
      icon: <MonitorUp size={20} />,
      title: "Sala de espera",
      href: "/sala-espera",
    },
    {
      icon: <Users size={20} />,
      title: "Pacientes",
      href: "/admin/pacientes",
    },
    {
      icon: <FolderHeart size={20} />,
      title: "Historias Clínicas",
      href: "/admin/historias",
    },
    {
      icon: <Stethoscope size={20} />,
      title: "Doctores",
      href: "/admin/doctores",
    },
    {
      icon: <ClipboardList size={20} />,
      title: "Servicios",
      href: "/admin/servicios",
    },

    // ============================================================
    // NUEVO MÓDULO: RESULTADOS
    // Radiografías + Resultados de Laboratorio
    // ============================================================
    {
      icon: <ScanLine size={20} />,
      title: "Resultados",
      href: "/admin/resultados",
    },

    {
      icon: <Wallet size={20} />,
      title: "Finanzas",
      href: "/admin/finanzas",
    },
    {
      icon: <BarChart3 size={20} />,
      title: "Reportes",
      href: "/admin/reportes",
    },
    {
      icon: <Settings size={20} />,
      title: "Configuración",
      href: "/admin/configuracion",
    },
  ];

  // Nombre para mostrar:
  // primero el nombre real del doctor vinculado,
  // después el nombre guardado en metadata,
  // y finalmente el correo.
  const nombreMostrar =
    (perfilDoctor &&
      `${perfilDoctor.nombres} ${perfilDoctor.apellidos}`) ||
    (user?.user_metadata?.nombres as string | undefined) ||
    user?.email?.split("@")[0] ||
    "Administrador";

  const fotoUrl =
    perfilDoctor?.foto_url ??
    (user?.user_metadata?.foto_url as string | undefined) ??
    null;

  const inicial = nombreMostrar.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  return (
    <>
      {/* Overlay móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static
          top-0 left-0
          h-screen
          w-[280px] sm:w-[300px]
          z-50
          bg-gradient-to-b from-sky-600 via-cyan-600 to-blue-700
          text-white
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          overflow-y-auto
          print:hidden
        `}
      >
        {/* Botón cerrar en móvil */}
        <button
          onClick={onClose}
          className="
            lg:hidden
            absolute top-4 right-4
            w-9 h-9
            rounded-xl
            bg-white/10
            flex items-center justify-center
          "
        >
          <X size={18} />
        </button>

        {/* ======================================================
            LOGO
        ====================================================== */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-white/20 flex items-center justify-center text-2xl sm:text-3xl">
              🦷
            </div>

            <div>
              <h1 className="font-black text-xl sm:text-2xl">
                DentalTER
              </h1>

              <p className="text-white/70 text-sm">
                Premium System
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================
            PERFIL ADMINISTRADOR
        ====================================================== */}
        <div className="px-6">
          <div className="bg-white/10 rounded-3xl p-5 backdrop-blur-xl">
            {fotoUrl ? (
              <img
                src={fotoUrl}
                alt={nombreMostrar}
                className="w-20 h-20 rounded-full object-cover border-4 border-white mx-auto"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-white/20 border-4 border-white mx-auto flex items-center justify-center text-3xl font-black text-white">
                {inicial}
              </div>
            )}

            <h2 className="text-center font-bold mt-4 truncate px-1">
              {nombreMostrar}
            </h2>

            <p className="text-center text-white/70 text-sm">
              Administrador General
            </p>
          </div>
        </div>

        {/* ======================================================
            MENÚ PRINCIPAL
        ====================================================== */}
        <div className="flex-1 mt-8 px-4">
          <div className="space-y-2">
            {menus.map((item, index) => {
              const activo =
                pathname === item.href ||
                pathname?.startsWith(item.href + "/");

              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={onClose}
                >
                  <button
                    className={`
                      w-full flex items-center justify-between
                      px-5 py-4 rounded-2xl
                      transition-all
                      ${
                        activo
                          ? "bg-white text-cyan-600 shadow-xl"
                          : "hover:bg-white/10"
                      }
                    `}
                  >
                    <div className="flex items-center gap-4">
                      {item.icon}

                      <span className="font-medium">
                        {item.title}
                      </span>
                    </div>

                    <ChevronRight size={16} />
                  </button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ======================================================
            CERRAR SESIÓN
        ====================================================== */}
        <div className="p-6">
          <button
            onClick={handleLogout}
            className="
              w-full
              flex items-center justify-center gap-3
              py-4
              rounded-2xl
              bg-red-500
              hover:bg-red-600
              transition-all
            "
          >
            <LogOut size={18} />
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}