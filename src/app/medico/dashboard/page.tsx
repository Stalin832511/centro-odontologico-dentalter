"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Users,
  CalendarClock,
  FileText,
  Clock,
  Phone,
  ChevronRight,
  Stethoscope,
  BadgeCheck,
  GraduationCap,
  CalendarX2,
} from "lucide-react";
import SidebarMedico from "@/components/medico/SidebarMedico";
import TopbarMedico from "@/components/medico/TopbarMedico";
import { supabase } from "@/lib/supabase";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

interface PerfilDoctor {
  id: number;
  nombres: string;
  apellidos: string;
  especialidad: string | null;
  colegio_numero: string | null;
  foto_url: string | null;
}

interface CitaHoy {
  id: number;
  hora: string;
  estado: string;
  pacientes: { id: number; nombres: string; apellidos: string } | null;
  servicios: { nombre: string } | null;
}

interface PacienteReciente {
  id: number;
  nombre: string;
  fecha: string;
  diagnostico: string | null;
}

function formatHora(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  const periodo = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${periodo}`;
}

function formatFechaRelativa(fechaISO: string) {
  const hoy = new Date().toISOString().split("T")[0];
  const ayer = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  if (fechaISO === hoy) return "Hoy";
  if (fechaISO === ayer) return "Ayer";
  const [y, m, d] = fechaISO.split("-");
  return `${d}/${m}/${y}`;
}

const DIAS_SEMANA = ["DOMINGO", "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO"];

export default function DashboardMedicoPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [doctor, setDoctor] = useState<PerfilDoctor | null>(null);
  const [citasHoy, setCitasHoy] = useState<CitaHoy[] | null>(null);
  const [citasSemana, setCitasSemana] = useState<number>(0);
  const [recetasEmitidas, setRecetasEmitidas] = useState<number>(0);
  const [horasDisponibles, setHorasDisponibles] = useState<number>(0);
  const [pacientesRecientes, setPacientesRecientes] = useState<PacienteReciente[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: doctorData, error: doctorError } = await supabase
        .from("doctores")
        .select("id, nombres, apellidos, especialidad, colegio_numero, foto_url")
        .eq("id_usuario", user.id)
        .single();

      if (doctorError || !doctorData) {
        if (activo) setError("No encontramos tu perfil de doctor. Contacta a administración.");
        return;
      }

      if (!activo) return;
      setDoctor(doctorData);

      const hoy = new Date();
      const hoyISO = hoy.toISOString().split("T")[0];

      const inicioSemana = new Date(hoy);
      inicioSemana.setDate(hoy.getDate() - hoy.getDay());
      const finSemana = new Date(inicioSemana);
      finSemana.setDate(inicioSemana.getDate() + 6);

      const { data: citasHoyData } = await supabase
        .from("citas")
        .select("id, hora, estado, pacientes ( id, nombres, apellidos ), servicios ( nombre )")
        .eq("id_doctor", doctorData.id)
        .eq("fecha", hoyISO)
        .neq("estado", "CANCELADA")
        .order("hora", { ascending: true });

      if (activo) setCitasHoy((citasHoyData as unknown as CitaHoy[]) ?? []);

      const { count: citasSemanaCount } = await supabase
        .from("citas")
        .select("*", { count: "exact", head: true })
        .eq("id_doctor", doctorData.id)
        .gte("fecha", inicioSemana.toISOString().split("T")[0])
        .lte("fecha", finSemana.toISOString().split("T")[0])
        .neq("estado", "CANCELADA");

      if (activo) setCitasSemana(citasSemanaCount ?? 0);

      const { data: evoluciones } = await supabase
        .from("evolucion_clinica")
        .select("id")
        .eq("id_doctor", doctorData.id);

      const idsEvoluciones = (evoluciones ?? []).map((e) => e.id);

      if (idsEvoluciones.length > 0) {
        const { count: recetasCount } = await supabase
          .from("recetas_medicas")
          .select("*", { count: "exact", head: true })
          .in("id_evolucion", idsEvoluciones);
        if (activo) setRecetasEmitidas(recetasCount ?? 0);
      }

      const diaSemana = DIAS_SEMANA[hoy.getDay()];
      const { data: horarioHoy } = await supabase
        .from("horarios_doctores")
        .select("hora_inicio, hora_fin")
        .eq("id_doctor", doctorData.id)
        .eq("dia_semana", diaSemana)
        .maybeSingle();

      if (horarioHoy && activo) {
        const [hi, mi] = horarioHoy.hora_inicio.split(":").map(Number);
        const [hf, mf] = horarioHoy.hora_fin.split(":").map(Number);
        const totalHoras = hf + mf / 60 - (hi + mi / 60);
        const ocupadas = (citasHoyData ?? []).length;
        setHorasDisponibles(Math.max(0, Math.round(totalHoras - ocupadas)));
      }

      const { data: recientesData } = await supabase
        .from("evolucion_clinica")
        .select(
          `fecha, diagnostico,
           historia_clinica ( pacientes ( id, nombres, apellidos ) )`
        )
        .eq("id_doctor", doctorData.id)
        .order("fecha", { ascending: false })
        .limit(3);

      if (activo) {
        setPacientesRecientes(
          ((recientesData as any[]) ?? []).map((r, i) => ({
            id: r.historia_clinica?.pacientes?.id ?? i,
            nombre: r.historia_clinica?.pacientes
              ? `${r.historia_clinica.pacientes.nombres} ${r.historia_clinica.pacientes.apellidos}`
              : "Paciente",
            fecha: r.fecha,
            diagnostico: r.diagnostico,
          }))
        );
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  const stats = [
    { label: "Pacientes hoy", value: citasHoy === null ? "—" : String(citasHoy.length), icon: Users, color: "#0d9488" },
    { label: "Consultas semana", value: String(citasSemana), icon: CalendarClock, color: "#8b5cf6" },
    { label: "Recetas emitidas", value: String(recetasEmitidas), icon: FileText, color: "#0891b2" },
    { label: "Horas disponibles hoy", value: `${horasDisponibles}h`, icon: Clock, color: "#f59e0b" },
  ];

  const primerNombre = doctor?.nombres?.split(" ")[0] ?? "";

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="flex">
        <SidebarMedico isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <section className="flex-1 min-w-0">
          <TopbarMedico onMenuClick={() => setSidebarOpen(true)} />

          <div className="p-4 md:p-6 xl:p-8 max-w-[1600px] mx-auto">
            {error && (
              <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5 text-sm text-rose-700 font-medium">
                {error}
              </div>
            )}

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
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                    <p className="uppercase tracking-[3px] text-[10px] sm:text-xs font-semibold text-teal-300/90">
                      Portal médico profesional
                    </p>
                  </div>

                  <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-4xl xl:text-5xl leading-[1.1] mb-3 tracking-tight">
                    {doctor ? `Buen día, Dr(a). ${primerNombre}` : "Buen día"}
                  </h1>
                  <p className="text-slate-300 max-w-lg text-sm sm:text-[15px] leading-relaxed mb-6">
                    {citasHoy === null
                      ? "Cargando tu agenda de hoy…"
                      : citasHoy.length > 0
                      ? `Tienes ${citasHoy.length} consulta${citasHoy.length === 1 ? "" : "s"} programada${citasHoy.length === 1 ? "" : "s"} para hoy. Tu criterio clínico y dedicación son la base de la confianza de tus pacientes.`
                      : "No tienes consultas programadas para hoy."}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {doctor?.colegio_numero && (
                      <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-teal-100">
                        <BadgeCheck size={15} className="text-teal-400" />
                        Col. Odontológico N.º {doctor.colegio_numero}
                      </span>
                    )}
                    {doctor?.especialidad && (
                      <span className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-teal-100">
                        <GraduationCap size={15} className="text-teal-400" />
                        {doctor.especialidad}
                      </span>
                    )}
                  </div>
                </div>

                <div className="relative hidden lg:block">
                  <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-teal-400/20 to-cyan-500/10 blur-2xl" />
                  <div className="relative rounded-[28px] overflow-hidden border border-white/10 shadow-2xl aspect-[4/5]">
                    <img
                      src={doctor?.foto_url || "/imagenes/Quienes-somos.jpeg"}
                      alt={doctor ? `${doctor.nombres} ${doctor.apellidos}` : "Doctor"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a2e2c]/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <p className="text-white font-bold text-lg">
                        {doctor ? `${doctor.nombres} ${doctor.apellidos}` : "—"}
                      </p>
                      <p className="text-teal-200 text-xs">{doctor?.especialidad ?? "Odontología General"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

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
                    <p className="text-xs sm:text-sm text-slate-500">
                      {citasHoy === null
                        ? "Cargando…"
                        : `${citasHoy.length} consulta${citasHoy.length === 1 ? "" : "s"} programada${citasHoy.length === 1 ? "" : "s"}`}
                    </p>
                  </div>
                </div>

                {citasHoy === null ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-[76px] rounded-2xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : citasHoy.length === 0 ? (
                  <div className="flex flex-col items-center text-center gap-3 py-10">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <CalendarX2 size={20} className="text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600">No tienes citas hoy</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {citasHoy.map((cita) => (
                      <div
                        key={cita.id}
                        onClick={() => {
                          if (cita.pacientes) router.push(`/medico/pacientes/${cita.pacientes.id}/historia`);
                        }}
                        className={`flex items-center gap-4 p-3 sm:p-4 rounded-2xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-colors ${cita.pacientes ? "cursor-pointer" : ""}`}
                      >
                        <div className="w-14 sm:w-16 text-center shrink-0">
                          <p className="text-sm sm:text-base font-bold text-slate-800">{formatHora(cita.hora)}</p>
                        </div>
                        <div className="w-px h-10 bg-slate-100" />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-800 truncate">
                            {cita.pacientes ? `${cita.pacientes.nombres} ${cita.pacientes.apellidos}` : "Paciente"}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500 truncate">
                            {cita.servicios?.nombre ?? "Consulta"}
                          </p>
                        </div>
                        <span
                          className={`
                            text-[11px] font-semibold px-3 py-1.5 rounded-full shrink-0
                            ${cita.estado === "CONFIRMADA"
                              ? "bg-emerald-50 text-emerald-600"
                              : cita.estado === "ATENDIDA"
                              ? "bg-slate-100 text-slate-500"
                              : "bg-amber-50 text-amber-600"
                            }
                          `}
                        >
                          {cita.estado}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
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

                {pacientesRecientes === null ? (
                  <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="h-[60px] rounded-2xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : pacientesRecientes.length === 0 ? (
                  <p className="text-sm text-slate-400 text-center py-6">
                    Aún no has registrado consultas.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pacientesRecientes.map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => router.push("/medico/pacientes")}
                      >
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-teal-500 to-cyan-700 flex items-center justify-center text-white font-bold shrink-0">
                          {p.nombre.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">{p.nombre}</p>
                          <p className="text-xs text-slate-500 truncate">
                            {p.diagnostico ?? "Sin diagnóstico registrado"} · {formatFechaRelativa(p.fecha)}
                          </p>
                        </div>
                        <ChevronRight size={16} className="text-slate-300 shrink-0" />
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => router.push("/medico/pacientes")}
                  className="w-full mt-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Ver todos mis pacientes
                </button>
              </motion.div>
            </div>

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