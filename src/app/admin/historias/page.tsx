"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { supabase } from "@/lib/supabase";
import {
  Search,
  FolderHeart,
  X,
  Printer,
  Loader2,
  AlertCircle,
  Stethoscope,
  Pill,
  Calendar,
  ChevronRight,
  FileText,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

interface HistoriaResumen {
  id: number;
  codigo: string;
  fecha_apertura: string;
  estado: string;
  id_paciente: number;
  paciente_nombre: string;
  paciente_cedula: string;
  total_evoluciones: number;
}

interface Evolucion {
  id: number;
  fecha: string;
  diagnostico: string | null;
  tratamiento: string | null;
  observaciones: string | null;
  doctor_nombre: string;
  recetas: { medicamento: string; dosis: string | null; frecuencia: string | null; duracion: string | null }[];
}

function formatFecha(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function HistoriasClinicasContent() {
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [historias, setHistorias] = useState<HistoriaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const [historiaAbierta, setHistoriaAbierta] = useState<HistoriaResumen | null>(null);
  const [evoluciones, setEvoluciones] = useState<Evolucion[] | null>(null);

  useEffect(() => {
    cargarHistorias();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si llegamos desde un buscador de otra página con
  // ?codigo=HC-..., abrimos esa historia automáticamente en
  // cuanto termine de cargar el listado.
  useEffect(() => {
    const codigo = searchParams.get("codigo");
    if (!codigo || loading || historias.length === 0) return;

    const encontrada = historias.find(
      (h) => h.codigo.toLowerCase() === codigo.toLowerCase()
    );
    if (encontrada) {
      abrirHistoria(encontrada);
    } else {
      setBusqueda(codigo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, historias]);

  async function cargarHistorias() {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("historia_clinica")
      .select(
        `id, codigo, fecha_apertura, estado, id_paciente,
         pacientes ( nombres, apellidos, cedula ),
         evolucion_clinica ( id )`
      )
      .order("fecha_apertura", { ascending: false });

    if (err) {
      setError("No pudimos cargar las historias clínicas.");
      setLoading(false);
      return;
    }

    setHistorias(
      (data as any[]).map((h) => ({
        id: h.id,
        codigo: h.codigo,
        fecha_apertura: h.fecha_apertura,
        estado: h.estado,
        id_paciente: h.id_paciente,
        paciente_nombre: h.pacientes ? `${h.pacientes.nombres} ${h.pacientes.apellidos}` : "—",
        paciente_cedula: h.pacientes?.cedula ?? "—",
        total_evoluciones: h.evolucion_clinica?.length ?? 0,
      }))
    );
    setLoading(false);
  }

  async function abrirHistoria(h: HistoriaResumen) {
    setHistoriaAbierta(h);
    setEvoluciones(null);

    const { data } = await supabase
      .from("evolucion_clinica")
      .select(
        `id, fecha, diagnostico, tratamiento, observaciones,
         doctores ( nombres, apellidos ),
         recetas_medicas ( medicamento, dosis, frecuencia, duracion )`
      )
      .eq("id_historia", h.id)
      .order("fecha", { ascending: false });

    setEvoluciones(
      ((data as any[]) ?? []).map((e) => ({
        id: e.id,
        fecha: e.fecha,
        diagnostico: e.diagnostico,
        tratamiento: e.tratamiento,
        observaciones: e.observaciones,
        doctor_nombre: e.doctores ? `${e.doctores.nombres} ${e.doctores.apellidos}` : "—",
        recetas: e.recetas_medicas ?? [],
      }))
    );
  }

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return historias;
    return historias.filter((h) =>
      `${h.paciente_nombre} ${h.paciente_cedula} ${h.codigo}`.toLowerCase().includes(q)
    );
  }, [busqueda, historias]);

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <section className="flex-1 min-w-0">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />

          <div className="p-4 md:p-6 xl:p-8 max-w-[1600px] mx-auto">
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="relative overflow-hidden rounded-2xl md:rounded-[28px] p-5 sm:p-8 md:p-10 mb-6 md:mb-8 bg-[#0b1220] shadow-[0_20px_60px_-15px_rgba(11,18,32,0.45)] print:hidden"
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

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <p className="uppercase tracking-[3px] text-[10px] sm:text-xs font-semibold text-cyan-300/90">
                    Expediente clínico
                  </p>
                </div>
                <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-[42px] xl:text-5xl leading-[1.1] mb-3 tracking-tight">
                  Historias Clínicas
                </h1>
                <p className="text-slate-400 max-w-xl text-sm sm:text-[15px] leading-relaxed">
                  Consulta el historial médico completo de cualquier
                  paciente: diagnósticos, tratamientos y recetas.
                </p>
              </div>
            </motion.div>

            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5">
                <AlertCircle size={18} className="text-rose-500 shrink-0" />
                <p className="text-sm text-rose-700 font-medium">{error}</p>
              </div>
            )}

            <div className="relative mb-6 max-w-md print:hidden">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por paciente, cédula o código..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-shadow"
              />
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-20 rounded-2xl bg-white shadow-xl animate-pulse" />
                ))}
              </div>
            ) : filtradas.length === 0 ? (
              <div className="bg-white rounded-[32px] shadow-xl p-12 text-center">
                <p className="text-sm font-semibold text-slate-600">
                  {busqueda ? "No se encontraron historias con esa búsqueda" : "Aún no hay historias clínicas registradas"}
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl sm:rounded-[32px] shadow-xl shadow-slate-200/50 divide-y divide-slate-50">
                {filtradas.map((h, i) => (
                  <motion.button
                    key={h.id}
                    initial="hidden"
                    animate="show"
                    variants={fadeUp}
                    custom={i}
                    onClick={() => abrirHistoria(h)}
                    className="w-full flex items-center gap-4 p-5 hover:bg-slate-50/60 transition-colors text-left"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-white shrink-0">
                      <FolderHeart size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{h.paciente_nombre}</p>
                      <p className="text-xs text-slate-500">
                        Cédula {h.paciente_cedula} · Código {h.codigo} · Abierta el {formatFecha(h.fecha_apertura)}
                      </p>
                    </div>
                    <div className="text-right shrink-0 hidden sm:block">
                      <p className="text-sm font-bold text-slate-700">{h.total_evoluciones}</p>
                      <p className="text-[11px] text-slate-400">consulta{h.total_evoluciones === 1 ? "" : "s"}</p>
                    </div>
                    <ChevronRight size={18} className="text-slate-300 shrink-0" />
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {historiaAbierta && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm print:static print:bg-white print:p-0">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto print:max-h-none print:shadow-none print:rounded-none">
            <div className="flex items-center justify-between px-6 sm:px-7 pt-6 sm:pt-7 print:hidden">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-800">
                  {historiaAbierta.paciente_nombre}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Cédula {historiaAbierta.paciente_cedula} · Código {historiaAbierta.codigo}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                  title="Imprimir historia"
                >
                  <Printer size={16} className="text-slate-600" />
                </button>
                <button
                  onClick={() => setHistoriaAbierta(null)}
                  className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Encabezado visible solo al imprimir */}
            <div className="hidden print:block p-8 border-b border-slate-200">
              <h2 className="text-2xl font-bold text-slate-900">Historia Clínica</h2>
              <p className="text-sm text-slate-600 mt-1">
                {historiaAbierta.paciente_nombre} · Cédula {historiaAbierta.paciente_cedula} · Código {historiaAbierta.codigo}
              </p>
            </div>

            <div className="p-6 sm:p-7">
              {evoluciones === null ? (
                <div className="space-y-3">
                  {[0, 1].map((i) => (
                    <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : evoluciones.length === 0 ? (
                <div className="flex flex-col items-center text-center gap-3 py-10">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <FileText size={20} className="text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">
                    Aún no hay consultas registradas en esta historia
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {evoluciones.map((ev) => (
                    <div key={ev.id} className="border border-slate-100 rounded-2xl p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <Calendar size={13} /> {formatFecha(ev.fecha)}
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600">
                          <Stethoscope size={13} /> {ev.doctor_nombre}
                        </span>
                      </div>

                      {ev.diagnostico && (
                        <div className="mb-2">
                          <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Diagnóstico</p>
                          <p className="text-sm text-slate-700">{ev.diagnostico}</p>
                        </div>
                      )}
                      {ev.tratamiento && (
                        <div className="mb-2">
                          <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Tratamiento</p>
                          <p className="text-sm text-slate-700">{ev.tratamiento}</p>
                        </div>
                      )}
                      {ev.observaciones && (
                        <div className="mb-2">
                          <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold">Observaciones</p>
                          <p className="text-sm text-slate-700">{ev.observaciones}</p>
                        </div>
                      )}

                      {ev.recetas.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100">
                          <p className="text-[11px] uppercase tracking-wide text-slate-400 font-semibold mb-2 flex items-center gap-1.5">
                            <Pill size={12} /> Receta
                          </p>
                          <div className="space-y-1">
                            {ev.recetas.map((r, i) => (
                              <p key={i} className="text-xs text-slate-600">
                                • {r.medicamento}
                                {r.dosis ? ` · ${r.dosis}` : ""}
                                {r.frecuencia ? ` · ${r.frecuencia}` : ""}
                                {r.duracion ? ` · ${r.duracion}` : ""}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function HistoriasClinicasPage() {
  return (
    <Suspense fallback={null}>
      <HistoriasClinicasContent />
    </Suspense>
  );
}