"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import DashboardCards from "@/components/admin/DashboardCards";
import GraficoDashboard from "@/components/admin/GraficoDashboard";
import CalendarioPremium from "@/components/admin/CalendarioPremium";
import AgendaDia from "@/components/admin/AgendaDia";
import TablaCitas from "@/components/admin/TablaCitas";
import { obtenerMiPerfilDoctor, PerfilDoctorActual } from "@/services/medico";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [perfilDoctor, setPerfilDoctor] = useState<PerfilDoctorActual | null>(null);

  useEffect(() => {
    obtenerMiPerfilDoctor().then(setPerfilDoctor);
  }, []);

  const primerNombre = perfilDoctor?.nombres?.split(" ")[0] ?? "";

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <section className="flex-1 min-w-0">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />

          <div className="p-4 md:p-6 xl:p-8 max-w-[1600px] mx-auto">
            {/* HERO */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="relative overflow-hidden rounded-2xl md:rounded-[28px] p-5 sm:p-8 md:p-10 mb-6 md:mb-8 bg-[#0b1220] shadow-[0_20px_60px_-15px_rgba(11,18,32,0.45)]"
            >
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="absolute -bottom-32 left-1/3 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <p className="uppercase tracking-[3px] text-[10px] sm:text-xs font-semibold text-cyan-300/90">
                      Sistema administrativo
                    </p>
                  </div>

                  {/* Saludo personalizado si la cuenta está vinculada
                      a una fila de doctor (ej. la Dra. Fajardo como
                      dueña); si no, se muestra el título genérico. */}
                  <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-[42px] xl:text-5xl leading-[1.1] mb-3 tracking-tight">
                    {perfilDoctor ? `Buen día, Dra. ${primerNombre}` : "Dashboard clínico"}
                  </h1>
                  <p className="text-slate-400 max-w-xl text-sm sm:text-[15px] leading-relaxed">
                    Gestiona pacientes, citas médicas, doctores, especialidades
                    y reportes desde una única plataforma.
                  </p>

                  {perfilDoctor && (
                    <div className="flex items-center gap-3 mt-5">
                      {perfilDoctor.foto_url ? (
                        <img
                          src={perfilDoctor.foto_url}
                          alt={`${perfilDoctor.nombres} ${perfilDoctor.apellidos}`}
                          className="w-11 h-11 rounded-full object-cover border-2 border-white/20"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-white/10 border-2 border-white/20 flex items-center justify-center text-white font-bold">
                          {perfilDoctor.nombres.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-semibold text-sm">
                          {perfilDoctor.nombres} {perfilDoctor.apellidos}
                        </p>
                        <p className="text-slate-400 text-xs">
                          {perfilDoctor.especialidad ?? "Administradora General"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-6 md:gap-8 shrink-0">
                  <HeroStat label="Hoy" value="42" sublabel="citas" />
                  <div className="w-px bg-white/10" />
                  <HeroStat label="Este mes" value="128" sublabel="registradas" />
                </div>
              </div>
            </motion.div>

            <motion.div initial="hidden" animate="show" variants={fadeUp} custom={1}>
              <DashboardCards />
            </motion.div>

            <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
              <motion.div initial="hidden" animate="show" variants={fadeUp} custom={2} className="xl:col-span-2 min-w-0">
                <GraficoDashboard />
              </motion.div>
              <motion.div initial="hidden" animate="show" variants={fadeUp} custom={3} className="min-w-0">
                <CalendarioPremium />
              </motion.div>
            </div>

            <motion.div initial="hidden" animate="show" variants={fadeUp} custom={4} className="mt-6">
              <AgendaDia />
            </motion.div>

            <motion.div initial="hidden" animate="show" variants={fadeUp} custom={5} className="mt-6 overflow-x-auto">
              <TablaCitas />
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}

function HeroStat({ label, value, sublabel }: { label: string; value: string; sublabel: string }) {
  return (
    <div className="text-right">
      <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white leading-none">{value}</p>
      <p className="text-[11px] text-slate-500 mt-1">{sublabel}</p>
    </div>
  );
}