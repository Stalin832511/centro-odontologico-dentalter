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
  FileText,
  CalendarDays,
  Link as LinkIcon,
  ScanLine,
  Printer,
  Building2,
  FlaskConical,
  Sparkles,
  FileStack,
  ArrowLeft,
  LucideIcon,
} from "lucide-react";

import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import SubirResultadoModal from "@/components/admin/SubirResultadoModal";
import GenerarEnlaceModal from "@/components/admin/GenerarEnlaceModal";

import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { capitalizarNombre } from "@/lib/texto";
import {
  listarResultadosPorPaciente,
  listarTiposResultado,
  listarEntidadesReferentes,
  marcarResultadoRevisado,
  eliminarResultado,
  type ResultadoConUrl,
  type TipoResultado,
  type EntidadReferente,
} from "@/services/resultados";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
  },
};

// Ícono + color por tipo de resultado (por su slug). Si agregas un
// tipo nuevo en la base de datos que no está aquí, usa el ícono
// por defecto — no rompe nada, solo se ve genérico hasta que le
// agregues su propia entrada en este mapa.
const ESTILO_POR_SLUG: Record<string, { icon: LucideIcon; color: string }> = {
  radiografia: { icon: ScanLine, color: "from-cyan-500 to-sky-600" },
  laboratorio: { icon: FlaskConical, color: "from-violet-500 to-fuchsia-600" },
  protesis: { icon: Sparkles, color: "from-emerald-500 to-teal-600" },
};
const ESTILO_DEFECTO = { icon: FileStack, color: "from-slate-500 to-slate-600" };

function estiloDeTipo(slug: string) {
  return ESTILO_POR_SLUG[slug] ?? ESTILO_DEFECTO;
}

interface Paciente {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
}

export default function ResultadosPage() {
  const { rol } = useAuth();
  const esAdministrador = rol === "administrador";
  const puedeGestionar = rol === "administrador" || rol === "medico";

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // null = pantalla de menú (solo tarjetas); con valor = ya eligió
  // una categoría y está viendo el buscador de pacientes.
  const [categoriaActiva, setCategoriaActiva] = useState<TipoResultado | null>(
    null
  );

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] =
    useState<Paciente | null>(null);

  const [tipos, setTipos] = useState<TipoResultado[]>([]);
  const [entidades, setEntidades] = useState<EntidadReferente[]>([]);
  const [resultados, setResultados] = useState<ResultadoConUrl[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState<number | "todos">("todos");

  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [loadingResultados, setLoadingResultados] = useState(false);

  const [modalSubir, setModalSubir] = useState(false);
  const [modalEnlace, setModalEnlace] = useState(false);

  const [resultadoSeleccionado, setResultadoSeleccionado] =
    useState<ResultadoConUrl | null>(null);
  const [resultadoAEliminar, setResultadoAEliminar] =
    useState<ResultadoConUrl | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // CARGA INICIAL
  // ============================================================

  useEffect(() => {
    cargarPacientes();
    listarTiposResultado().then(setTipos).catch(() => {});
    listarEntidadesReferentes().then(setEntidades).catch(() => {});
  }, []);

  async function cargarPacientes() {
    setLoadingPacientes(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("pacientes")
      .select("id, cedula, nombres, apellidos, telefono")
      .order("nombres", { ascending: true });

    if (err) {
      setError("No pudimos cargar el listado de pacientes.");
      setLoadingPacientes(false);
      return;
    }

    setPacientes((data as Paciente[]) ?? []);
    setLoadingPacientes(false);
  }

  async function cargarResultados(idPaciente: number) {
    setLoadingResultados(true);
    setError(null);
    try {
      const data = await listarResultadosPorPaciente(idPaciente);
      setResultados(data);
    } catch (err) {
      console.error(err);
      setResultados([]);
      setError("No se pudieron cargar los resultados del paciente.");
    } finally {
      setLoadingResultados(false);
    }
  }

  async function seleccionarPaciente(paciente: Paciente) {
    setPacienteSeleccionado(paciente);
    setResultados([]);
    setResultadoSeleccionado(null);
    await cargarResultados(paciente.id);
  }

  // Al entrar a una categoría desde el menú, deja el filtro de
  // tipo apuntando a esa categoría (el usuario puede cambiarlo
  // luego si quiere ver "Todos" los resultados de ese paciente).
  function abrirCategoria(tipo: TipoResultado) {
    setCategoriaActiva(tipo);
    setFiltroTipo(tipo.id);
    setPacienteSeleccionado(null);
    setResultados([]);
    setBusqueda("");
  }

  function volverAlMenu() {
    setCategoriaActiva(null);
    setPacienteSeleccionado(null);
    setResultados([]);
  }

  const pacientesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return pacientes;
    return pacientes.filter((p) =>
      `${p.nombres} ${p.apellidos} ${p.cedula} ${p.telefono ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [busqueda, pacientes]);

  const resultadosFiltrados = useMemo(() => {
    if (filtroTipo === "todos") return resultados;
    return resultados.filter((r) => r.id_tipo_resultado === filtroTipo);
  }, [resultados, filtroTipo]);

  // ============================================================
  // ACCIONES
  // ============================================================

  async function handleGuardado() {
    setModalSubir(false);
    if (!pacienteSeleccionado) return;
    setMensajeExito("Resultado guardado correctamente.");
    await cargarResultados(pacienteSeleccionado.id);
    setTimeout(() => setMensajeExito(null), 3000);
  }

  async function handleMarcarRevisado(r: ResultadoConUrl) {
    try {
      await marcarResultadoRevisado(r.id);
      if (pacienteSeleccionado) await cargarResultados(pacienteSeleccionado.id);
    } catch (err) {
      console.error(err);
    }
  }

  async function confirmarEliminacion() {
    if (!resultadoAEliminar) return;
    setEliminando(true);
    setError(null);
    try {
      await eliminarResultado(
        resultadoAEliminar.id,
        resultadoAEliminar.archivo_url
      );
      setResultados((prev) =>
        prev.filter((r) => r.id !== resultadoAEliminar.id)
      );
      setResultadoAEliminar(null);
      setMensajeExito("Resultado eliminado correctamente.");
      setTimeout(() => setMensajeExito(null), 3000);
    } catch (err) {
      console.error(err);
      setError("No se pudo eliminar el resultado.");
      setResultadoAEliminar(null);
    } finally {
      setEliminando(false);
    }
  }

  function esPDF(r: ResultadoConUrl) {
    return r.archivo_url?.toLowerCase().endsWith(".pdf") ?? false;
  }

  function formatearFecha(fecha: string) {
    if (!fecha) return "Sin fecha";
    const d = new Date(fecha);
    return d.toLocaleDateString("es-EC", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="flex min-h-screen">
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

              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <p className="uppercase tracking-[3px] text-[10px] sm:text-xs font-semibold text-cyan-300/90">
                    Gestión clínica
                  </p>
                </div>
                <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-[42px] leading-[1.1] mb-3 tracking-tight">
                  Resultados
                </h1>
                <p className="text-slate-400 max-w-2xl text-sm sm:text-[15px] leading-relaxed">
                  Radiografías, laboratorio, avances de prótesis y todo lo
                  que suban tus centros aliados — en un solo lugar.
                </p>
              </div>
            </motion.div>

            {/* MENSAJES */}
            {mensajeExito && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3.5">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                <p className="text-sm text-emerald-700 font-medium">{mensajeExito}</p>
              </div>
            )}
            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5">
                <AlertCircle size={18} className="text-rose-500 shrink-0" />
                <p className="text-sm text-rose-700 font-medium">{error}</p>
                <button onClick={() => setError(null)} className="ml-auto">
                  <X size={16} className="text-rose-400" />
                </button>
              </div>
            )}

            {/* ================================================
                MENÚ DE CATEGORÍAS — pantalla inicial
            ================================================= */}
            {categoriaActiva === null ? (
              <motion.div
                initial="hidden"
                animate="show"
                variants={fadeUp}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5"
              >
                {tipos.length === 0 ? (
                  <div className="col-span-full bg-white rounded-[28px] p-10 text-center shadow-xl shadow-slate-200/50">
                    <FileStack size={26} className="text-slate-300 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-600">
                      No hay categorías configuradas
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Agrega tipos de resultado en la tabla{" "}
                      <code>tipos_resultado</code>.
                    </p>
                  </div>
                ) : (
                  tipos.map((tipo) => {
                    const { icon: Icon, color } = estiloDeTipo(tipo.slug);
                    return (
                      <motion.button
                        key={tipo.id}
                        onClick={() => abrirCategoria(tipo)}
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.97 }}
                        className="text-left bg-white rounded-[28px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 transition-shadow hover:shadow-2xl"
                      >
                        <div
                          className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center text-white mb-5`}
                        >
                          <Icon size={26} />
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg">
                          {tipo.nombre}
                        </h3>
                        <p className="text-sm text-slate-400 mt-1">
                          Ver, subir o generar enlace externo
                        </p>
                      </motion.button>
                    );
                  })
                )}
              </motion.div>
            ) : (
              <>
                {/* ==============================================
                    CATEGORÍA ABIERTA — buscador de pacientes +
                    panel de resultados de esa categoría
                ================================================= */}
                <button
                  onClick={volverAlMenu}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-cyan-600 mb-5 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Volver a Resultados
                </button>

                <div className="flex items-center gap-2 mb-5">
                  {(() => {
                    const { icon: Icon } = estiloDeTipo(categoriaActiva.slug);
                    return <Icon size={20} className="text-cyan-600" />;
                  })()}
                  <h2 className="text-lg font-black text-slate-800">
                    {categoriaActiva.nombre}
                  </h2>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[360px_1fr] gap-6">
                  {/* LISTA DE PACIENTES */}
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={fadeUp}
                    className="bg-white rounded-2xl sm:rounded-[28px] p-5 sm:p-6 shadow-xl shadow-slate-200/50 h-fit"
                  >
                    <div className="flex items-center gap-2 mb-5">
                      <UserRound size={20} className="text-cyan-600" />
                      <h2 className="text-lg font-black text-slate-800">
                        Pacientes
                      </h2>
                    </div>

                    <div className="relative mb-4">
                      <Search
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        placeholder="Buscar por nombre, cédula o historia clínica..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
                      />
                    </div>

                    {loadingPacientes ? (
                      <div className="space-y-2">
                        {[0, 1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-16 rounded-xl bg-slate-100 animate-pulse"
                          />
                        ))}
                      </div>
                    ) : pacientesFiltrados.length === 0 ? (
                      <div className="text-center py-10">
                        <UserRound size={30} className="mx-auto text-slate-300 mb-3" />
                        <p className="text-sm font-semibold text-slate-600">
                          No se encontraron pacientes
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                        {pacientesFiltrados.map((paciente) => {
                          const seleccionado =
                            pacienteSeleccionado?.id === paciente.id;
                          const nombreCompleto = `${capitalizarNombre(
                            paciente.nombres
                          )} ${capitalizarNombre(paciente.apellidos)}`;
                          return (
                            <button
                              key={paciente.id}
                              onClick={() => seleccionarPaciente(paciente)}
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
                                  {capitalizarNombre(paciente.nombres).charAt(0)}
                                  {capitalizarNombre(paciente.apellidos).charAt(0)}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-sm text-slate-700 truncate">
                                    {nombreCompleto}
                                  </p>
                                  <p className="text-xs text-slate-400 mt-0.5">
                                    Cédula: {paciente.cedula}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>

                  {/* RESULTADOS */}
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={fadeUp}
                    className="bg-white rounded-2xl sm:rounded-[28px] p-5 sm:p-6 shadow-xl shadow-slate-200/50 min-h-[500px]"
                  >
                    {!pacienteSeleccionado ? (
                      <div className="min-h-[460px] flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-2xl bg-cyan-50 flex items-center justify-center mb-4">
                          {(() => {
                            const { icon: Icon } = estiloDeTipo(categoriaActiva.slug);
                            return <Icon size={28} className="text-cyan-500" />;
                          })()}
                        </div>
                        <h2 className="text-lg font-bold text-slate-700">
                          Selecciona un paciente
                        </h2>
                        <p className="text-sm text-slate-400 mt-2 max-w-sm">
                          Busca por nombre, cédula o código de historia
                          clínica para ver o subir sus{" "}
                          {categoriaActiva.nombre.toLowerCase()}.
                        </p>
                      </div>
                    ) : (
                      <>
                        {/* CABECERA */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-5">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              {(() => {
                                const { icon: Icon } = estiloDeTipo(categoriaActiva.slug);
                                return <Icon size={20} className="text-cyan-600" />;
                              })()}
                              <h2 className="text-lg sm:text-xl font-black text-slate-800">
                                {categoriaActiva.nombre}
                              </h2>
                            </div>
                            <p className="text-sm text-slate-500">
                              {capitalizarNombre(pacienteSeleccionado.nombres)}{" "}
                              {capitalizarNombre(pacienteSeleccionado.apellidos)}
                            </p>
                          </div>

                          {puedeGestionar && (
                            <div className="flex gap-2 shrink-0">
                              <button
                                onClick={() => setModalEnlace(true)}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-cyan-200 text-cyan-700 hover:bg-cyan-50 text-sm font-semibold"
                              >
                                <LinkIcon size={16} />
                                Enlace externo
                              </button>
                              <button
                                onClick={() => setModalSubir(true)}
                                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #0ea5e9, #0369a1)",
                                }}
                              >
                                <Plus size={16} />
                                Subir
                              </button>
                            </div>
                          )}
                        </div>

                        {/* FILTRO POR TIPO (por si quiere ver "Todos" del paciente) */}
                        {tipos.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-5">
                            <button
                              onClick={() => setFiltroTipo("todos")}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                filtroTipo === "todos"
                                  ? "bg-slate-800 text-white"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                            >
                              Todos
                            </button>
                            {tipos.map((t) => (
                              <button
                                key={t.id}
                                onClick={() => setFiltroTipo(t.id)}
                                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                                  filtroTipo === t.id
                                    ? "bg-cyan-600 text-white"
                                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                }`}
                              >
                                {t.nombre}
                              </button>
                            ))}
                          </div>
                        )}

                        {/* LISTA DE RESULTADOS */}
                        {loadingResultados ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[0, 1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="h-56 rounded-2xl bg-slate-100 animate-pulse"
                              />
                            ))}
                          </div>
                        ) : resultadosFiltrados.length === 0 ? (
                          <div className="py-16 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                              <ScanLine size={28} className="text-slate-400" />
                            </div>
                            <p className="text-sm font-semibold text-slate-600">
                              No hay resultados
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              Este paciente todavía no tiene resultados
                              registrados en esta categoría.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {resultadosFiltrados.map((r) => (
                              <div
                                key={r.id}
                                className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                              >
                                <div className="h-44 bg-slate-100 relative overflow-hidden">
                                  {r.urlFirmada ? (
                                    esPDF(r) ? (
                                      <div className="w-full h-full flex flex-col items-center justify-center">
                                        <FileText
                                          size={40}
                                          className="text-rose-400 mb-2"
                                        />
                                        <p className="text-xs font-semibold text-slate-500">
                                          Documento PDF
                                        </p>
                                      </div>
                                    ) : (
                                      <img
                                        src={r.urlFirmada}
                                        alt={r.titulo ?? "Resultado"}
                                        className="w-full h-full object-cover"
                                      />
                                    )
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <AlertCircle size={26} className="text-slate-300" />
                                    </div>
                                  )}

                                  <div className="absolute top-3 left-3 flex gap-1.5">
                                    <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-sm text-[11px] font-semibold text-slate-700 shadow-sm">
                                      {r.tipo_resultado?.nombre ?? "Resultado"}
                                    </span>
                                    {r.origen === "externo" && (
                                      <span className="px-2.5 py-1 rounded-full bg-cyan-600 text-[11px] font-semibold text-white shadow-sm flex items-center gap-1">
                                        <Building2 size={10} />
                                        Externo
                                      </span>
                                    )}
                                  </div>

                                  {r.estado === "pendiente" && (
                                    <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-amber-500 text-[11px] font-semibold text-white shadow-sm">
                                      Pendiente
                                    </span>
                                  )}
                                </div>

                                <div className="p-4">
                                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
                                    <CalendarDays size={13} />
                                    {formatearFecha(r.fecha)}
                                  </div>

                                  {r.titulo && (
                                    <p className="text-sm font-semibold text-slate-700 mb-1">
                                      {r.titulo}
                                    </p>
                                  )}
                                  {r.descripcion ? (
                                    <p className="text-sm text-slate-600 line-clamp-2">
                                      {r.descripcion}
                                    </p>
                                  ) : (
                                    <p className="text-xs text-slate-400 italic">
                                      Sin descripción
                                    </p>
                                  )}
                                  {r.subido_por && (
                                    <p className="text-[11px] text-slate-400 mt-1.5">
                                      Subido por: {r.subido_por}
                                    </p>
                                  )}

                                  <div className="flex gap-2 mt-4">
                                    <button
                                      onClick={() => setResultadoSeleccionado(r)}
                                      disabled={!r.urlFirmada}
                                      className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 hover:bg-cyan-50 text-slate-600 hover:text-cyan-700 text-xs font-semibold transition-colors disabled:opacity-40"
                                    >
                                      <Eye size={15} />
                                      Ver
                                    </button>

                                    {puedeGestionar && r.estado === "pendiente" && (
                                      <button
                                        onClick={() => handleMarcarRevisado(r)}
                                        className="w-11 h-10 rounded-xl bg-emerald-50 hover:bg-emerald-100 flex items-center justify-center transition-colors"
                                        title="Marcar como revisado"
                                      >
                                        <CheckCircle2
                                          size={15}
                                          className="text-emerald-600"
                                        />
                                      </button>
                                    )}

                                    {/* Eliminar: solo administrador */}
                                    {esAdministrador && (
                                      <button
                                        onClick={() => setResultadoAEliminar(r)}
                                        className="w-11 h-10 rounded-xl bg-slate-100 hover:bg-rose-50 flex items-center justify-center transition-colors"
                                        title="Eliminar"
                                      >
                                        <Trash2
                                          size={15}
                                          className="text-slate-500 hover:text-rose-500"
                                        />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </motion.div>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      {/* MODAL SUBIR — tipo bloqueado a la categoría que se eligió en el menú */}
      {modalSubir && pacienteSeleccionado && categoriaActiva && (
        <SubirResultadoModal
          idPaciente={pacienteSeleccionado.id}
          tipos={[categoriaActiva]}
          onClose={() => setModalSubir(false)}
          onGuardado={handleGuardado}
        />
      )}

      {/* MODAL GENERAR ENLACE — mismo bloqueo de tipo */}
      {modalEnlace && pacienteSeleccionado && categoriaActiva && (
        <GenerarEnlaceModal
          idPaciente={pacienteSeleccionado.id}
          tipos={[categoriaActiva]}
          entidades={entidades}
          onClose={() => setModalEnlace(false)}
        />
      )}

      {/* MODAL VISUALIZAR */}
      {resultadoSeleccionado && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-slate-100 shrink-0">
              <div>
                <h3 className="font-bold text-slate-800">
                  {resultadoSeleccionado.titulo ??
                    resultadoSeleccionado.tipo_resultado?.nombre ??
                    "Resultado"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {pacienteSeleccionado &&
                    `${capitalizarNombre(
                      pacienteSeleccionado.nombres
                    )} ${capitalizarNombre(pacienteSeleccionado.apellidos)}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    window.open(
                      `/imprimir-resultado/${resultadoSeleccionado.id}`,
                      "_blank"
                    )
                  }
                  className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200"
                  title="Imprimir con membrete de la clínica"
                >
                  <Printer size={16} className="text-slate-600" />
                </button>
                <button
                  onClick={() => setResultadoSeleccionado(null)}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 bg-slate-100 p-3 sm:p-5 overflow-auto">
              {resultadoSeleccionado.urlFirmada ? (
                esPDF(resultadoSeleccionado) ? (
                  <iframe
                    src={resultadoSeleccionado.urlFirmada}
                    title="Resultado PDF"
                    className="w-full h-[70vh] rounded-xl bg-white"
                  />
                ) : (
                  <div className="w-full min-h-[65vh] flex items-center justify-center">
                    <img
                      src={resultadoSeleccionado.urlFirmada}
                      alt={resultadoSeleccionado.titulo ?? "Resultado"}
                      className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-lg"
                    />
                  </div>
                )
              ) : (
                <div className="min-h-[60vh] flex items-center justify-center">
                  <div className="text-center">
                    <AlertCircle size={32} className="mx-auto text-rose-400 mb-3" />
                    <p className="text-sm font-semibold text-slate-600">
                      No se pudo generar la vista previa.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL ELIMINAR (solo administrador llega aquí) */}
      {resultadoAEliminar && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
              <Trash2 size={24} className="text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              ¿Eliminar resultado?
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Esta acción eliminará el archivo y su registro. No se puede
              deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setResultadoAEliminar(null)}
                disabled={eliminando}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminacion}
                disabled={eliminando}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {eliminando ? (
                  <Loader2 size={15} className="animate-spin" />
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