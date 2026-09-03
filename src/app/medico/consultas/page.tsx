"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SidebarMedico from "@/components/medico/SidebarMedico";
import TopbarMedico from "@/components/medico/TopbarMedico";
import {
  obtenerIdDoctorActual,
  obtenerCitasSemana,
  CitaSemana,
} from "@/services/medico";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  User,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  CalendarX2,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] },
  }),
};

const DIAS_LABEL = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

const ESTADOS = ["PENDIENTE", "CONFIRMADA", "ATENDIDA", "CANCELADA"] as const;
const ESTADO_ESTILOS: Record<string, string> = {
  PENDIENTE: "bg-amber-50 text-amber-700",
  CONFIRMADA: "bg-emerald-50 text-emerald-700",
  ATENDIDA: "bg-slate-100 text-slate-600",
  CANCELADA: "bg-rose-50 text-rose-700",
};

function formatHora(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  const periodo = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${periodo}`;
}

/** Lunes de la semana que contiene `fecha`, desplazada por `offsetSemanas` semanas. */
function calcularLunes(offsetSemanas: number): Date {
  const hoy = new Date();
  const diaSemana = (hoy.getDay() + 6) % 7; // 0 = lunes ... 6 = domingo
  const lunesActual = new Date(hoy);
  lunesActual.setDate(hoy.getDate() - diaSemana + offsetSemanas * 7);
  lunesActual.setHours(0, 0, 0, 0);
  return lunesActual;
}

function aISO(fecha: Date): string {
  return fecha.toISOString().split("T")[0];
}

export default function MisConsultasPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [offsetSemanas, setOffsetSemanas] = useState(0);
  const [citas, setCitas] = useState<CitaSemana[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filtrosAbiertos, setFiltrosAbiertos] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("");

  const diasDeLaSemana = useMemo(() => {
    const lunes = calcularLunes(offsetSemanas);
    return Array.from({ length: 7 }, (_, i) => {
      const dia = new Date(lunes);
      dia.setDate(lunes.getDate() + i);
      return dia;
    });
  }, [offsetSemanas]);

  const hoyISO = aISO(new Date());

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const idDoctor = await obtenerIdDoctorActual();
      const inicio = aISO(diasDeLaSemana[0]);
      const fin = aISO(diasDeLaSemana[6]);
      const data = await obtenerCitasSemana(idDoctor, inicio, fin);
      setCitas(data);
    } catch {
      setError("No pudimos cargar tu agenda de la semana.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offsetSemanas]);

  const citasFiltradas = useMemo(() => {
    if (!filtroEstado) return citas;
    return citas.filter((c) => c.estado === filtroEstado);
  }, [citas, filtroEstado]);

  const citasPorDia = useMemo(() => {
    const mapa = new Map<string, CitaSemana[]>();
    for (const dia of diasDeLaSemana) mapa.set(aISO(dia), []);
    for (const cita of citasFiltradas) {
      const lista = mapa.get(cita.fecha);
      if (lista) lista.push(cita);
    }
    return mapa;
  }, [citasFiltradas, diasDeLaSemana]);

  const rangoTexto = useMemo(() => {
    const inicio = diasDeLaSemana[0];
    const fin = diasDeLaSemana[6];
    const mismoMes = inicio.getMonth() === fin.getMonth();
    if (mismoMes) {
      return `${inicio.getDate()} – ${fin.getDate()} de ${MESES[fin.getMonth()]} ${fin.getFullYear()}`;
    }
    return `${inicio.getDate()} de ${MESES[inicio.getMonth()]} – ${fin.getDate()} de ${MESES[fin.getMonth()]} ${fin.getFullYear()}`;
  }, [diasDeLaSemana]);

  const totalCitas = citasFiltradas.length;

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="flex">
        <SidebarMedico isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <section className="flex-1 min-w-0">
          <TopbarMedico onMenuClick={() => setSidebarOpen(true)} />

          <div className="p-4 md:p-6 xl:p-8 max-w-[1200px] mx-auto">
            {/* HERO */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="relative overflow-hidden rounded-2xl md:rounded-[28px] p-5 sm:p-8 md:p-10 mb-6 md:mb-8 bg-gradient-to-br from-[#0a2e2c] via-[#0c3b3d] to-[#083344] shadow-[0_20px_60px_-15px_rgba(8,51,68,0.5)]"
            >
              <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-teal-400/10 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  <p className="uppercase tracking-[3px] text-[10px] sm:text-xs font-semibold text-teal-300/90">
                    Agenda semanal
                  </p>
                </div>
                <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-[42px] leading-[1.1] mb-3 tracking-tight">
                  Mis Consultas
                </h1>
                <p className="text-slate-300 max-w-xl text-sm sm:text-[15px] leading-relaxed">
                  {cargando
                    ? "Cargando tu semana…"
                    : `${totalCitas} consulta${totalCitas === 1 ? "" : "s"} esta semana.`}
                </p>
              </div>
            </motion.div>

            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5">
                <AlertCircle size={18} className="text-rose-500 shrink-0" />
                <p className="text-sm text-rose-700 font-medium">{error}</p>
              </div>
            )}

            {/* NAVEGACIÓN DE SEMANA + FILTRO */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={1}
              className="bg-white rounded-2xl p-4 shadow-lg shadow-slate-200/50 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOffsetSemanas((o) => o - 1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                  title="Semana anterior"
                >
                  <ChevronLeft size={18} className="text-slate-600" />
                </button>

                <div className="flex items-center gap-2 px-3">
                  <CalendarDays size={16} className="text-teal-600 shrink-0" />
                  <span className="text-sm font-bold text-slate-800 capitalize">{rangoTexto}</span>
                </div>

                <button
                  onClick={() => setOffsetSemanas((o) => o + 1)}
                  className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                  title="Semana siguiente"
                >
                  <ChevronRight size={18} className="text-slate-600" />
                </button>

                {offsetSemanas !== 0 && (
                  <button
                    onClick={() => setOffsetSemanas(0)}
                    className="ml-1 text-xs font-semibold text-teal-600 hover:text-teal-700 px-2"
                  >
                    Hoy
                  </button>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setFiltrosAbiertos((v) => !v)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    filtroEstado ? "bg-teal-100 text-teal-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <SlidersHorizontal size={14} />
                  {filtroEstado ? `Estado: ${filtroEstado}` : "Filtrar por estado"}
                </button>

                {filtrosAbiertos && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20">
                    <button
                      onClick={() => {
                        setFiltroEstado("");
                        setFiltrosAbiertos(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Todos los estados
                    </button>
                    {ESTADOS.map((e) => (
                      <button
                        key={e}
                        onClick={() => {
                          setFiltroEstado(e);
                          setFiltrosAbiertos(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>

            {/* GRILLA POR DÍA */}
            {cargando ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-2xl bg-white shadow-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {diasDeLaSemana.map((dia, i) => {
                  const iso = aISO(dia);
                  const citasDelDia = citasPorDia.get(iso) ?? [];
                  const esHoy = iso === hoyISO;

                  return (
                    <motion.div
                      key={iso}
                      initial="hidden"
                      animate="show"
                      variants={fadeUp}
                      custom={i + 2}
                      className={`bg-white rounded-2xl p-4 shadow-lg shadow-slate-200/50 border-2 ${
                        esHoy ? "border-teal-400" : "border-transparent"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className={`text-sm font-black ${esHoy ? "text-teal-600" : "text-slate-800"}`}>
                            {DIAS_LABEL[i]}
                          </p>
                          <p className="text-xs text-slate-400">
                            {dia.getDate()} de {MESES[dia.getMonth()]}
                          </p>
                        </div>
                        {esHoy && (
                          <span className="text-[9px] font-bold uppercase bg-teal-50 text-teal-600 px-2 py-1 rounded-full">
                            Hoy
                          </span>
                        )}
                      </div>

                      {citasDelDia.length === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center py-8 gap-2">
                          <CalendarX2 size={18} className="text-slate-200" />
                          <p className="text-[11px] text-slate-300 font-medium">Sin citas este día</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {citasDelDia.map((cita) => (
                            <button
                              key={cita.id}
                              onClick={() => {
                                if (cita.pacientes) {
                                  router.push(`/medico/pacientes/${cita.pacientes.id}/historia`);
                                }
                              }}
                              className="w-full text-left p-3 rounded-xl border border-slate-100 hover:border-teal-200 hover:bg-teal-50/30 transition-colors"
                            >
                              <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mb-1">
                                <Clock size={11} />
                                {formatHora(cita.hora)}
                              </div>
                              <div className="flex items-center gap-1.5 mb-1.5">
                                <User size={12} className="text-slate-400 shrink-0" />
                                <p className="text-xs font-semibold text-slate-700 truncate">
                                  {cita.pacientes
                                    ? `${cita.pacientes.nombres} ${cita.pacientes.apellidos}`
                                    : "Paciente"}
                                </p>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate mb-1.5">
                                {cita.servicios?.nombre ?? "Consulta"}
                              </p>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                  ESTADO_ESTILOS[cita.estado] ?? "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {cita.estado}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}