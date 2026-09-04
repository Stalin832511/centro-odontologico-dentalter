"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SidebarMedico from "@/components/medico/SidebarMedico";
import TopbarMedico from "@/components/medico/TopbarMedico";
import SubirRadiografiaModal from "@/components/medico/SubirRadiografiaModal";
import { supabase } from "@/lib/supabase";
import {
  obtenerHistoriaCompleta,
  HistoriaCompleta,
} from "@/services/historiaClinica";
import {
  listarRadiografiasPorPaciente,
  eliminarRadiografia,
  RadiografiaConUrl,
} from "@/services/radiografias";
import {
  ArrowLeft,
  Stethoscope,
  Pill,
  ClipboardList,
  MessageSquareText,
  Copy,
  Check,
  ImagePlus,
  Trash2,
  FileImage,
} from "lucide-react";

interface PacienteBasico {
  id: number;
  nombres: string;
  apellidos: string;
  cedula: string;
}

function formatFecha(fechaISO: string | null) {
  if (!fechaISO) return "Fecha no disponible";

  const [y, m, d] = fechaISO.split("T")[0].split("-");
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
}

export default function HistoriaClinicaPage() {
  const params = useParams();
  const router = useRouter();
  const idPaciente = Number(params.id);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [paciente, setPaciente] = useState<PacienteBasico | null>(null);
  const [historia, setHistoria] = useState<HistoriaCompleta | null>(null);
  const [radiografias, setRadiografias] = useState<RadiografiaConUrl[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  const [modalRadiografiaAbierto, setModalRadiografiaAbierto] = useState(false);
  const [radiografiaAmpliada, setRadiografiaAmpliada] = useState<RadiografiaConUrl | null>(null);
  const [radiografiaAEliminar, setRadiografiaAEliminar] = useState<RadiografiaConUrl | null>(null);
  const [eliminando, setEliminando] = useState(false);

  async function cargarTodo() {
    setCargando(true);
    setError(null);
    try {
      const { data: pacienteData, error: pacienteError } = await supabase
        .from("pacientes")
        .select("id, nombres, apellidos, cedula")
        .eq("id", idPaciente)
        .single();

      if (pacienteError || !pacienteData) {
        setError("No se pudo cargar la información del paciente.");
        return;
      }
      setPaciente(pacienteData);

      const [historiaData, radiografiasData] = await Promise.all([
        obtenerHistoriaCompleta(idPaciente),
        listarRadiografiasPorPaciente(idPaciente),
      ]);

      setHistoria(historiaData);
      setRadiografias(radiografiasData);
    } catch {
      setError("Ocurrió un error al cargar el expediente.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (idPaciente) cargarTodo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idPaciente]);

  function copiarCodigo() {
    if (!historia) return;
    navigator.clipboard.writeText(historia.codigo);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 1800);
  }

  async function confirmarEliminarRadiografia() {
    if (!radiografiaAEliminar) return;
    setEliminando(true);
    try {
      await eliminarRadiografia(radiografiaAEliminar.id, radiografiaAEliminar.archivo_url);
      setRadiografias((prev) => prev.filter((r) => r.id !== radiografiaAEliminar.id));
    } catch {
      setError("No se pudo eliminar la radiografía.");
    } finally {
      setEliminando(false);
      setRadiografiaAEliminar(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="flex">
        <SidebarMedico isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <section className="flex-1 min-w-0">
          <TopbarMedico onMenuClick={() => setSidebarOpen(true)} />

          <div className="p-4 md:p-6 xl:p-8 max-w-[1000px] mx-auto">
            <button
              onClick={() => router.push("/medico/pacientes")}
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-cyan-600 mb-5 transition-colors"
            >
              <ArrowLeft size={16} />
              Volver a Mis Pacientes
            </button>

            {error && (
              <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5 text-sm text-rose-700 font-medium">
                {error}
              </div>
            )}

            {cargando ? (
              <div className="space-y-4">
                <div className="h-32 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
                <div className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
              </div>
            ) : paciente ? (
              <>
                {/* ENCABEZADO DEL EXPEDIENTE */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0b1220] rounded-2xl sm:rounded-[28px] p-6 sm:p-8 mb-6 relative overflow-hidden"
                >
                  <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-cyan-400/10 blur-3xl" />
                  <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="uppercase tracking-[3px] text-[10px] sm:text-xs font-semibold text-cyan-300/90 mb-2">
                        Expediente clínico
                      </p>
                      <h1 className="text-white font-bold text-2xl sm:text-3xl mb-1">
                        {paciente.nombres} {paciente.apellidos}
                      </h1>
                      <p className="text-slate-400 text-sm">Cédula: {paciente.cedula}</p>
                    </div>

                    {historia && (
                      <button
                        onClick={copiarCodigo}
                        className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/10 border border-white/15 hover:bg-white/15 transition-colors shrink-0"
                        title="Copiar código"
                      >
                        <div className="text-left">
                          <p className="text-[10px] uppercase tracking-wider text-slate-400">
                            N° de historia
                          </p>
                          <p className="text-white font-mono font-bold text-sm">
                            {historia.codigo}
                          </p>
                        </div>
                        {copiado ? (
                          <Check size={16} className="text-emerald-400" />
                        ) : (
                          <Copy size={16} className="text-slate-400" />
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>

                {/* RADIOGRAFÍAS */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl sm:rounded-[28px] p-5 sm:p-6 shadow-xl shadow-slate-200/50 mb-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
                      <FileImage size={18} className="text-cyan-600" />
                      Radiografías
                    </h2>
                    <button
                      onClick={() => setModalRadiografiaAbierto(true)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 hover:text-cyan-700"
                    >
                      <ImagePlus size={15} />
                      Subir
                    </button>
                  </div>

                  {radiografias.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">
                      Este paciente aún no tiene radiografías digitalizadas.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {radiografias.map((r) => (
                        <div key={r.id} className="group relative">
                          <button
                            onClick={() => setRadiografiaAmpliada(r)}
                            className="w-full aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200"
                          >
                            {r.urlFirmada ? (
                              <img
                                src={r.urlFirmada}
                                alt={r.tipo ?? "Radiografía"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileImage size={20} className="text-slate-300" />
                              </div>
                            )}
                          </button>
                          <p className="text-[11px] font-semibold text-slate-600 mt-1 truncate">
                            {r.tipo ?? "Radiografía"}
                          </p>
                          <p className="text-[10px] text-slate-400">{formatFecha(r.fecha)}</p>
                          <button
                            onClick={() => setRadiografiaAEliminar(r)}
                            className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-white/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                            title="Eliminar"
                          >
                            <Trash2 size={12} className="text-rose-500" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* LÍNEA DE TIEMPO */}
                {!historia || historia.evoluciones.length === 0 ? (
                  <div className="bg-white rounded-2xl sm:rounded-[32px] p-10 text-center shadow-xl shadow-slate-200/50">
                    <ClipboardList size={28} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600">
                      Este paciente aún no tiene consultas registradas.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Su historia clínica se creará automáticamente con la primera consulta.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {historia.evoluciones.map((ev, i) => (
                      <motion.div
                        key={ev.id}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="bg-white rounded-2xl sm:rounded-[28px] p-5 sm:p-6 shadow-xl shadow-slate-200/50 relative"
                      >
                        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-white shrink-0">
                              <Stethoscope size={16} />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-800">
                                {formatFecha(ev.fecha)}
                              </p>
                              <p className="text-xs text-slate-500">
                                {ev.doctor
                                  ? `Dr(a). ${ev.doctor.nombres} ${ev.doctor.apellidos}`
                                  : "Médico no especificado"}
                              </p>
                            </div>
                          </div>
                          {i === 0 && (
                            <span className="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                              Más reciente
                            </span>
                          )}
                        </div>

                        <div className="space-y-3 text-sm">
                          {ev.motivo_consulta && (
                            <div className="flex gap-2.5">
                              <MessageSquareText size={15} className="text-slate-400 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                  Motivo de consulta
                                </p>
                                <p className="text-slate-700">{ev.motivo_consulta}</p>
                              </div>
                            </div>
                          )}
                          {ev.diagnostico && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Diagnóstico
                              </p>
                              <p className="text-slate-700">{ev.diagnostico}</p>
                            </div>
                          )}
                          {ev.tratamiento && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Tratamiento
                              </p>
                              <p className="text-slate-700">{ev.tratamiento}</p>
                            </div>
                          )}
                          {ev.observaciones && (
                            <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                                Observaciones
                              </p>
                              <p className="text-slate-700">{ev.observaciones}</p>
                            </div>
                          )}

                          {ev.recetas.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 mt-3">
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                                <Pill size={13} className="text-cyan-600" />
                                Receta
                              </p>
                              <div className="space-y-1.5">
                                {ev.recetas.map((r) => (
                                  <div
                                    key={r.id}
                                    className="text-xs bg-slate-50 rounded-lg px-3 py-2 flex flex-wrap gap-x-3 gap-y-0.5"
                                  >
                                    <span className="font-semibold text-slate-700">
                                      {r.medicamento}
                                    </span>
                                    {r.dosis && <span className="text-slate-500">{r.dosis}</span>}
                                    {r.frecuencia && (
                                      <span className="text-slate-500">{r.frecuencia}</span>
                                    )}
                                    {r.duracion && (
                                      <span className="text-slate-500">{r.duracion}</span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </section>
      </div>

      {modalRadiografiaAbierto && (
        <SubirRadiografiaModal
          idPaciente={idPaciente}
          onClose={() => setModalRadiografiaAbierto(false)}
          onGuardado={() => {
            setModalRadiografiaAbierto(false);
            cargarTodo();
          }}
        />
      )}

      {/* VISOR AMPLIADO */}
      {radiografiaAmpliada && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80"
          onClick={() => setRadiografiaAmpliada(null)}
        >
          <div className="max-w-3xl w-full">
            <img
              src={radiografiaAmpliada.urlFirmada}
              alt={radiografiaAmpliada.tipo ?? "Radiografía"}
              className="w-full max-h-[80vh] object-contain rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <p className="text-white text-center mt-3 text-sm font-semibold">
              {radiografiaAmpliada.tipo} · {formatFecha(radiografiaAmpliada.fecha)}
            </p>
            {radiografiaAmpliada.descripcion && (
              <p className="text-slate-300 text-center text-xs mt-1">
                {radiografiaAmpliada.descripcion}
              </p>
            )}
          </div>
        </div>
      )}

      {/* CONFIRMAR ELIMINACIÓN */}
      {radiografiaAEliminar && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
              <Trash2 size={24} className="text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">¿Eliminar radiografía?</h3>
            <p className="text-sm text-slate-500 mb-6">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setRadiografiaAEliminar(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminarRadiografia}
                disabled={eliminando}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold disabled:opacity-60"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}