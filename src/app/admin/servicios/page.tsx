"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import {
  listarServicios,
  crearServicio,
  actualizarServicio,
  alternarActivoServicio,
  eliminarServicio,
  ServicioOdontologico,
  ServicioInput,
} from "@/services/servicios";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  DollarSign,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

function formatPrecio(precio: number) {
  return new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(precio);
}

export default function ServiciosPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [servicios, setServicios] = useState<ServicioOdontologico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");

  const [modalAbierto, setModalAbierto] = useState(false);
  const [servicioEditando, setServicioEditando] = useState<ServicioOdontologico | null>(null);
  const [servicioAEliminar, setServicioAEliminar] = useState<ServicioOdontologico | null>(null);
  const [eliminando, setEliminando] = useState(false);

  async function cargar() {
    setLoading(true);
    setError(null);
    try {
      const data = await listarServicios();
      setServicios(data);
    } catch {
      setError("No pudimos cargar el listado de servicios.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const serviciosFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return servicios;
    return servicios.filter((s) => s.nombre.toLowerCase().includes(q));
  }, [busqueda, servicios]);

  async function toggleActivo(s: ServicioOdontologico) {
    try {
      await alternarActivoServicio(s.id, !s.activo);
      setServicios((prev) =>
        prev.map((x) => (x.id === s.id ? { ...x, activo: !x.activo } : x))
      );
    } catch {
      setError("No se pudo cambiar el estado del servicio.");
    }
  }

  async function confirmarEliminacion() {
    if (!servicioAEliminar) return;
    setEliminando(true);
    try {
      await eliminarServicio(servicioAEliminar.id);
      setServicios((prev) => prev.filter((s) => s.id !== servicioAEliminar.id));
      setMensajeExito("Servicio eliminado correctamente.");
      setTimeout(() => setMensajeExito(null), 3000);
    } catch {
      setError(
        "No se pudo eliminar. Es posible que tenga citas asociadas — puedes desactivarlo en vez de eliminarlo."
      );
    } finally {
      setEliminando(false);
      setServicioAEliminar(null);
    }
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
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <p className="uppercase tracking-[3px] text-[10px] sm:text-xs font-semibold text-cyan-300/90">
                    Catálogo
                  </p>
                </div>
                <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-[42px] leading-[1.1] mb-3 tracking-tight">
                  Servicios
                </h1>
                <p className="text-slate-400 max-w-xl text-sm sm:text-[15px] leading-relaxed">
                  Gestiona los tratamientos disponibles, sus precios y su
                  visibilidad para agendar citas.
                </p>
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

            {/* LISTADO */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={1}
              className="bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-xl shadow-slate-200/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                  <ClipboardList size={20} className="text-cyan-600" />
                  Listado de Servicios
                </h2>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      placeholder="Buscar servicio..."
                      className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm w-56 sm:w-64 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setServicioEditando(null);
                      setModalAbierto(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold shrink-0"
                    style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }}
                  >
                    <Plus size={16} />
                    <span className="hidden sm:inline">Nuevo Servicio</span>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : serviciosFiltrados.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm font-semibold text-slate-600">
                    {busqueda ? "No se encontraron servicios con esa búsqueda" : "Aún no hay servicios registrados"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
                        <th className="pb-3 font-semibold">Servicio</th>
                        <th className="pb-3 font-semibold">Precio</th>
                        <th className="pb-3 font-semibold">Estado</th>
                        <th className="pb-3 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviciosFiltrados.map((s) => (
                        <tr
                          key={s.id}
                          className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="py-3.5">
                            <p className="font-semibold text-slate-700">{s.nombre}</p>
                            {s.descripcion && (
                              <p className="text-xs text-slate-400 mt-0.5 max-w-md truncate">
                                {s.descripcion}
                              </p>
                            )}
                          </td>
                          <td className="py-3.5 text-slate-600 font-semibold">
                            {formatPrecio(s.precio)}
                          </td>
                          <td className="py-3.5">
                            <button
                              onClick={() => toggleActivo(s)}
                              className={`text-[11px] font-semibold px-3 py-1.5 rounded-full transition-colors ${
                                s.activo
                                  ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                            >
                              {s.activo ? "Activo" : "Inactivo"}
                            </button>
                          </td>
                          <td className="py-3.5">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => {
                                  setServicioEditando(s);
                                  setModalAbierto(true);
                                }}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-cyan-100 flex items-center justify-center transition-colors"
                                title="Editar"
                              >
                                <Pencil size={14} className="text-slate-600" />
                              </button>
                              <button
                                onClick={() => setServicioAEliminar(s)}
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

      {modalAbierto && (
        <ServicioModal
          servicio={servicioEditando}
          onClose={() => setModalAbierto(false)}
          onGuardado={(mensaje) => {
            setModalAbierto(false);
            setMensajeExito(mensaje);
            cargar();
            setTimeout(() => setMensajeExito(null), 3000);
          }}
        />
      )}

      {servicioAEliminar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mb-4">
              <Trash2 size={24} className="text-rose-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">¿Eliminar servicio?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Vas a eliminar{" "}
              <span className="font-semibold text-slate-700">{servicioAEliminar.nombre}</span>.
              Si tiene citas asociadas, la eliminación puede ser rechazada — considera desactivarlo en vez de borrarlo.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setServicioAEliminar(null)}
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
// Modal: Crear / Editar servicio
// ============================================================
function ServicioModal({
  servicio,
  onClose,
  onGuardado,
}: {
  servicio: ServicioOdontologico | null;
  onClose: () => void;
  onGuardado: (mensaje: string) => void;
}) {
  const esEdicion = Boolean(servicio);

  const [form, setForm] = useState({
    nombre: servicio?.nombre ?? "",
    precio: servicio ? String(servicio.precio) : "",
    descripcion: servicio?.descripcion ?? "",
  });

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const precioNumero = Number(form.precio);
    if (isNaN(precioNumero) || precioNumero < 0) {
      setError("Ingresa un precio válido.");
      return;
    }

    setGuardando(true);

    const payload: ServicioInput = {
      nombre: form.nombre.trim(),
      precio: precioNumero,
      descripcion: form.descripcion.trim() || null,
    };

    try {
      if (esEdicion) {
        await actualizarServicio(servicio!.id, payload);
      } else {
        await crearServicio(payload);
      }
      onGuardado(esEdicion ? "Servicio actualizado correctamente." : "Servicio creado correctamente.");
    } catch {
      setError("No se pudo guardar el servicio. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 sm:px-7 pt-6 sm:pt-7">
          <h3 className="text-lg sm:text-xl font-bold text-slate-800">
            {esEdicion ? "Editar Servicio" : "Nuevo Servicio"}
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Nombre del servicio</label>
            <input
              required
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Limpieza dental, Endodoncia..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Precio</label>
            <div className="relative">
              <DollarSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="number"
                step="0.01"
                min="0"
                value={form.precio}
                onChange={(e) => setForm({ ...form, precio: e.target.value })}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Descripción <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
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
              {esEdicion ? "Guardar Cambios" : "Crear Servicio"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
