"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  CalendarClock,
  FileText,
  Clock,
  Phone,
  Video,
  ChevronRight,
  Stethoscope,
  BadgeCheck,
  GraduationCap,
} from "lucide-react";
import SidebarMedico from "@/components/medico/SidebarMedico";
import TopbarMedico from "@/components/medico/TopbarMedico";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const stats = [
  { label: "Pacientes hoy", value: "8", icon: Users, color: "#0d9488" },
  { label: "Consultas semana", value: "34", icon: CalendarClock, color: "#8b5cf6" },
  { label: "Recetas emitidas", value: "126", icon: FileText, color: "#0891b2" },
  { label: "Horas disponibles", value: "6h", icon: Clock, color: "#f59e0b" },
];

const agendaHoy = [
  { hora: "09:00", paciente: "Andrea Flores", motivo: "Control de ortodoncia", estado: "Confirmada" },
  { hora: "10:30", paciente: "Luis Ramírez", motivo: "Limpieza dental", estado: "Confirmada" },
  { hora: "11:45", paciente: "María Zambrano", motivo: "Evaluación de dolor", estado: "Pendiente" },
  { hora: "14:00", paciente: "Carlos Mendoza", motivo: "Retiro de brackets", estado: "Confirmada" },
];

const pacientesRecientes = [
  { nombre: "Andrea Flores", ultima: "Hace 2 días", diagnostico: "Ortodoncia en curso" },
  { nombre: "Luis Ramírez", ultima: "Hace 5 días", diagnostico: "Limpieza — sin novedad" },
  { nombre: "María Zambrano", ultima: "Hoy", diagnostico: "Pendiente evaluación" },
];

export default function DashboardMedicoPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="flex">
        <SidebarMedico isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <section className="flex-1 min-w-0">
          <TopbarMedico onMenuClick={() => setSidebarOpen(true)} />

          <div className="p-4 md:p-6 xl:p-8 max-w-[1600px] mx-auto">
            {/* ============ HERO CON IMAGEN — identidad clínica/profesional ============ */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="
                relative overflow-hidden
                rounded-2xl md:rounded-[28px]
                mb-6 md:mb-8
                bg-gradient-to-br from-[#0a2e2c] via-[#0c3b3d] to-[#083344]
                shadow-[0_20px_60px_-15px_rgba(8,51,68,0.5)]
              "
            >
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage:
                    "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />
              <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl" />

              <div className="relative z-10 grid lg:grid-cols-[1.3fr_1fr] gap-8 items-center p-6 sm:p-8 md:p-10">
                {/* TEXTO */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <p className="uppercase tracking-[3px] text-[10px] sm:text-xs font-semibold text-teal-300/90">
                      Portal médico profesional
                    </p>
                  </div>

                  <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-4xl xl:text-5xl leading-[1.1] mb-3 tracking-tight">
                    Buen día, Dr. Vega
                  </h1>
                  <p className="text-slate-300 max-w-lg text-sm sm:text-[15px] leading-relaxed mb-6">
                    Tienes 4 consultas programadas para hoy. Tu criterio clínico
                    y dedicación son la base de la confianza de tus pacientes.
                  </p>

                  {/* CREDENCIALES — refuerzan autoridad profesional */}
                  <div className="flex flex-wrap gap-3">
                    <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-teal-100">
                      <BadgeCheck size={15} className="text-teal-400" />
                      Col. Odontológico N.º 4521
                    </span>
                    <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-teal-100">
                      <GraduationCap size={15} className="text-teal-400" />
                      Esp. en Ortodoncia
                    </span>
                  </div>
                </div>

                {/* IMAGEN DEL PROFESIONAL — marco elegante con glow */}
                <div className="relative hidden lg:block">
                  <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-teal-400/20 to-cyan-500/10 blur-2xl" />
                  <div className="relative rounded-[28px] overflow-hidden border border-white/10 shadow-2xl aspect-[4/5]">
                    <img
                      src="/imagenes/Quienes-somos.jpeg"
                      alt="Dr. Carlos Vega"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a2e2c]/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-bold text-lg">Dr. Carlos Vega</p>
                      <p className="text-teal-200 text-xs">Ortodoncista · 10+ años de experiencia</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ESTADÍSTICAS */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={1}
              className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6"
            >
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${stat.color}15` }}
                    >
                      <Icon size={20} style={{ color: stat.color }} />
                    </div>
                    <p className="text-2xl font-black text-slate-800">{stat.value}</p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </motion.div>

            {/* AGENDA + PACIENTES RECIENTES */}
            <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
              <motion.div
                initial="hidden"
                animate="show"
                variants={fadeUp}
                custom={2}
                className="xl:col-span-2 bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-xl shadow-slate-200/50"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg sm:text-2xl font-black text-slate-800">Agenda de Hoy</h2>
                    <p className="text-xs sm:text-sm text-slate-500">4 consultas programadas</p>
                  </div>
                  <button className="text-sm font-semibold text-teal-600 hover:underline hidden sm:block">
                    Ver semana completa
                  </button>
                </div>

                <div className="space-y-3">
                  {agendaHoy.map((cita, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 p-3 sm:p-4 rounded-2xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-colors"
                    >
                      <div className="w-14 sm:w-16 text-center shrink-0">
                        <p className="text-sm sm:text-base font-bold text-slate-800">{cita.hora}</p>
                      </div>
                      <div className="w-px h-10 bg-slate-100" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 truncate">{cita.paciente}</p>
                        <p className="text-xs sm:text-sm text-slate-500 truncate">{cita.motivo}</p>
                      </div>
                      <span
                        className={`
                          text-[11px] font-semibold px-3 py-1.5 rounded-full shrink-0
                          ${cita.estado === "Confirmada"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-amber-50 text-amber-600"
                          }
                        `}
                      >
                        {cita.estado}
                      </span>
                      <button className="hidden sm:flex w-9 h-9 rounded-xl bg-slate-100 items-center justify-center shrink-0 hover:bg-teal-100">
                        <Video size={16} className="text-slate-600" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                animate="show"
                variants={fadeUp}
                custom={3}
                className="bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-xl shadow-slate-200/50"
              >
                <h2 className="text-lg sm:text-xl font-black text-slate-800 mb-5">
                  Pacientes Recientes
                </h2>
                <div className="space-y-3">
                  {pacientesRecientes.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-cyan-700 flex items-center justify-center text-white font-bold shrink-0">
                        {p.nombre.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{p.nombre}</p>
                        <p className="text-xs text-slate-500 truncate">{p.diagnostico}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 shrink-0" />
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                  Ver todos mis pacientes
                </button>
              </motion.div>
            </div>

            {/* ACCESOS RÁPIDOS */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={4}
              className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              {[
                { label: "Nueva Receta", icon: FileText, color: "#0d9488" },
                { label: "Ver Radiografías", icon: Stethoscope, color: "#8b5cf6" },
                { label: "Chat Pacientes", icon: Phone, color: "#0891b2" },
                { label: "Mi Horario", icon: Clock, color: "#f59e0b" },
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 flex flex-col items-center gap-3 hover:-translate-y-1 transition-transform"
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ backgroundColor: `${action.color}15` }}
                    >
                      <Icon size={22} style={{ color: action.color }} />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-slate-700 text-center">
                      {action.label}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </div>
        </section>
      </div>
    </main>
  );
}