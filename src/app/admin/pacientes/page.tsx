"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import BuscadorHistoriaAdmin from "@/components/admin/BuscadorHistoriaAdmin";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Printer,
  Phone,
  Mail,
  IdCard,
  Clock,
  CalendarDays,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserRound,
  Stethoscope,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

// ============================================================
// Tipos
// ============================================================
interface Paciente {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  fecha_nacimiento: string | null;
}

interface CitaHoy {
  id: number;
  hora: string;
  estado: string;
  pacientes: { nombres: string; apellidos: string; telefono: string | null } | null;
  doctores: { nombres: string; apellidos: string } | null;
  servicios: { nombre: string } | null;
}

const ESTADO_ESTILOS: Record<string, { bg: string; text: string }> = {
  PENDIENTE: { bg: "bg-amber-50", text: "text-amber-700" },
  CONFIRMADA: { bg: "bg-emerald-50", text: "text-emerald-700" },
  ATENDIDA: { bg: "bg-slate-100", text: "text-slate-600" },
  CANCELADA: { bg: "bg-rose-50", text: "text-rose-700" },
};

function formatHora(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  const periodo = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${periodo}`;
}

// ============================================================
// Página principal
// ============================================================
export default function PacientesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [citasHoy, setCitasHoy] = useState<CitaHoy[]>([]);
  const [loadingPacientes, setLoadingPacientes] = useState(true);
  const [loadingAgenda, setLoadingAgenda] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [pacienteEditando, setPacienteEditando] = useState<Paciente | null>(null);
  const [pacienteAEliminar, setPacienteAEliminar] = useState<Paciente | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const hoyISO = new Date().toISOString().split("T")[0];

  // ------------------------------------------------------------
  // Cargar pacientes
  // ------------------------------------------------------------
  async function cargarPacientes() {
    setLoadingPacientes(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("pacientes")
      .select("id, cedula, nombres, apellidos, telefono, email, direccion, fecha_nacimiento")
      .order("nombres", { ascending: true });

    if (err) {
      setError("No pudimos cargar el listado de pacientes.");
      setLoadingPacientes(false);
      return;
    }

    setPacientes(data ?? []);
    setLoadingPacientes(false);
  }

  // ------------------------------------------------------------
  // Cargar agenda del día
  // ------------------------------------------------------------
  async function cargarAgendaHoy() {
    setLoadingAgenda(true);

    const { data, error: err } = await supabase
      .from("citas")
      .select(
        `id, hora, estado,
         pacientes ( nombres, apellidos, telefono ),
         doctores ( nombres, apellidos ),
         servicios ( nombre )`
      )
      .eq("fecha", hoyISO)
      .neq("estado", "CANCELADA")
      .order("hora", { ascending: true });

    if (!err) {
      setCitasHoy((data as unknown as CitaHoy[]) ?? []);
    }

    setLoadingAgenda(false);
  }

  useEffect(() => {
    cargarPacientes();
    cargarAgendaHoy();
  }, []);

  // ------------------------------------------------------------
  // Filtro de búsqueda (nombre, apellido, cédula, teléfono)
  // ------------------------------------------------------------
  const pacientesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return pacientes;
    return pacientes.filter((p) =>
      `${p.nombres} ${p.apellidos} ${p.cedula} ${p.telefono ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [busqueda, pacientes]);

  // ------------------------------------------------------------
  // Eliminar paciente
  // ------------------------------------------------------------
  async function confirmarEliminacion() {
    if (!pacienteAEliminar) return;
    setEliminando(true);

    const { error: err } = await supabase
      .from("pacientes")
      .delete()
      .eq("id", pacienteAEliminar.id);

    setEliminando(false);

    if (err) {
      setError("No se pudo eliminar el paciente. Puede tener citas o historial asociado.");
      setPacienteAEliminar(null);
      return;
    }

    setPacientes((prev) => prev.filter((p) => p.id !== pacienteAEliminar.id));
    setMensajeExito("Paciente eliminado correctamente.");
    setPacienteAEliminar(null);
    setTimeout(() => setMensajeExito(null), 3000);
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <section className="flex-1 min-w-0">
          <Topbar onMenuClick={() => setSidebarOpen(true)} />

          <div className="p-4 md:p-6 xl:p-8 max-w-[1600px] mx-auto">
            {/* ============ HERO ============ */}
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

              <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <p className="uppercase tracking-[3px] text-[10px] sm:text-xs font-semibold text-cyan-300/90">
                      Gestión de pacientes
                    </p>
                  </div>
                  <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-[42px] xl:text-5xl leading-[1.1] mb-3 tracking-tight">
                    Pacientes y Agenda del Día
                  </h1>
                  <p className="text-slate-400 max-w-xl text-sm sm:text-[15px] leading-relaxed">
                    Consulta, registra y edita pacientes, y revisa quién tiene
                    cita hoy en la clínica.
                  </p>
                </div>

                <div className="flex gap-6 md:gap-8 shrink-0">
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">Hoy</p>
                    <p className="text-2xl font-bold text-white leading-none">{citasHoy.length}</p>
                    <p className="text-[11px] text-slate-500 mt-1">citas agendadas</p>
                  </div>
                  <div className="w-px bg-white/10" />
                  <div className="text-right">
                    <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">Total</p>
                    <p className="text-2xl font-bold text-white leading-none">{pacientes.length}</p>
                    <p className="text-[11px] text-slate-500 mt-1">pacientes</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* ============ MENSAJES ============ */}
            {mensajeExito && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3.5 print:hidden">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                <p className="text-sm text-emerald-700 font-medium">{mensajeExito}</p>
              </div>
            )}
            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5 print:hidden">
                <AlertCircle size={18} className="text-rose-500 shrink-0" />
                <p className="text-sm text-rose-700 font-medium">{error}</p>
              </div>
            )}

            {/* ============ AGENDA DE HOY ============ */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={1}
              className="bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-xl shadow-slate-200/50 mb-6"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                  <CalendarDays size={20} className="text-cyan-600" />
                  Agenda de Hoy
                </h2>
                <button
                  onClick={() => window.print()}
                  className="print:hidden flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-cyan-600 transition-colors px-3 py-2 rounded-xl hover:bg-slate-50"
                >
                  <Printer size={15} />
                  Imprimir agenda
                </button>
              </div>

              {loadingAgenda ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : citasHoy.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm font-semibold text-slate-600">No hay citas agendadas para hoy</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Las citas del día aparecerán aquí automáticamente.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
                        <th className="pb-3 font-semibold">Hora</th>
                        <th className="pb-3 font-semibold">Paciente</th>
                        <th className="pb-3 font-semibold">Doctor</th>
                        <th className="pb-3 font-semibold">Servicio</th>
                        <th className="pb-3 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {citasHoy.map((c) => (
                        <tr key={c.id} className="border-b border-slate-50 last:border-0">
                          <td className="py-3.5 font-semibold text-slate-700 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              <Clock size={13} className="text-slate-400" />
                              {formatHora(c.hora)}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-700">
                            {c.pacientes ? `${c.pacientes.nombres} ${c.pacientes.apellidos}` : "—"}
                          </td>
                          <td className="py-3.5 text-slate-500">
                            {c.doctores ? `${c.doctores.nombres} ${c.doctores.apellidos}` : "—"}
                          </td>
                          <td className="py-3.5 text-slate-500">{c.servicios?.nombre ?? "—"}</td>
                          <td className="py-3.5">
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                                ESTADO_ESTILOS[c.estado]?.bg ?? "bg-slate-100"
                              } ${ESTADO_ESTILOS[c.estado]?.text ?? "text-slate-600"}`}
                            >
                              {c.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>

            {/* ============ LISTADO DE PACIENTES ============ */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={2}
              className="bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-xl shadow-slate-200/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                  <UserRound size={20} className="text-cyan-600" />
                  Listado de Pacientes
                </h2>

                <div className="flex flex-wrap items-center gap-3 print:hidden">
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Buscar por nombre, cédula o teléfono..."
                      className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm w-56 sm:w-64 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-shadow"
                    />
                  </div>

                  <BuscadorHistoriaAdmin />

                  <button
                    onClick={() => window.print()}
                    className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors shrink-0"
                    title="Imprimir listado"
                  >
                    <Printer size={16} className="text-slate-600" />
                  </button>

                  <button
                    onClick={() => {
                      setPacienteEditando(null);
                      setModalAbierto(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shrink-0"
                    style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }}
                  >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Nuevo Paciente</span>
                  </button>
                </div>
              </div>

              {loadingPacientes ? (
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : pacientesFiltrados.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm font-semibold text-slate-600">
                    {busqueda ? "No se encontraron pacientes con esa búsqueda" : "Aún no hay pacientes registrados"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
                        <th className="pb-3 font-semibold">Paciente</th>
                        <th className="pb-3 font-semibold">Cédula</th>
                        <th className="pb-3 font-semibold">Teléfono</th>
                        <th className="pb-3 font-semibold">Correo</th>
                        <th className="pb-3 font-semibold text-right print:hidden">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pacientesFiltrados.map((p) => (
                        <tr key={p.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors">
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {p.nombres.charAt(0)}
                                {p.apellidos.charAt(0)}
                              </div>
                              <span className="font-semibold text-slate-700">
                                {p.nombres} {p.apellidos}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <IdCard size={13} className="text-slate-400" />
                              {p.cedula}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-500">
                            {p.telefono ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Phone size={13} className="text-slate-400" />
                                {p.telefono}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="py-3.5 text-slate-500">
                            {p.email ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Mail size={13} className="text-slate-400" />
                                {p.email}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs italic">Sin correo</span>
                            )}
                          </td>
                          <td className="py-3.5 print:hidden">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setPacienteEditando(p);
                                  setModalAbierto(true);
                                }}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-cyan-100 flex items-center justify-center transition-colors"
                                title="Editar"
                              >
                                <Pencil size={14} className="text-slate-600" />
                              </button>
                              <button
                                onClick={() => setPacienteAEliminar(p)}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-100 flex items-center justify-center transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 size={14} className="text-slate-600" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      </div>

      {/* ============ MODAL CREAR / EDITAR ============ */}
      {modalAbierto && (
        <PacienteModal
          paciente={pacienteEditando}
          onClose={() => setModalAbierto(false)}
          onGuardado={(mensaje) => {
            setModalAbierto(false);
            setMensajeExito(mensaje);
            cargarPacientes();
            setTimeout(() => setMensajeExito(null), 3000);
          }}
        />
      )}

      {/* ============ CONFIRMAR ELIMINACIÓN ============ */}
      {pacienteAEliminar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
              <Trash2 size={24} className="text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">¿Eliminar paciente?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Vas a eliminar a{" "}
              <span className="font-semibold text-slate-700">
                {pacienteAEliminar.nombres} {pacienteAEliminar.apellidos}
              </span>
              . Esta acción no se puede deshacer. Si tiene citas o historial
              clínico asociado, la eliminación puede ser rechazada para
              proteger esos registros.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPacienteAEliminar(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminacion}
                disabled={eliminando}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {eliminando ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// ============================================================
// Modal de Crear / Editar paciente
// ============================================================
function PacienteModal({
  paciente,
  onClose,
  onGuardado,
}: {
  paciente: Paciente | null;
  onClose: () => void;
  onGuardado: (mensaje: string) => void;
}) {
  const esEdicion = Boolean(paciente);

  const [form, setForm] = useState({
    nombres: paciente?.nombres ?? "",
    apellidos: paciente?.apellidos ?? "",
    cedula: paciente?.cedula ?? "",
    telefono: paciente?.telefono ?? "",
    email: paciente?.email ?? "",
    direccion: paciente?.direccion ?? "",
    fecha_nacimiento: paciente?.fecha_nacimiento ?? "",
  });

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    const payload = {
      nombres: form.nombres.trim(),
      apellidos: form.apellidos.trim(),
      cedula: form.cedula.trim(),
      telefono: form.telefono.trim() || null,
      email: form.email.trim() || null,
      direccion: form.direccion.trim() || null,
      fecha_nacimiento: form.fecha_nacimiento || null,
    };

    const resultado = esEdicion
      ? await supabase.from("pacientes").update(payload).eq("id", paciente!.id)
      : await supabase.from("pacientes").insert(payload);

    setGuardando(false);

    if (resultado.error) {
      setError(
        resultado.error.message.includes("cedula")
          ? "Ya existe un paciente registrado con esa cédula."
          : "No se pudo guardar el paciente. Intenta de nuevo."
      );
      return;
    }

    onGuardado(esEdicion ? "Paciente actualizado correctamente." : "Paciente registrado correctamente.");
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm print:hidden">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 sm:px-7 pt-6 sm:pt-7">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800">
            {esEdicion ? "Editar Paciente" : "Nuevo Paciente"}
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Nombres</label>
              <input
                required
                value={form.nombres}
                onChange={(e) => setForm({ ...form, nombres: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Apellidos</label>
              <input
                required
                value={form.apellidos}
                onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Cédula</label>
            <input
              required
              maxLength={10}
              value={form.cedula}
              onChange={(e) => setForm({ ...form, cedula: e.target.value.replace(/\D/g, "") })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Teléfono</label>
              <input
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                value={form.fecha_nacimiento}
                onChange={(e) => setForm({ ...form, fecha_nacimiento: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Correo <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Dirección <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <input
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 px-3.5 py-3">
              <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }}
            >
              {guardando && <Loader2 size={15} className="animate-spin" />}
              {esEdicion ? "Guardar Cambios" : "Registrar Paciente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
