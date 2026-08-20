"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarPlus,
  FileText,
  ScanLine,
  MessageSquareText,
  Pill,
  Clock,
  MapPin,
  Download,
  ChevronRight,
  HeartHandshake,
  CalendarX2,
  ClipboardList,
  AlertCircle,
} from "lucide-react";
import SidebarPaciente from "@/components/paciente/SidebarPaciente";
import TopbarPaciente from "@/components/paciente/TopbarPaciente";
import { supabase } from "@/lib/supabase";

// ============================================================
// Animaciones
// ============================================================
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

// ============================================================
// Tipos (alineados al esquema real de Supabase)
// ============================================================
interface Paciente {
  id: number;
  nombres: string;
  apellidos: string;
}

interface CitaProxima {
  id: number;
  fecha: string;
  hora: string;
  estado: "PENDIENTE" | "CONFIRMADA" | "CANCELADA" | "ATENDIDA";
  observacion: string | null;
  doctores: { nombres: string; apellidos: string } | null;
  servicios: { nombre: string } | null;
}

interface RecetaActiva {
  id: number;
  medicamento: string;
  dosis: string | null;
  frecuencia: string | null;
  duracion: string | null;
  evolucion_clinica: {
    fecha: string;
    doctores: { nombres: string; apellidos: string } | null;
  } | null;
}

interface EvolucionHistorial {
  id: number;
  fecha: string;
  tratamiento: string | null;
  diagnostico: string | null;
  doctores: { nombres: string; apellidos: string } | null;
}

// ============================================================
// Utilidades de formato
// ============================================================
const MESES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

function formatFechaCorta(fechaISO: string) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return { dia: String(d).padStart(2, "0"), mes: MESES[m - 1] };
}

function formatFechaLarga(fechaISO: string) {
  const [y, m, d] = fechaISO.split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${MESES[m - 1]} ${y}`;
}

function formatHora(horaISO: string) {
  const [h, m] = horaISO.split(":").map(Number);
  const periodo = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${periodo}`;
}

function primerNombre(nombreCompleto: string | undefined) {
  if (!nombreCompleto) return "";
  const limpio = nombreCompleto.trim().split(" ")[0];
  return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase();
}

const ESTADO_ESTILOS: Record<string, { bg: string; text: string; label: string }> = {
  PENDIENTE: { bg: "bg-amber-50", text: "text-amber-700", label: "Pendiente de confirmar" },
  CONFIRMADA: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Confirmada" },
  ATENDIDA: { bg: "bg-slate-100", text: "text-slate-600", label: "Atendida" },
  CANCELADA: { bg: "bg-rose-50", text: "text-rose-700", label: "Cancelada" },
};

// ============================================================
// Skeletons — evitan el "salto" de layout mientras carga
// ============================================================
function SkeletonLine({ w = "w-full" }: { w?: string }) {
  return <div className={`h-3.5 rounded-full bg-slate-200/70 animate-pulse ${w}`} />;
}

function SkeletonCitaCard() {
  return (
    <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start sm:items-center p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100">
      <div className="w-20 h-20 rounded-2xl bg-slate-200/70 animate-pulse shrink-0" />
      <div className="flex-1 min-w-0 space-y-2.5 w-full">
        <SkeletonLine w="w-1/2" />
        <SkeletonLine w="w-1/3" />
        <SkeletonLine w="w-2/3" />
      </div>
    </div>
  );
}

// ============================================================
// Estado vacío reutilizable — versión con más presencia visual
// ============================================================
function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  color = "#0ea5e9",
}: {
  icon: typeof CalendarX2;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  color?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-12 px-4">
      {/* Ícono con badge de gradiente + glow de fondo, en vez de un
          ícono chico flotando solo en espacio en blanco */}
      <div className="relative">
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-30"
          style={{ backgroundColor: color }}
        />
        <div
          className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
          style={{
            background: `linear-gradient(135deg, ${color}20, ${color}08)`,
          }}
        >
          <Icon size={26} style={{ color }} />
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-bold text-slate-700">{title}</p>
        <p className="text-xs text-slate-400 max-w-[260px] leading-relaxed">
          {description}
        </p>
      </div>

      {actionLabel && (
        <button
          onClick={onAction}
          className="
            mt-1 inline-flex items-center gap-1.5
            px-4 py-2.5 rounded-xl
            text-xs font-bold text-white
            shadow-md transition-transform hover:scale-105
          "
          style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}
        >
          {actionLabel}
          <ChevronRight size={14} />
        </button>
      )}
    </div>
  );
}

// ============================================================
// Estado vacío especial para historial — mini timeline fantasma,
// comunica "aquí va una secuencia de eventos" incluso sin datos
// ============================================================
function EmptyTimeline({ description }: { description: string }) {
  return (
    <div className="py-6 px-2">
      <div className="relative pl-6">
        <div className="absolute left-[7px] top-1 bottom-1 w-px border-l-2 border-dashed border-slate-200" />

        {[1, 2, 3].map((i) => (
          <div key={i} className="relative flex items-center gap-3 py-2.5">
            <div className="absolute -left-6 w-3.5 h-3.5 rounded-full bg-slate-100 border-2 border-white ring-1 ring-slate-200" />
            <div className="flex-1 space-y-1.5">
              <div
                className="h-2.5 rounded-full bg-slate-100"
                style={{ width: `${70 - i * 12}%` }}
              />
              <div className="h-2 rounded-full bg-slate-100" style={{ width: "35%" }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 text-center mt-2 max-w-[240px] mx-auto leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// ============================================================
// Componente principal
// ============================================================
export default function DashboardPacientePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [proximaCita, setProximaCita] = useState<CitaProxima | null>(null);
  const [recetas, setRecetas] = useState<RecetaActiva[]>([]);
  const [historial, setHistorial] = useState<EvolucionHistorial[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;

    async function cargarDashboard() {
      setLoading(true);
      setError(null);

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          throw new Error("No se pudo verificar tu sesión. Vuelve a iniciar sesión.");
        }

        const { data: pacienteData, error: pacienteError } = await supabase
          .from("pacientes")
          .select("id, nombres, apellidos")
          .eq("id_usuario", user.id)
          .single();

        if (pacienteError || !pacienteData) {
          throw new Error("No encontramos tu ficha de paciente. Contacta a recepción.");
        }

        if (!activo) return;
        setPaciente(pacienteData);

        const hoyISO = new Date().toISOString().split("T")[0];

        const { data: citaData } = await supabase
          .from("citas")
          .select(
            `id, fecha, hora, estado, observacion,
             doctores ( nombres, apellidos ),
             servicios ( nombre )`
          )
          .eq("id_paciente", pacienteData.id)
          .neq("estado", "CANCELADA")
          .gte("fecha", hoyISO)
          .order("fecha", { ascending: true })
          .order("hora", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (activo) setProximaCita((citaData as unknown as CitaProxima) ?? null);

        const { data: historiaData } = await supabase
          .from("historia_clinica")
          .select("id")
          .eq("id_paciente", pacienteData.id)
          .maybeSingle();

        if (historiaData?.id) {
          const { data: evoluciones } = await supabase
            .from("evolucion_clinica")
            .select("id, fecha, tratamiento, diagnostico, doctores ( nombres, apellidos )")
            .eq("id_historia", historiaData.id)
            .order("fecha", { ascending: false });

          if (activo) {
            setHistorial(((evoluciones as unknown as EvolucionHistorial[]) ?? []).slice(0, 3));
          }

          const idsEvoluciones = (evoluciones ?? []).map((e) => e.id);

          if (idsEvoluciones.length > 0) {
            const { data: recetasData } = await supabase
              .from("recetas_medicas")
              .select(
                `id, medicamento, dosis, frecuencia, duracion,
                 evolucion_clinica ( fecha, doctores ( nombres, apellidos ) )`
              )
              .eq("estado", "ACTIVA")
              .in("id_evolucion", idsEvoluciones);

            if (activo) setRecetas((recetasData as unknown as RecetaActiva[]) ?? []);
          }
        }
      } catch (err) {
        if (activo) {
          setError(err instanceof Error ? err.message : "Ocurrió un error al cargar tu información.");
        }
      } finally {
        if (activo) setLoading(false);
      }
    }

    cargarDashboard();
    return () => {
      activo = false;
    };
  }, []);

  const nombrePila = primerNombre(paciente?.nombres);

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="flex">
        <SidebarPaciente isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <section className="flex-1 min-w-0">
          <TopbarPaciente onMenuClick={() => setSidebarOpen(true)} />

          <div className="p-4 md:p-6 xl:p-8 max-w-[1600px] mx-auto">
            {/* ============ BANNER DE ERROR GLOBAL ============ */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5"
                >
                  <AlertCircle size={18} className="text-rose-500 shrink-0" />
                  <p className="text-sm text-rose-700 font-medium">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ============ HERO ============ */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="
                relative overflow-hidden
                rounded-2xl md:rounded-[28px]
                mb-6 md:mb-8
                bg-gradient-to-br from-[#1e293b] via-[#1e3a4a] to-[#0c4a5e]
                shadow-[0_20px_60px_-15px_rgba(12,74,94,0.45)]
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
              <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-sky-400/10 blur-3xl" />

              <div className="relative z-10 grid lg:grid-cols-[1.3fr_1fr] gap-8 items-center p-6 sm:p-8 md:p-10">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                    <p className="uppercase tracking-[3px] text-[10px] sm:text-xs font-semibold text-sky-300/90">
                      Tu bienestar, nuestra prioridad
                    </p>
                  </div>

                  {loading ? (
                    <div className="h-10 sm:h-12 w-64 max-w-full rounded-xl bg-white/10 animate-pulse mb-3" />
                  ) : (
                    <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-4xl xl:text-5xl leading-[1.1] mb-3 tracking-tight">
                      Hola, {nombrePila || "de nuevo"} 👋
                    </h1>
                  )}

                  <p className="text-slate-300 max-w-lg text-sm sm:text-[15px] leading-relaxed mb-6">
                    Aquí puedes ver tu próxima cita, tu receta médica vigente
                    y todo tu historial, cuidado por profesionales en quienes confías.
                  </p>

                  <button
                    className="
                      inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl
                      text-white font-semibold text-sm
                      shadow-lg shadow-sky-950/30
                      transition-transform hover:scale-[1.03]
                    "
                    style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }}
                  >
                    <CalendarPlus size={18} />
                    Agendar nueva cita
                  </button>
                </div>

                <div className="relative hidden lg:block">
                  <div className="absolute -inset-4 rounded-[36px] bg-gradient-to-br from-sky-400/20 to-cyan-500/10 blur-2xl" />
                  <div className="relative rounded-[28px] overflow-hidden border border-white/10 shadow-2xl aspect-[4/5]">
                    <img
                      src="/imagenes/Quienes-somos.jpeg"
                      alt="Atención al paciente"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c4a5e]/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2">
                      <HeartHandshake size={18} className="text-sky-200" />
                      <p className="text-sky-100 text-xs sm:text-sm">
                        Más de 1,200 pacientes confían en nosotros
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ============ PRÓXIMA CITA + RECETA ============ */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* --- CITA + HISTORIAL --- */}
              <motion.div
                initial="hidden"
                animate="show"
                variants={fadeUp}
                custom={1}
                className="lg:col-span-2 bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-xl shadow-slate-200/50"
              >
                <h2 className="text-lg sm:text-2xl font-black text-slate-800 mb-5">
                  Tu Próxima Cita
                </h2>

                {loading ? (
                  <SkeletonCitaCard />
                ) : proximaCita ? (
                  <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start sm:items-center p-4 sm:p-5 rounded-2xl bg-sky-50/50 border border-sky-100">
                    <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-white shadow-md shrink-0">
                      <span className="text-2xl font-black text-sky-600">
                        {formatFechaCorta(proximaCita.fecha).dia}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        {formatFechaCorta(proximaCita.fecha).mes}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-bold text-slate-800 text-lg">
                          {proximaCita.servicios?.nombre ?? "Consulta odontológica"}
                        </p>
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                            ESTADO_ESTILOS[proximaCita.estado]?.bg
                          } ${ESTADO_ESTILOS[proximaCita.estado]?.text}`}
                        >
                          {ESTADO_ESTILOS[proximaCita.estado]?.label ?? proximaCita.estado}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mb-2">
                        con Dr(a). {proximaCita.doctores?.nombres} {proximaCita.doctores?.apellidos}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Clock size={15} /> {formatHora(proximaCita.hora)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={15} /> Clínica FajardoDental
                        </span>
                      </div>
                    </div>

                    <button className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0">
                      Reagendar
                    </button>
                  </div>
                ) : (
                  <EmptyState
                    icon={CalendarX2}
                    title="No tienes citas próximas"
                    description="Cuando agendes una consulta, aparecerá aquí con todos los detalles."
                    actionLabel="Agendar una cita"
                    onAction={() => (window.location.href = "/agendar")}
                    color="#0ea5e9"
                  />
                )}

                <div className="mt-6">
                  <h3 className="text-sm font-bold text-slate-700 mb-3">Historial reciente</h3>

                  {loading ? (
                    <div className="space-y-3">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="flex items-center gap-3 p-3">
                          <div className="w-2 h-2 rounded-full bg-slate-200 shrink-0" />
                          <div className="flex-1 space-y-2">
                            <SkeletonLine w="w-1/3" />
                            <SkeletonLine w="w-1/4" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : historial.length > 0 ? (
                    <div className="space-y-2">
                      {historial.map((h) => (
                        <div
                          key={h.id}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <div className="w-2 h-2 rounded-full bg-sky-400 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">
                              {h.tratamiento ?? h.diagnostico ?? "Consulta registrada"}
                            </p>
                            <p className="text-xs text-slate-400">
                              {formatFechaLarga(h.fecha)}
                              {h.doctores && ` · Dr(a). ${h.doctores.nombres} ${h.doctores.apellidos}`}
                            </p>
                          </div>
                          <ChevronRight size={16} className="text-slate-300 shrink-0" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyTimeline description="Tus consultas y tratamientos anteriores aparecerán aquí, organizados por fecha." />
                  )}
                </div>
              </motion.div>

              {/* --- RECETA --- */}
              <motion.div
                initial="hidden"
                animate="show"
                variants={fadeUp}
                custom={2}
                className="bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-xl shadow-slate-200/50"
              >
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg sm:text-xl font-black text-slate-800">Mi Receta Actual</h2>
                  {recetas.length > 0 && (
                    <button className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-sky-100 transition-colors">
                      <Download size={16} className="text-slate-600" />
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="space-y-3">
                    {[0, 1].map((i) => (
                      <div key={i} className="flex items-start gap-3 p-4 rounded-2xl border border-slate-100">
                        <div className="w-10 h-10 rounded-xl bg-slate-200/70 animate-pulse shrink-0" />
                        <div className="flex-1 space-y-2">
                          <SkeletonLine w="w-3/4" />
                          <SkeletonLine w="w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recetas.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {recetas.map((med) => (
                        <div
                          key={med.id}
                          className="flex items-start gap-3 p-4 rounded-2xl border border-slate-100 hover:border-sky-100 hover:bg-sky-50/30 transition-colors"
                        >
                          <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                            <Pill size={18} className="text-sky-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800 truncate">
                              {med.medicamento}
                              {med.dosis ? ` · ${med.dosis}` : ""}
                            </p>
                            <p className="text-xs text-slate-500">
                              {med.frecuencia ?? "Según indicación médica"}
                            </p>
                            {med.duracion && (
                              <p className="text-[11px] font-semibold text-sky-600 mt-1">
                                {med.duracion}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <p className="text-xs text-slate-400 mt-4">
                      Prescrito por Dr(a).{" "}
                      {recetas[0]?.evolucion_clinica?.doctores?.nombres}{" "}
                      {recetas[0]?.evolucion_clinica?.doctores?.apellidos}
                      {recetas[0]?.evolucion_clinica?.fecha &&
                        ` · ${formatFechaLarga(recetas[0].evolucion_clinica.fecha)}`}
                    </p>
                  </>
                ) : (
                  <EmptyState
                    icon={Pill}
                    title="Sin receta activa"
                    description="Cuando tu doctor te recete un medicamento, lo verás aquí."
                    color="#0ea5e9"
                  />
                )}
              </motion.div>
            </div>

            {/* ============ ACCESOS RÁPIDOS ============ */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={3}
              className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {[
                {
                  label: "Mi Receta",
                  description: recetas.length > 0
                    ? `${recetas.length} medicamento${recetas.length > 1 ? "s" : ""} activo${recetas.length > 1 ? "s" : ""}`
                    : "Sin receta activa",
                  icon: Pill,
                  color: "#0ea5e9",
                  badge: recetas.length > 0 ? recetas.length : null,
                },
                {
                  label: "Radiografías",
                  description: "Tus imágenes clínicas",
                  icon: ScanLine,
                  color: "#8b5cf6",
                  badge: null,
                },
                {
                  label: "Chat Doctor",
                  description: "Habla con tu especialista",
                  icon: MessageSquareText,
                  color: "#10b981",
                  badge: null,
                },
                {
                  label: "Agendar Cita",
                  description: "Reserva tu próxima visita",
                  icon: CalendarPlus,
                  color: "#f59e0b",
                  badge: null,
                },
              ].map((action, i) => {
                const Icon = action.icon;
                return (
                  <button
                    key={i}
                    className="
                      group relative bg-white rounded-2xl p-5
                      shadow-lg shadow-slate-200/50
                      border border-slate-100
                      flex flex-col items-start gap-3
                      text-left
                      hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60
                      transition-all duration-200
                    "
                  >
                    {action.badge !== null && (
                      <span
                        className="absolute top-4 right-4 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold text-white flex items-center justify-center"
                        style={{ backgroundColor: action.color }}
                      >
                        {action.badge}
                      </span>
                    )}

                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
                      style={{
                        background: `linear-gradient(135deg, ${action.color}25, ${action.color}10)`,
                      }}
                    >
                      <Icon size={22} style={{ color: action.color }} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-slate-800">{action.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{action.description}</p>
                    </div>

                    <ChevronRight
                      size={16}
                      className="
                        absolute bottom-4 right-4 text-slate-300
                        opacity-0 -translate-x-1
                        group-hover:opacity-100 group-hover:translate-x-0
                        transition-all duration-200
                      "
                    />
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