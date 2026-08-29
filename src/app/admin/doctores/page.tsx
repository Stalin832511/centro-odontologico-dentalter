"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { supabase } from "@/lib/supabase";
import { invitarMedico, reenviarInvitacionMedico, type Doctor } from "@/services/doctores";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Phone,
  Mail,
  IdCard,
  Stethoscope,
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserPlus,
  Send,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function DoctoresPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const [modalIntegrar, setModalIntegrar] = useState(false);
  const [doctorEditando, setDoctorEditando] = useState<Doctor | null>(null);
  const [doctorAEliminar, setDoctorAEliminar] = useState<Doctor | null>(null);
  const [eliminando, setEliminando] = useState(false);

  async function cargarDoctores() {
    setLoading(true);
    setError(null);

    const { data, error: err } = await supabase
      .from("doctores")
      .select("*")
      .order("nombres", { ascending: true });

    if (err) {
      setError("No pudimos cargar el listado de doctores.");
      setLoading(false);
      return;
    }

    setDoctores(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    cargarDoctores();
  }, []);

  const doctoresFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return doctores;
    return doctores.filter((d) =>
      `${d.nombres} ${d.apellidos} ${d.especialidad ?? ""} ${d.cedula ?? ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [busqueda, doctores]);

  async function confirmarEliminacion() {
    if (!doctorAEliminar) return;
    setEliminando(true);

    const { error: err } = await supabase.from("doctores").delete().eq("id", doctorAEliminar.id);
    setEliminando(false);

    if (err) {
      setError(
        err.message.includes("foreign key")
          ? "No se puede eliminar: este doctor tiene citas o historial asociado. Puedes desactivarlo en su lugar."
          : "No se pudo eliminar el doctor."
      );
      setDoctorAEliminar(null);
      return;
    }

    setDoctores((prev) => prev.filter((d) => d.id !== doctorAEliminar.id));
    setMensajeExito("Doctor eliminado.");
    setDoctorAEliminar(null);
    setTimeout(() => setMensajeExito(null), 3000);
  }

  async function alternarEstado(doctor: Doctor) {
    const { error: err } = await supabase
      .from("doctores")
      .update({ estado: !doctor.estado })
      .eq("id", doctor.id);

    if (err) {
      setError("No se pudo cambiar el estado del doctor.");
      return;
    }

    setDoctores((prev) =>
      prev.map((d) => (d.id === doctor.id ? { ...d, estado: !d.estado } : d))
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="flex">
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

              <div className="relative z-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3 md:mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <p className="uppercase tracking-[3px] text-[10px] sm:text-xs font-semibold text-cyan-300/90">
                      Equipo médico
                    </p>
                  </div>
                  <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-[42px] xl:text-5xl leading-[1.1] mb-3 tracking-tight">
                    Doctores
                  </h1>
                  <p className="text-slate-400 max-w-xl text-sm sm:text-[15px] leading-relaxed">
                    Integra nuevos especialistas y administra el equipo de la clínica.
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <p className="text-[11px] uppercase tracking-wider text-slate-500 mb-1">Total</p>
                  <p className="text-2xl font-bold text-white leading-none">{doctores.length}</p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    {doctores.filter((d) => d.estado).length} activos
                  </p>
                </div>
              </div>
            </motion.div>

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
              </div>
            )}

            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={1}
              className="bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-xl shadow-slate-200/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                  <Stethoscope size={20} className="text-cyan-600" />
                  Listado de Doctores
                </h2>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Buscar por nombre o especialidad..."
                      className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm w-56 sm:w-64 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-shadow"
                    />
                  </div>

                  <button
                    onClick={() => setModalIntegrar(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shrink-0"
                    style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }}
                  >
                    <UserPlus size={16} />
                    <span className="hidden sm:inline">Integrar Médico</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : doctoresFiltrados.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-sm font-semibold text-slate-600">
                    {busqueda ? "No se encontraron doctores con esa búsqueda" : "Aún no hay doctores registrados"}
                  </p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {doctoresFiltrados.map((d) => (
                    <div
                      key={d.id}
                      className="border border-slate-100 rounded-2xl p-5 hover:shadow-lg hover:border-cyan-100 transition-all"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {d.foto_url ? (
                          <img
                            src={d.foto_url}
                            alt={`${d.nombres} ${d.apellidos}`}
                            className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-slate-100"
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                            {d.nombres.charAt(0)}
                            {d.apellidos.charAt(0)}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">
                            {d.nombres} {d.apellidos}
                          </p>
                          <p className="text-xs text-cyan-600 font-semibold truncate">
                            {d.especialidad ?? "Sin especialidad"}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-500 mb-4">
                        {d.telefono && (
                          <p className="flex items-center gap-1.5">
                            <Phone size={12} className="text-slate-400" /> {d.telefono}
                          </p>
                        )}
                        {d.email && (
                          <p className="flex items-center gap-1.5 truncate">
                            <Mail size={12} className="text-slate-400 shrink-0" /> {d.email}
                          </p>
                        )}
                        {d.cedula && (
                          <p className="flex items-center gap-1.5">
                            <IdCard size={12} className="text-slate-400" /> {d.cedula}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                            d.estado ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {d.estado ? <ShieldCheck size={11} /> : <ShieldOff size={11} />}
                          {d.estado ? "Activo" : "Inactivo"}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {!d.id_usuario && (
                            <ReenviarBoton
                              doctor={d}
                              onExito={() => {
                                setMensajeExito("Invitación reenviada.");
                                setTimeout(() => setMensajeExito(null), 3000);
                              }}
                              onError={() => setError("No se pudo reenviar la invitación.")}
                            />
                          )}
                          <button
                            onClick={() => alternarEstado(d)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-amber-100 flex items-center justify-center transition-colors"
                            title={d.estado ? "Desactivar" : "Activar"}
                          >
                            {d.estado ? (
                              <ShieldOff size={14} className="text-slate-600" />
                            ) : (
                              <ShieldCheck size={14} className="text-slate-600" />
                            )}
                          </button>
                          <button
                            onClick={() => setDoctorEditando(d)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-cyan-100 flex items-center justify-center transition-colors"
                            title="Editar"
                          >
                            <Pencil size={14} className="text-slate-600" />
                          </button>
                          <button
                            onClick={() => setDoctorAEliminar(d)}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-100 flex items-center justify-center transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 size={14} className="text-slate-600" />
                          </button>
                        </div>
                      </div>

                      {!d.id_usuario && (
                        <p className="text-[11px] text-amber-600 mt-3 flex items-center gap-1">
                          <AlertCircle size={11} /> Aún no activó su cuenta
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </section>
      </div>

      {modalIntegrar && (
        <IntegrarMedicoModal
          onClose={() => setModalIntegrar(false)}
          onGuardado={() => {
            setModalIntegrar(false);
            setMensajeExito("Doctor integrado. Se le envió el enlace de activación a su correo.");
            cargarDoctores();
            setTimeout(() => setMensajeExito(null), 4000);
          }}
        />
      )}

      {doctorEditando && (
        <EditarDoctorModal
          doctor={doctorEditando}
          onClose={() => setDoctorEditando(null)}
          onGuardado={() => {
            setDoctorEditando(null);
            setMensajeExito("Doctor actualizado correctamente.");
            cargarDoctores();
            setTimeout(() => setMensajeExito(null), 3000);
          }}
        />
      )}

      {doctorAEliminar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
              <Trash2 size={24} className="text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">¿Eliminar este doctor?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Vas a eliminar a{" "}
              <span className="font-semibold text-slate-700">
                {doctorAEliminar.nombres} {doctorAEliminar.apellidos}
              </span>
              . Si tiene citas o historial asociado, considera desactivarlo en vez de eliminarlo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDoctorAEliminar(null)}
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
    </main>
  );
}

function ReenviarBoton({
  doctor,
  onExito,
  onError,
}: {
  doctor: Doctor;
  onExito: () => void;
  onError: () => void;
}) {
  const [enviando, setEnviando] = useState(false);

  async function handleClick() {
    setEnviando(true);
    try {
      await reenviarInvitacionMedico(doctor);
      onExito();
    } catch {
      onError();
    } finally {
      setEnviando(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={enviando}
      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-sky-100 flex items-center justify-center transition-colors disabled:opacity-60"
      title="Reenviar invitación"
    >
      {enviando ? <Loader2 size={14} className="animate-spin text-slate-600" /> : <Send size={14} className="text-slate-600" />}
    </button>
  );
}

// ============================================================
// Modal: Integrar médico nuevo
// ============================================================
function IntegrarMedicoModal({
  onClose,
  onGuardado,
}: {
  onClose: () => void;
  onGuardado: () => void;
}) {
  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    especialidad: "",
    cedula: "",
    colegio_numero: "",
    telefono: "",
    email: "",
    foto_url: "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    try {
      await invitarMedico(form);
      onGuardado();
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("cedula")
          ? "Ya existe un doctor registrado con esa cédula."
          : "No se pudo integrar al médico. Intenta de nuevo."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 sm:px-7 pt-6 sm:pt-7">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">Integrar Médico</h3>
            <p className="text-xs text-slate-400 mt-0.5">Se le enviará un enlace para crear su contraseña.</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
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
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Especialidad</label>
            <input
              required
              value={form.especialidad}
              onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
              placeholder="Ej: Ortodoncia y Estética Dental"
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                N° Colegio <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <input
                value={form.colegio_numero}
                onChange={(e) => setForm({ ...form, colegio_numero: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Teléfono</label>
            <input
              required
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Correo electrónico</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            />
            <p className="text-[11px] text-slate-400 mt-1.5">Aquí le llegará el enlace para crear su contraseña.</p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Foto <span className="text-slate-400 font-normal">(ruta de la imagen ya subida)</span>
            </label>
            <input
              value={form.foto_url}
              onChange={(e) => setForm({ ...form, foto_url: e.target.value })}
              placeholder="/imagenes/Dr_Nombre.png"
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
              Integrar y Enviar Invitación
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Modal: Editar doctor existente
// ============================================================
function EditarDoctorModal({
  doctor,
  onClose,
  onGuardado,
}: {
  doctor: Doctor;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const [form, setForm] = useState({
    nombres: doctor.nombres,
    apellidos: doctor.apellidos,
    especialidad: doctor.especialidad ?? "",
    cedula: doctor.cedula ?? "",
    colegio_numero: doctor.colegio_numero ?? "",
    telefono: doctor.telefono ?? "",
    email: doctor.email ?? "",
    foto_url: doctor.foto_url ?? "",
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardando(true);

    const { error: err } = await supabase
      .from("doctores")
      .update({
        nombres: form.nombres.trim(),
        apellidos: form.apellidos.trim(),
        especialidad: form.especialidad.trim() || null,
        cedula: form.cedula.trim() || null,
        colegio_numero: form.colegio_numero.trim() || null,
        telefono: form.telefono.trim() || null,
        email: form.email.trim() || null,
        foto_url: form.foto_url.trim() || null,
      })
      .eq("id", doctor.id);

    setGuardando(false);

    if (err) {
      setError("No se pudo guardar el cambio.");
      return;
    }

    onGuardado();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 sm:px-7 pt-6 sm:pt-7">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800">Editar Doctor</h3>
          <button onClick={onClose} className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
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
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Especialidad</label>
            <input
              value={form.especialidad}
              onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Cédula</label>
              <input
                maxLength={10}
                value={form.cedula}
                onChange={(e) => setForm({ ...form, cedula: e.target.value.replace(/\D/g, "") })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">N° Colegio</label>
              <input
                value={form.colegio_numero}
                onChange={(e) => setForm({ ...form, colegio_numero: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Teléfono</label>
            <input
              value={form.telefono}
              onChange={(e) => setForm({ ...form, telefono: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Correo</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            />
            <p className="text-[11px] text-amber-600 mt-1.5">
              Cambiar el correo aquí no actualiza su cuenta de acceso — solo el dato de contacto.
            </p>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Foto (ruta)</label>
            <input
              value={form.foto_url}
              onChange={(e) => setForm({ ...form, foto_url: e.target.value })}
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
