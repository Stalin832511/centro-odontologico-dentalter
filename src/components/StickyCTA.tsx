"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CalendarCheck, Stethoscope } from "lucide-react";
import { clinicConfig } from "@/config/clinicConfig";

export default function StickyCTA() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function handleScroll() {
      const threshold = pathname === "/" ? window.innerHeight * 0.7 : 200;
      setVisible(window.scrollY > threshold);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  if (
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/medico") ||
    pathname?.startsWith("/paciente")
  ) {
    return null;
  }

  return (
    <div
      className={`
        fixed z-[900]
        left-0 lg:left-auto
        right-0 lg:right-5
        bottom-[64px] lg:bottom-5
        [padding-bottom:env(safe-area-inset-bottom)] lg:[padding-bottom:0]
        transition-all duration-300
        ${
          visible
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }
      `}
    >
      <div className="lg:hidden flex bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.1)]">
        <Link
          href="/agendar"
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-white"
          style={{
            background: `linear-gradient(135deg, ${clinicConfig.primaryColor}, #0e7490)`,
          }}
        >
          <CalendarCheck size={16} />
          Agendar Consulta
        </Link>

        <Link
          href="/servicios"
          className="flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold text-slate-800 border-l border-slate-200"
        >
          <Stethoscope size={16} />
          Ver Servicios
        </Link>
      </div>

      <div className="hidden lg:flex flex-col gap-2.5">
        <Link
          href="/agendar"
          className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-white shadow-xl shadow-cyan-950/30 hover:scale-[1.03] transition-transform duration-300"
          style={{
            background: `linear-gradient(135deg, ${clinicConfig.primaryColor}, #0e7490)`,
          }}
        >
          <CalendarCheck size={16} />
          Agendar Consulta
        </Link>

        <Link
          href="/servicios"
          className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold text-slate-800 bg-white border border-slate-200 shadow-lg hover:scale-[1.03] transition-transform duration-300"
        >
          <Stethoscope size={16} />
          Ver Servicios
        </Link>
      </div>
    </div>
  );
}
