"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Eye,
  Pencil,
  Trash2,
  Search,
  Plus,
  Printer,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ============================================================
// Tipos
// ============================================================
interface CitaFila {
  id: number;
  fecha: string;
  hora: string;
  estado: string;
  observacion: string | null;
  id_paciente: number;
  id_doctor: number;
  id_servicio: number;
  paciente_nombre: string;
  paciente_telefono: string | null;
  doctor_nombre: string;
  servicio_nombre: string;
}

interface Doctor {
  id: number;
  nombres: string;
  apellidos: string;
}

interface Servicio {
  id: number;
  nombre: string;
}

interface PacienteBusqueda {
  id: number;
  nombres: string;
  apellidos: string;
  cedula: string;
}

const ESTADOS = ["PENDIENTE", "CONFIRMADA", "ATENDIDA", "CANCELADA"] as const;

const ESTADO_ESTILOS: Record<string, string> = {
  PENDIENTE: "bg-orange-100 text-orange-700",
  CONFIRMADA: "bg-green-100 text-green-700",
  ATENDIDA: "bg-slate-200 text-slate-600",
  CANCELADA: "bg-red-100 text-red-700",
};

function formatFecha(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatHora(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  const periodo = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${periodo}`;
}

export default function TablaCitas() {
  const [citas, setCitas] = useState<CitaFila[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);

  const [citaViendo, setCitaViendo] = useState<CitaFila | null>(null);
  const [citaEditando, setCitaEditando] = useState<CitaFila | null>(null);
  const [creandoNueva, setCreandoNueva] = useState(false);
  const [citaAEliminar, setCitaAEliminar] = useState<CitaFila | null>(null);
  const [eliminando, setEliminando] = useState(false);

  // ------------------------------------------------------------
  // Cargar citas (con datos de paciente/doctor/servicio)
  // ------------------------------------------------------------
  async function cargarCitas() {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("citas")
      .select(
        `id, fecha, hora, estado, observacion, id_paciente, id_doctor, id_servicio,
         pacientes ( nombres, apellidos, telefono ),
         doctores ( nombres, apellidos ),
         servicios ( nombre )`
      )
      .order("fecha", { ascending: false })
      .order("hora", { ascending: false })
      .limit(200);

    if (err || !data) {
      setError("No pudimos cargar el listado de citas.");
      setLoading(false);
      return;
    }

    setCitas(
      (data as any[]).map((c) => ({
        id: c.id,
        fecha: c.fecha,
        hora: c.hora,
        estado: c.estado,
        observacion: c.observacion,
        id_paciente: c.id_paciente,
        id_doctor: c.id_doctor,
        id_servicio: c.id_servicio,
        paciente_nombre: c.pacientes ? `${c.pacientes.nombres} ${c.pacientes.apellidos}` : "—",
        paciente_telefono: c.pacientes?.telefono ?? null,
        doctor_nombre: c.doctores ? `${c.doctores.nombres} ${c.doctores.apellidos}` : "—",
        servicio_nombre: c.servicios?.nombre ?? "—",
      }))
    );
    setLoading(false);
  }

  async function cargarCatalogos() {
    const [{ data: d }, { data: s }] = await Promise.all([
      supabase.from("doctores").select("id, nombres, apellidos").eq("estado", true).order("nombres"),
      supabase.from("servicios").select("id, nombre").eq("activo", true).order("nombre"),
    ]);
    setDoctores(d ?? []);
    setServicios(s ?? []);
  }

  useEffect(() => {
    cargarCitas();
    cargarCatalogos();
  }, []);

  const citasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return citas;
    return citas.filter((c) =>
      `${c.paciente_nombre} ${c.doctor_nombre} ${c.servicio_nombre}`.toLowerCase().includes(q)
    );
  }, [busqueda, citas]);

  async function confirmarEliminacion() {
    if (!citaAEliminar) return;
    setEliminando(true);
    const { error: err } = await supabase.from("citas").delete().eq("id", citaAEliminar.id);
    setEliminando(false);

    if (err) {
      setError("No se pudo eliminar la cita.");
      setCitaAEliminar(null);
      return;
    }

    setCitas((prev) => prev.filter((c) => c.id !== citaAEliminar.id));
    setMensajeExito("Cita eliminada.");
    setCitaAEliminar(null);
    setTimeout(() => setMensajeExito(null), 3000);
  }

  return (
    <div className="bg-white rounded-[32px] shadow-xl p-6">
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row gap-5 justify-between mb-8 print:hidden">
        <div>
          <h2 className="text-3xl font-black text-slate-800">Gestión de Citas</h2>
          <p className="text-slate-500">Administración completa de reservas</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => window.print()}
            className="px-5 py-3 rounded-2xl bg-slate-100 flex items-center gap-2 hover:bg-slate-200 transition-colors"
          >
            <Printer size={18} />
            Imprimir
          </button>

          <button
            onClick={() => setCreandoNueva(true)}
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-600 text-white flex items-center gap-2"
          >
            <Plus size={18} />
            Nueva Cita
          </button>
        </div>
      </div>

      {/* MENSAJES */}
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

      {/* BUSCADOR */}
      <div className="relative mb-6 print:hidden">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar por paciente, doctor o servicio..."
          className="w-full bg-slate-100 rounded-2xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-cyan-400"
        />
      </div>

      {/* TABLA */}
      {loading ? (
        <div className="space-y-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : citasFiltradas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm font-semibold text-slate-600">
            {busqueda ? "No se encontraron citas con esa búsqueda" : "Aún no hay citas registradas"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-4">Paciente</th>
                <th className="text-left py-4">Doctor</th>
                <th className="text-left py-4">Servicio</th>
                <th className="text-left py-4">Fecha</th>
                <th className="text-left py-4">Hora</th>
                <th className="text-left py-4">Estado</th>
                <th className="text-center py-4 print:hidden">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {citasFiltradas.map((cita) => (
                <tr key={cita.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-5 font-semibold">{cita.paciente_nombre}</td>
                  <td>{cita.doctor_nombre}</td>
                  <td>{cita.servicio_nombre}</td>
                  <td>{formatFecha(cita.fecha)}</td>
                  <td>{formatHora(cita.hora)}</td>
                  <td>
                    <span className={`px-4 py-2 rounded-full text-sm ${ESTADO_ESTILOS[cita.estado] ?? "bg-slate-100 text-slate-600"}`}>
                      {cita.estado}
                    </span>
                  </td>
                  <td className="print:hidden">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => setCitaViendo(cita)}
                        className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center"
                        title="Ver detalle"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => setCitaEditando(cita)}
                        className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center"
                        title="Editar / reasignar"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => setCitaAEliminar(cita)}
                        className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL VER DETALLE */}
      {citaViendo && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-7">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-slate-800">Detalle de la cita</h3>
              <button onClick={() => setCitaViendo(null)} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <DetalleFila label="Paciente" valor={citaViendo.paciente_nombre} />
              <DetalleFila label="Teléfono" valor={citaViendo.paciente_telefono ?? "No registrado"} />
              <DetalleFila label="Doctor" valor={citaViendo.doctor_nombre} />
              <DetalleFila label="Servicio" valor={citaViendo.servicio_nombre} />
              <DetalleFila label="Fecha" valor={formatFecha(citaViendo.fecha)} />
              <DetalleFila label="Hora" valor={formatHora(citaViendo.hora)} />
              <DetalleFila label="Estado" valor={citaViendo.estado} />
              <DetalleFila label="Observaciones" valor={citaViendo.observacion || "Sin observaciones"} />
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR / REASIGNAR */}
      {citaEditando && (
        <EditarCitaModal
          cita={citaEditando}
          doctores={doctores}
          onClose={() => setCitaEditando(null)}
          onGuardado={() => {
            setCitaEditando(null);
            setMensajeExito("Cita actualizada correctamente.");
            cargarCitas();
            setTimeout(() => setMensajeExito(null), 3000);
          }}
        />
      )}

      {/* MODAL NUEVA CITA */}
      {creandoNueva && (
        <NuevaCitaModal
          doctores={doctores}
          servicios={servicios}
          onClose={() => setCreandoNueva(false)}
          onGuardado={() => {
            setCreandoNueva(false);
            setMensajeExito("Cita creada correctamente.");
            cargarCitas();
            setTimeout(() => setMensajeExito(null), 3000);
          }}
        />
      )}

      {/* CONFIRMAR ELIMINACIÓN */}
      {citaAEliminar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm print:hidden">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
              <Trash2 size={24} className="text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">¿Eliminar esta cita?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Cita de <span className="font-semibold text-slate-700">{citaAEliminar.paciente_nombre}</span> el{" "}
              {formatFecha(citaAEliminar.fecha)} a las {formatHora(citaAEliminar.hora)}. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCitaAEliminar(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarEliminacion}
                disabled={eliminando}
                className="flex-1 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {eliminando ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetalleFila({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
      <span className="text-slate-400 font-medium shrink-0">{label}</span>
      <span className="text-slate-700 font-semibold text-right">{valor}</span>
    </div>
  );
}

// ============================================================
// Modal: Editar / Reasignar cita
// ============================================================
function EditarCitaModal({
  cita,
  doctores,
  onClose,
  onGuardado,
}: {
  cita: CitaFila;
  doctores: Doctor[];
  onClose: () => void;
  onGuardado: () => void;
}) {
  const [form, setForm] = useState({
    id_doctor: String(cita.id_doctor),
    fecha: cita.fecha,
    hora: cita.hora,
    estado: cita.estado,
    observacion: cita.observacion ?? "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);

    const { error: err } = await supabase
      .from("citas")
      .update({
        id_doctor: Number(form.id_doctor),
        fecha: form.fecha,
        hora: form.hora,
        estado: form.estado,
        observacion: form.observacion || null,
      })
      .eq("id", cita.id);

    setGuardando(false);

    if (err) {
      setError(
        err.message.includes("citas_doctor_horario_unico")
          ? "Ese doctor ya tiene otra cita en ese horario exacto. Elige otra hora."
          : "No se pudo guardar el cambio."
      );
      return;
    }

    onGuardado();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm print:hidden">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 sm:px-7 pt-6 sm:pt-7">
          <h3 className="text-lg font-bold text-slate-800">Editar cita — {cita.paciente_nombre}</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Doctor</label>
            <select
              required
              value={form.id_doctor}
              onChange={(e) => setForm({ ...form, id_doctor: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            >
              {doctores.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nombres} {d.apellidos}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Cambiar esto reasigna la cita a otro doctor ("derivar").
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Fecha</label>
              <input
                type="date"
                required
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Hora</label>
              <input
                type="time"
                required
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Estado</label>
            <select
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            >
              {ESTADOS.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Observaciones</label>
            <textarea
              rows={3}
              value={form.observacion}
              onChange={(e) => setForm({ ...form, observacion: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 px-3.5 py-3">
              <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }}
            >
              {guardando && <Loader2 size={15} className="animate-spin" />}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Modal: Nueva cita (para un paciente ya existente)
// ============================================================
function NuevaCitaModal({
  doctores,
  servicios,
  onClose,
  onGuardado,
}: {
  doctores: Doctor[];
  servicios: Servicio[];
  onClose: () => void;
  onGuardado: () => void;
}) {
  const [buscarPaciente, setBuscarPaciente] = useState("");
  const [resultados, setResultados] = useState<PacienteBusqueda[]>([]);
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState<PacienteBusqueda | null>(null);
  const [buscando, setBuscando] = useState(false);

  const [form, setForm] = useState({
    id_doctor: doctores[0] ? String(doctores[0].id) : "",
    id_servicio: servicios[0] ? String(servicios[0].id) : "",
    fecha: "",
    hora: "",
    observacion: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const q = buscarPaciente.trim();
    if (q.length < 2) {
      setResultados([]);
      return;
    }
    setBuscando(true);
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from("pacientes")
        .select("id, nombres, apellidos, cedula")
        .or(`nombres.ilike.%${q}%,apellidos.ilike.%${q}%,cedula.ilike.%${q}%`)
        .limit(6);
      setResultados(data ?? []);
      setBuscando(false);
    }, 350);
    return () => clearTimeout(timeout);
  }, [buscarPaciente]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pacienteSeleccionado) {
      setError("Selecciona un paciente de la lista.");
      return;
    }
    setError(null);
    setGuardando(true);

    const { error: err } = await supabase.from("citas").insert({
      id_paciente: pacienteSeleccionado.id,
      id_doctor: Number(form.id_doctor),
      id_servicio: Number(form.id_servicio),
      fecha: form.fecha,
      hora: form.hora,
      observacion: form.observacion || null,
    });

    setGuardando(false);

    if (err) {
      setError(
        err.message.includes("citas_doctor_horario_unico")
          ? "Ese doctor ya tiene otra cita en ese horario exacto."
          : "No se pudo crear la cita."
      );
      return;
    }

    onGuardado();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm print:hidden">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 sm:px-7 pt-6 sm:pt-7">
          <h3 className="text-lg font-bold text-slate-800">Nueva Cita</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Paciente</label>
            {pacienteSeleccionado ? (
              <div className="flex items-center justify-between rounded-xl border border-cyan-200 bg-cyan-50 px-3.5 py-2.5">
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <User size={14} className="text-cyan-600" />
                  {pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPacienteSeleccionado(null);
                    setBuscarPaciente("");
                  }}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="relative">
                <input
                  value={buscarPaciente}
                  onChange={(e) => setBuscarPaciente(e.target.value)}
                  placeholder="Busca por nombre o cédula..."
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
                />
                {(resultados.length > 0 || buscando) && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
                    {buscando ? (
                      <p className="px-3.5 py-2.5 text-xs text-slate-400">Buscando…</p>
                    ) : (
                      resultados.map((p) => (
                        <button
                          type="button"
                          key={p.id}
                          onClick={() => {
                            setPacienteSeleccionado(p);
                            setResultados([]);
                          }}
                          className="w-full text-left px-3.5 py-2.5 text-sm hover:bg-slate-50 border-b border-slate-50 last:border-0"
                        >
                          <span className="font-semibold text-slate-700">{p.nombres} {p.apellidos}</span>
                          <span className="text-slate-400 text-xs ml-2">{p.cedula}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Servicio</label>
            <select
              required
              value={form.id_servicio}
              onChange={(e) => setForm({ ...form, id_servicio: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            >
              {servicios.map((s) => (
                <option key={s.id} value={s.id}>{s.nombre}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Doctor</label>
            <select
              required
              value={form.id_doctor}
              onChange={(e) => setForm({ ...form, id_doctor: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            >
              {doctores.map((d) => (
                <option key={d.id} value={d.id}>{d.nombres} {d.apellidos}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Fecha</label>
              <input
                type="date"
                required
                value={form.fecha}
                onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Hora</label>
              <input
                type="time"
                required
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Observaciones</label>
            <textarea
              rows={3}
              value={form.observacion}
              onChange={(e) => setForm({ ...form, observacion: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-rose-50 border border-rose-100 px-3.5 py-3">
              <AlertCircle size={15} className="text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 font-medium">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }}
            >
              {guardando && <Loader2 size={15} className="animate-spin" />}
              Crear Cita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
