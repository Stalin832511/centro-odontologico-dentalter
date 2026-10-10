"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Home,
  Briefcase,
  Users,
  MessageCircle,
  Phone,
  UserRound,
  Stethoscope,
  ShieldCheck,
  ChevronDown,
  X,
} from "lucide-react";

import { clinicConfig } from "@/config/clinicConfig";

const NAV_ITEMS = [
  { name: "Inicio", link: "/", icon: Home },
  { name: "Servicios", link: "/servicios", icon: Briefcase },
  { name: "Quiénes Somos", link: "/quienes-somos", icon: Users },
  { name: "Testimonios", link: "/testimonios", icon: MessageCircle },
  { name: "Contacto", link: "/contacto", icon: Phone },
];

const ACCESS_OPTIONS = [
  {
    label: "Soy Paciente",
    description: "Consulta tu receta y citas",
    href: "/admin/login?role=paciente",
    icon: UserRound,
  },
  {
    label: "Soy Médico",
    description: "Gestiona tus pacientes y consultas",
    href: "/admin/login?role=medico",
    icon: Stethoscope,
  },
  {
    label: "Soy Administrador",
    description: "Panel de gestión de la clínica",
    href: "/admin/login?role=administrador",
    icon: ShieldCheck,
  },
];

export default function Navbar() {
  const pathname = usePathname();
  const [accessOpen, setAccessOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Referencia al contenido del bottom sheet (vive en un Portal,
  // fuera de menuRef) — necesaria para que "clic afuera" no lo cierre
  // por error cuando se toca dentro del propio panel.
  const sheetRef = useRef<HTMLDivElement>(null);

  const isHome = pathname === "/";
  const isTransparentMode = isHome && !isScrolled;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 40);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const dentroDelMenu = menuRef.current?.contains(e.target as Node);
      const dentroDelSheet = sheetRef.current?.contains(e.target as Node);

      if (!dentroDelMenu && !dentroDelSheet) {
        setAccessOpen(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setAccessOpen(false);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  useEffect(() => {
    setAccessOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (accessOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [accessOpen]);

  return (
    <>
      {/* ================= HEADER ================= */}
      <header
        className={`
          fixed top-0 left-0 w-full z-[999]
          border-b
          transition-colors duration-300
          ${
            isTransparentMode
              ? "bg-slate-100/10 backdrop-blur-2xl border-white/15"
              : "bg-white/90 backdrop-blur-xl border-slate-200 shadow-sm shadow-slate-900/5"
          }
        `}
      >
        <div
          className="
            max-w-7xl mx-auto
            px-5 md:px-8
            h-20 md:h-[88px]
            flex items-center justify-between
            gap-4
          "
        >
          {/* LOGO */}
          <Link
            href="/"
            className="flex items-center gap-2.5 md:gap-3 shrink-0"
          >
            {/* Muela profesional SVG */}
            <svg
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
              aria-label="DentalTER"
              className="
                w-9 h-9 md:w-12 md:h-12 lg:w-16 lg:h-16
                shrink-0
                drop-shadow-md
                transition-transform duration-300
                hover:scale-105
              "
            >
              <defs>
                <linearGradient
                  id="navbarToothGradient"
                  x1="18"
                  y1="8"
                  x2="82"
                  y2="92"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="#67E8F9" />
                  <stop offset="45%" stopColor="#22D3EE" />
                  <stop offset="100%" stopColor="#0891B2" />
                </linearGradient>
              </defs>

              {/* FILO TURQUESA DE LA MUELA */}
              <path
                d="
                  M50 8
                  C44 8 40 11 36 12
                  C31 13 27 9 22 10
                  C14 11 9 18 9 27
                  C9 36 13 43 18 50
                  C21 55 24 61 25 68
                  C26 75 27 85 32 91
                  C34 94 38 94 40 91
                  C43 87 43 79 45 73
                  C46 69 48 66 50 66
                  C52 66 54 69 55 73
                  C57 79 57 87 60 91
                  C62 94 66 94 68 91
                  C73 85 74 75 75 68
                  C76 61 79 55 82 50
                  C87 43 91 36 91 27
                  C91 18 86 11 78 10
                  C73 9 69 13 64 12
                  C60 11 56 8 50 8
                  Z
                "
                fill="none"
                stroke="url(#navbarToothGradient)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Relieve turquesa - cúspide izquierda */}
              <path
                d="
                  M43 15
                  C38 18 35 23 34 30
                  C33 37 35 44 38 50
                  C40 54 42 58 44 62
                  C43 54 43 47 45 40
                  C47 31 50 23 56 17
                  C52 14 47 13 43 15
                  Z
                "
                fill="url(#navbarToothGradient)"
                opacity="0.95"
              />

              {/* Relieve turquesa - cúspide derecha */}
              <path
                d="
                  M57 17
                  C63 23 66 31 68 40
                  C70 47 70 54 69 62
                  C72 58 74 54 76 50
                  C79 44 81 37 80 30
                  C79 23 76 18 71 15
                  C67 13 62 14 57 17
                  Z
                "
                fill="url(#navbarToothGradient)"
                opacity="0.78"
              />

              {/* Surco central de la muela */}
              <path
                d="
                  M50 27
                  C46 34 45 40 46 47
                  C47 53 49 58 50 63
                  C51 58 53 53 54 47
                  C55 40 54 34 50 27
                  Z
                "
                fill="#F8FAFC"
                opacity="0.9"
              />

              {/* Detalle central turquesa */}
              <path
                d="
                  M50 30
                  C48 36 48 41 49 47
                  C49.5 51 50 55 50 59
                  C50 55 50.5 51 51 47
                  C52 41 52 36 50 30
                  Z
                "
                fill="url(#navbarToothGradient)"
              />

              {/* Brillo superior */}
              <path
                d="M24 21 C27 18 31 17 35 19"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
                opacity="0.9"
              />

              {/* Pequeño brillo secundario */}
              <path
                d="M67 18 C70 17 73 18 76 21"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.8"
                strokeLinecap="round"
                opacity="0.7"
              />
            </svg>

            <div className="leading-none">
              <p
                className={`
                  hidden sm:block
                  text-[9px] md:text-[10px] lg:text-[11px]
                  font-semibold uppercase tracking-[0.3em] md:tracking-[0.35em]
                  whitespace-nowrap
                  transition-colors duration-300
                  ${isTransparentMode ? "text-white" : "text-slate-800"}
                `}
              >
                Consultorio
              </p>

              <h1 className="mt-0.5 md:mt-1 text-base sm:text-lg md:text-2xl lg:text-3xl font-extrabold uppercase tracking-wide whitespace-nowrap">
                <span
                  className={`transition-colors duration-300 ${
                    isTransparentMode ? "text-white" : "text-slate-800"
                  }`}
                >
                  Dental
                </span>
                <span style={{ color: clinicConfig.primaryColor }}>Ter</span>
              </h1>
            </div>
          </Link>

          {/* MENÚ DESKTOP */}
          <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
            {NAV_ITEMS.map((item) => {
              const active = pathname === item.link;

              return (
                <Link
                  key={item.link}
                  href={item.link}
                  className={`
                    relative pb-1 font-medium text-[15px]
                    transition-colors duration-300
                    ${
                      active
                        ? "text-cyan-500"
                        : isTransparentMode
                          ? "text-white hover:text-cyan-300"
                          : "text-slate-700 hover:text-cyan-600"
                    }
                  `}
                >
                  {item.name}

                  <span
                    className={`
                      absolute left-0 -bottom-1 h-[2px] rounded-full
                      bg-cyan-500 transition-all duration-300
                      ${active ? "w-full" : "w-0"}
                    `}
                  />
                </Link>
              );
            })}
          </nav>

          {/* BOTÓN DE ACCESO */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setAccessOpen((v) => !v)}
              aria-expanded={accessOpen}
              aria-haspopup="menu"
              className="
                group relative flex items-center gap-2 overflow-hidden
                px-4 md:px-5 py-2.5 md:py-3
                rounded-full
                text-sm font-semibold text-white
                shadow-lg shadow-cyan-950/25
                transition-all duration-300
                hover:scale-[1.03]
              "
              style={{
                background: `linear-gradient(135deg, ${clinicConfig.primaryColor}, #0e7490)`,
              }}
            >
              <span className="absolute inset-0 bg-slate-950/10" />

              <span className="relative flex items-center gap-2">
                <ShieldCheck size={17} />

                <span className="hidden sm:inline">
                  Acceder al Sistema
                </span>

                <ChevronDown
                  size={16}
                  className={`transition-transform duration-300 ${
                    accessOpen ? "rotate-180" : ""
                  }`}
                />
              </span>
            </button>

            {/* PANEL DESKTOP — dropdown anclado, solo desde lg */}
            <div
              role="menu"
              className={`
                hidden lg:block
                absolute right-0 mt-3 w-72
                rounded-2xl overflow-hidden
                bg-white shadow-2xl shadow-slate-900/20
                border border-slate-100
                origin-top-right
                transition-all duration-200
                ${
                  accessOpen
                    ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                    : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
                }
              `}
            >
              <AccessOptionsList />
            </div>
          </div>
        </div>
      </header>

      {/* ================= BOTTOM SHEET (mobile/tablet) — vía PORTAL ================= */}
      {mounted &&
        createPortal(
          <div
            className={`
              lg:hidden fixed inset-0 z-[99999]
              transition-opacity duration-300
              ${
                accessOpen
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }
            `}
            aria-hidden={!accessOpen}
          >
            <div
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
              onClick={() => setAccessOpen(false)}
            />

            <div
              ref={sheetRef}
              className={`
                absolute bottom-0 left-0 w-full
                bg-white
                rounded-t-[28px]
                shadow-2xl
                px-5 pt-4
                pb-[calc(1.5rem+env(safe-area-inset-bottom))]
                transition-transform duration-300 ease-out
                ${
                  accessOpen
                    ? "translate-y-0"
                    : "translate-y-full"
                }
              `}
            >
              <div className="w-10 h-1.5 rounded-full bg-slate-200 mx-auto mb-4" />

              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">
                  ¿Cómo quieres ingresar?
                </p>

                <button
                  onClick={() => setAccessOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0"
                  aria-label="Cerrar"
                >
                  <X size={16} className="text-slate-500" />
                </button>
              </div>

              <AccessOptionsList
                onSelect={() => setAccessOpen(false)}
              />
            </div>
          </div>,
          document.body
        )}

      {/* ================= BOTTOM NAV (mobile/tablet) =================
          Ítem activo ahora con "pastilla" iluminada en turquesa
          (fondo sólido + texto/ícono blanco), inspirado en apps tipo
          ServiHogar — en vez de solo cambiar el color del texto. */}
      <div
        className="
          lg:hidden fixed bottom-0 left-0 w-full z-[999]
          bg-white/95 backdrop-blur-xl
          border-t border-slate-200
          flex items-center justify-around
          py-2.5 md:py-3.5
          [padding-bottom:env(safe-area-inset-bottom)]
        "
      >
        {NAV_ITEMS.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = pathname === item.link;

          return (
            <Link
              key={item.link}
              href={item.link}
              className="flex flex-col items-center gap-0.5 md:gap-1 px-1"
            >
              <span
                className="
                  flex items-center justify-center
                  px-3.5 py-1.5 rounded-full
                  transition-all duration-300
                "
                style={
                  active
                    ? {
                        background: `linear-gradient(135deg, ${clinicConfig.primaryColor}, #0e7490)`,
                        boxShadow: `0 4px 14px -2px ${clinicConfig.primaryColor}66`,
                      }
                    : undefined
                }
              >
                <Icon
                  size={20}
                  className={`md:w-[24px] md:h-[24px] ${
                    active ? "text-white" : "text-slate-500"
                  }`}
                />
              </span>

              <span
                className={`text-[10px] md:text-xs leading-tight transition-colors duration-300 ${
                  active ? "font-bold" : "text-slate-500"
                }`}
                style={
                  active
                    ? { color: clinicConfig.primaryColor }
                    : undefined
                }
              >
                {item.name}
              </span>
            </Link>
          );
        })}

        <button
          onClick={() => setAccessOpen(true)}
          className="flex flex-col items-center gap-0.5 md:gap-1 px-1"
        >
          <span
            className="
              flex items-center justify-center
              px-3.5 py-1.5 rounded-full
              transition-all duration-300
            "
            style={
              accessOpen
                ? {
                    background: `linear-gradient(135deg, ${clinicConfig.primaryColor}, #0e7490)`,
                    boxShadow: `0 4px 14px -2px ${clinicConfig.primaryColor}66`,
                  }
                : undefined
            }
          >
            <ShieldCheck
              size={20}
              className={`md:w-[24px] md:h-[24px] ${
                accessOpen ? "text-white" : "text-slate-500"
              }`}
            />
          </span>

          <span
            className={`text-[10px] md:text-xs leading-tight transition-colors duration-300 ${
              accessOpen ? "font-bold" : "text-slate-500"
            }`}
            style={
              accessOpen
                ? { color: clinicConfig.primaryColor }
                : undefined
            }
          >
            Acceder
          </span>
        </button>
      </div>
    </>
  );
}

function AccessOptionsList({ onSelect }: { onSelect?: () => void }) {
  return (
    <div className="pb-2 lg:pb-0">
      {ACCESS_OPTIONS.map((option) => {
        const Icon = option.icon;

        return (
          <Link
            key={option.href}
            href={option.href}
            role="menuitem"
            onClick={onSelect}
            className="
              flex items-center gap-3
              mx-0 lg:mx-2 my-1
              px-3 py-3
              rounded-xl
              transition-colors duration-150
              hover:bg-slate-50
              active:bg-slate-100
            "
          >
            <span
              className="
                flex items-center justify-center
                w-11 h-11 lg:w-10 lg:h-10
                rounded-full shrink-0
              "
              style={{
                backgroundColor: `${clinicConfig.primaryColor}15`,
              }}
            >
              <Icon
                size={20}
                style={{ color: clinicConfig.primaryColor }}
              />
            </span>

            <span>
              <span className="block text-sm font-semibold text-slate-800">
                {option.label}
              </span>

              <span className="block text-xs text-slate-500">
                {option.description}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}