"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Trash2,
  Eye,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserRound,
  FileImage,
  CalendarDays,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import SubirRadiografiaModal from "@/components/medico/SubirRadiografiaModal";

import { supabase } from "@/lib/supabase";
import {
  listarRadiografiasPorPaciente,
  eliminarRadiografia,
  type RadiografiaConUrl,
} from "@/services/radiografias";

// ============================================================
// ANIMACIÓN
// ============================================================

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 16,
  },

  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// ============================================================
// TIPOS
// ============================================================

interface Paciente {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
}

// ============================================================
// PÁGINA
// ============================================================

export default function RadiografiasPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] =
    useState<Paciente | null>(null);

  const [radiografias, setRadiografias] = useState<
    RadiografiaConUrl[]
  >([]);

  const [busqueda, setBusqueda] = useState("");

  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [loadingRadiografias, setLoadingRadiografias] =
    useState(false);

  const [modalSubir, setModalSubir] = useState(false);

  const [radiografiaSeleccionada, setRadiografiaSeleccionada] =
    useState<RadiografiaConUrl | null>(null);

  const [radiografiaAEliminar, setRadiografiaAEliminar] =
    useState<RadiografiaConUrl | null>(null);

  const [eliminando, setEliminando] = useState(false);

  const [mensajeExito, setMensajeExito] = useState<string | null>(
    null
  );

  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // CARGAR PACIENTES
  // ============================================================

  async function cargarPacientes() {
    setLoadingPacientes(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("pacientes")
      .select(
        "id, cedula, nombres, apellidos, telefono"
      )
      .order("nombres", {
        ascending: true,
      });

    if (err) {
      setError(
        "No pudimos cargar el listado de pacientes."
      );
      setLoadingPacientes(false);
      return;
    }

    setPacientes((data as Paciente[]) ?? []);
    setLoadingPacientes(false);
  }

  // ============================================================
  // CARGAR RADIOGRAFÍAS
  // ============================================================

  async function cargarRadiografias(idPaciente: number) {
    setLoadingRadiografias(true);
    setError(null);

    try {
      const data =
        await listarRadiografiasPorPaciente(idPaciente);

      setRadiografias(data);
    } catch (err) {
      console.error(err);

      setRadiografias([]);

      setError(
        "No se pudieron cargar las radiografías del paciente."
      );
    } finally {
      setLoadingRadiografias(false);
    }
  }

  // ============================================================
  // INICIO
  // ============================================================

  useEffect(() => {
    cargarPacientes();
  }, []);

  // ============================================================
  // BUSCADOR
  // ============================================================

  const pacientesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();

    if (!q) {
      return pacientes;
    }

    return pacientes.filter((paciente) =>
      `${paciente.nombres} ${paciente.apellidos} ${paciente.cedula} ${
        paciente.telefono ?? ""
      }`
        .toLowerCase()
        .includes(q)
    );
  }, [busqueda, pacientes]);

  // ============================================================
  // SELECCIONAR PACIENTE
  // ============================================================

  async function seleccionarPaciente(paciente: Paciente) {
    setPacienteSeleccionado(paciente);
    setRadiografias([]);
    setRadiografiaSeleccionada(null);

    await cargarRadiografias(paciente.id);
  }

  // ============================================================
  // RADIOGRAFÍA GUARDADA
  // ============================================================

  async function handleRadiografiaGuardada() {
    setModalSubir(false);

    if (!pacienteSeleccionado) {
      return;
    }

    setMensajeExito(
      "Radiografía subida correctamente."
    );

    await cargarRadiografias(
      pacienteSeleccionado.id
    );

    setTimeout(() => {
      setMensajeExito(null);
    }, 3000);
  }

  // ============================================================
  // ELIMINAR RADIOGRAFÍA
  // ============================================================

  async function confirmarEliminacion() {
    if (!radiografiaAEliminar) {
      return;
    }

    setEliminando(true);
    setError(null);

    try {
      await eliminarRadiografia(
        radiografiaAEliminar.id,
        radiografiaAEliminar.archivo_url
      );

      setRadiografias((prev) =>
        prev.filter(
          (radiografia) =>
            radiografia.id !==
            radiografiaAEliminar.id
        )
      );

      setRadiografiaAEliminar(null);

      setMensajeExito(
        "Radiografía eliminada correctamente."
      );

      setTimeout(() => {
        setMensajeExito(null);
      }, 3000);
    } catch (err) {
      console.error(err);

      setError(
        "No se pudo eliminar la radiografía."
      );

      setRadiografiaAEliminar(null);
    } finally {
      setEliminando(false);
    }
  }

  // ============================================================
  // DETERMINAR TIPO DE ARCHIVO
  // ============================================================

  function esPDF(radiografia: RadiografiaConUrl) {
    return (
      radiografia.archivo_url
        .toLowerCase()
        .endsWith(".pdf")
    );
  }

  // ============================================================
  // FORMATEAR FECHA
  // ============================================================

  function formatearFecha(fecha: string) {
    if (!fecha) {
      return "Sin fecha";
    }

    const [anio, mes, dia] =
      fecha.split("-");

    if (!anio || !mes || !dia) {
      return fecha;
    }

    return `${dia}/${mes}/${anio}`;
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="flex min-h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <section className="flex-1 min-w-0">
          <Topbar
            onMenuClick={() =>
              setSidebarOpen(true)
            }
          />

          <div className="p-4 md:p-6 xl:p-8 max-w-[1600px] mx-auto">
            {/* =====================================================
                HERO
            ====================================================== */}

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

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />

                  <p className="uppercase tracking-[3px] text-[10px] sm:text-xs font-semibold text-cyan-300/90">
                    Gestión clínica
                  </p>
                </div>

                <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-[42px] leading-[1.1] mb-3 tracking-tight">
                  Radiografías
                </h1>

                <p className="text-slate-400 max-w-2xl text-sm sm:text-[15px] leading-relaxed">
                  Consulta, visualiza y administra las
                  radiografías asociadas a la historia
                  clínica de cada paciente.
                </p>
              </div>
            </motion.div>

            {/* =====================================================
                MENSAJES
            ====================================================== */}

            {mensajeExito && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3.5">
                <CheckCircle2
                  size={18}
                  className="text-emerald-500 shrink-0"
                />

                <p className="text-sm text-emerald-700 font-medium">
                  {mensajeExito}
                </p>
              </div>
            )}

            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5">
                <AlertCircle
                  size={18}
                  className="text-rose-500 shrink-0"
                />

                <p className="text-sm text-rose-700 font-medium">
                  {error}
                </p>

                <button
                  onClick={() => setError(null)}
                  className="ml-auto"
                >
                  <X
                    size={16}
                    className="text-rose-400"
                  />
                </button>
              </div>
            )}

            {/* =====================================================
                CONTENIDO PRINCIPAL
            ====================================================== */}

            <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
              {/* ===================================================
                  LISTA DE PACIENTES
              ==================================================== */}

              <motion.div
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="bg-white rounded-2xl sm:rounded-[28px] p-5 sm:p-6 shadow-xl shadow-slate-200/50 h-fit"
              >
                <div className="flex items-center gap-2 mb-5">
                  <UserRound
                    size={20}
                    className="text-cyan-600"
                  />

                  <h2 className="text-lg font-black text-slate-800">
                    Pacientes
                  </h2>
                </div>

                {/* BUSCADOR */}

                <div className="relative mb-4">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) =>
                      setBusqueda(
                        e.target.value
                      )
                    }
                    placeholder="Buscar paciente..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
                  />
                </div>

                {/* PACIENTES */}

                {loadingPacientes ? (
                  <div className="space-y-2">
                    {[0, 1, 2, 3, 4].map(
                      (item) => (
                        <div
                          key={item}
                          className="h-16 rounded-xl bg-slate-100 animate-pulse"
                        />
                      )
                    )}
                  </div>
                ) : pacientesFiltrados.length ===
                  0 ? (
                  <div className="text-center py-10">
                    <UserRound
                      size={30}
                      className="mx-auto text-slate-300 mb-3"
                    />

                    <p className="text-sm font-semibold text-slate-600">
                      No se encontraron pacientes
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                    {pacientesFiltrados.map(
                      (paciente) => {
                        const seleccionado =
                          pacienteSeleccionado?.id ===
                          paciente.id;

                        return (
                          <button
                            key={paciente.id}
                            onClick={() =>
                              seleccionarPaciente(
                                paciente
                              )
                            }
                            className={`w-full text-left rounded-2xl p-3 transition-all border ${
                              seleccionado
                                ? "border-cyan-200 bg-cyan-50"
                                : "border-transparent hover:bg-slate-50"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                                  seleccionado
                                    ? "bg-cyan-600 text-white"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {paciente.nombres.charAt(
                                  0
                                )}
                                {paciente.apellidos.charAt(
                                  0
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="font-semibold text-sm text-slate-700 truncate">
                                  {paciente.nombres}{" "}
                                  {paciente.apellidos}
                                </p>

                                <p className="text-xs text-slate-400 mt-0.5">
                                  Cédula:{" "}
                                  {paciente.cedula}
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </motion.div>

              {/* ===================================================
                  RADIOGRAFÍAS
              ==================================================== */}

              <motion.div
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="bg-white rounded-2xl sm:rounded-[28px] p-5 sm:p-6 shadow-xl shadow-slate-200/50 min-h-[500px]"
              >
                {!pacienteSeleccionado ? (
                  <div className="min-h-[460px] flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center mb-4">
                      <ImageIcon
                        size={28}
                        className="text-cyan-500"
                      />
                    </div>

                    <h2 className="text-lg font-bold text-slate-700">
                      Selecciona un paciente
                    </h2>

                    <p className="text-sm text-slate-400 mt-2 max-w-sm">
                      Selecciona un paciente de la lista
                      para consultar sus radiografías.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* CABECERA */}

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <ImageIcon
                            size={20}
                            className="text-cyan-600"
                          />

                          <h2 className="text-lg sm:text-xl font-black text-slate-800">
                            Radiografías
                          </h2>
                        </div>

                        <p className="text-sm text-slate-500">
                          {pacienteSeleccionado.nombres}{" "}
                          {pacienteSeleccionado.apellidos}
                        </p>

                        <p className="text-xs text-slate-400 mt-0.5">
                          Cédula:{" "}
                          {pacienteSeleccionado.cedula}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setModalSubir(true)
                        }
                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shrink-0"
                        style={{
                          background:
                            "linear-gradient(135deg, #0ea5e9, #0369a1)",
                        }}
                      >
                        <Plus size={16} />
                        Subir radiografía
                      </button>
                    </div>

                    {/* CARGANDO */}

                    {loadingRadiografias ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[0, 1, 2, 3].map(
                          (item) => (
                            <div
                              key={item}
                              className="h-64 rounded-2xl bg-slate-100 animate-pulse"
                            />
                          )
                        )}
                      </div>
                    ) : radiografias.length ===
                      0 ? (
                      <div className="py-16 text-center">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                          <FileImage
                            size={28}
                            className="text-slate-400"
                          />
                        </div>

                        <p className="text-sm font-semibold text-slate-600">
                          No hay radiografías
                        </p>

                        <p className="text-xs text-slate-400 mt-1">
                          Este paciente todavía no
                          tiene radiografías registradas.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {radiografias.map(
                          (radiografia) => (
                            <div
                              key={radiografia.id}
                              className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                            >
                              {/* PREVISUALIZACIÓN */}

                              <div className="h-56 bg-slate-100 relative overflow-hidden">
                                {radiografia.urlFirmada ? (
                                  esPDF(
                                    radiografia
                                  ) ? (
                                    <div className="w-full h-full flex flex-col items-center justify-center">
                                      <FileText
                                        size={48}
                                        className="text-rose-400 mb-3"
                                      />

                                      <p className="text-xs font-semibold text-slate-500">
                                        Documento PDF
                                      </p>
                                    </div>
                                  ) : (
                                    <img
                                      src={
                                        radiografia.urlFirmada
                                      }
                                      alt={
                                        radiografia.tipo ??
                                        "Radiografía dental"
                                      }
                                      className="w-full h-full object-cover"
                                    />
                                  )
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <AlertCircle
                                      size={30}
                                      className="text-slate-300"
                                    />
                                  </div>
                                )}

                                {/* TIPO */}

                                <div className="absolute top-3 left-3">
                                  <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[11px] font-semibold text-slate-700 shadow-sm">
                                    {radiografia.tipo ??
                                      "Radiografía"}
                                  </span>
                                </div>
                              </div>

                              {/* INFORMACIÓN */}

                              <div className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                                      <CalendarDays
                                        size={13}
                                      />

                                      {formatearFecha(
                                        radiografia.fecha
                                      )}
                                    </div>

                                    {radiografia.descripcion ? (
                                      <p className="text-sm text-slate-600 line-clamp-2">
                                        {
                                          radiografia.descripcion
                                        }
                                      </p>
                                    ) : (
                                      <p className="text-xs text-slate-400 italic">
                                        Sin descripción
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {/* ACCIONES */}

                                <div className="flex gap-2 mt-4">
                                  <button
                                    onClick={() =>
                                      setRadiografiaSeleccionada(
                                        radiografia
                                      )
                                    }
                                    disabled={
                                      !radiografia.urlFirmada
                                    }
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 text-xs font-semibold transition-colors disabled:opacity-40"
                                  >
                                    <Eye size={15} />
                                    Ver
                                  </button>

                                  <button
                                    onClick={() =>
                                      setRadiografiaAEliminar(
                                        radiografia
                                      )
                                    }
                                    className="w-11 h-10 rounded-xl bg-slate-100 hover:bg-rose-50 flex items-center justify-center transition-colors"
                                    title="Eliminar"
                                  >
                                    <Trash2
                                      size={15}
                                      className="text-slate-500 hover:text-rose-500"
                                    />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      </div>

      {/* ==========================================================
          MODAL SUBIR
      =========================================================== */}

      {modalSubir &&
        pacienteSeleccionado && (
          <SubirRadiografiaModal
            idPaciente={
              pacienteSeleccionado.id
            }
            onClose={() =>
              setModalSubir(false)
            }
            onGuardado={
              handleRadiografiaGuardada
            }
          />
        )}

      {/* ==========================================================
          MODAL VISUALIZAR
      =========================================================== */}

      {radiografiaSeleccionada && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
            {/* CABECERA */}

            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-bold text-slate-800">
                  {radiografiaSeleccionada.tipo ??
                    "Radiografía"}
                </h3>

                <p className="text-xs text-slate-400 mt-0.5">
                  {pacienteSeleccionado?.nombres}{" "}
                  {pacienteSeleccionado?.apellidos}
                </p>
              </div>

              <button
                onClick={() =>
                  setRadiografiaSeleccionada(
                    null
                  )
                }
                className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            {/* CONTENIDO */}

            <div className="flex-1 min-h-0 bg-slate-100 p-3 sm:p-5 overflow-auto">
              {radiografiaSeleccionada.urlFirmada ? (
                esPDF(
                  radiografiaSeleccionada
                ) ? (
                  <iframe
                    src={
                      radiografiaSeleccionada.urlFirmada
                    }
                    title="Radiografía PDF"
                    className="w-full h-[70vh] rounded-xl bg-white"
                  />
                ) : (
                  <div className="w-full min-h-[65vh] flex items-center justify-center">
                    <img
                      src={
                        radiografiaSeleccionada.urlFirmada
                      }
                      alt={
                        radiografiaSeleccionada.tipo ??
                        "Radiografía dental"
                      }
                      className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-lg"
                    />
                  </div>
                )
              ) : (
                <div className="min-h-[60vh] flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle
                      size={32}
                      className="mx-auto text-rose-400 mb-3"
                    />

                    <p className="text-sm font-semibold text-slate-600">
                      No se pudo generar la
                      vista previa.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* DESCRIPCIÓN */}

            {radiografiaSeleccionada.descripcion && (
              <div className="px-5 sm:px-6 py-4 border-t border-slate-100 shrink-0">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                  Descripción
                </p>

                <p className="text-sm text-slate-600">
                  {
                    radiografiaSeleccionada.descripcion
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================================
          MODAL ELIMINAR
      =========================================================== */}

      {radiografiaAEliminar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
              <Trash2
                size={24}
                className="text-rose-500"
              />
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2">
              ¿Eliminar radiografía?
            </h3>

            <p className="text-sm text-slate-500 mb-6">
              Esta acción eliminará el archivo de
              almacenamiento y su registro de la
              historia clínica. No se puede deshacer.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() =>
                  setRadiografiaAEliminar(
                    null
                  )
                }
                disabled={eliminando}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>

              <button
                onClick={
                  confirmarEliminacion
                }
                disabled={eliminando}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {eliminando ? (
                  <Loader2
                    size={15}
                    className="animate-spin"
                  />
                ) : (
                  <Trash2 size={15} />
                )}

                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}