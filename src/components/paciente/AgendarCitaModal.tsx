"use client";

// ============================================================
// AgendarCitaModal (paciente)
// A diferencia del formulario público de /agendar, este vive
// DENTRO del dashboard del paciente ya logueado — no le pide
// nombre, cédula ni correo porque eso ya lo sabemos de su cuenta
// (idPaciente). Solo elige: servicio, doctor, fecha y hora.
// Reutiliza crearCita() de services/paciente.ts (ya existente) y
// obtenerHorariosDisponibles() para mostrar horas reales.
// ============================================================

import { useEffect, useState } from "react";
import { X, Loader2, AlertCircle, CalendarCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { crearCita } from "@/services/pacientes";
import { obtenerHorariosDisponibles, SlotDisponibilidad } from "@/services/disponibilidad";

interface DoctorOpcion {
  id: number;
  nombres: string;
  apellidos: string;
}

interface ServicioOpcion {
  id: number;
  nombre: string;
  precio: number;
}

export default function AgendarCitaModal({
  idPaciente,
  onClose,
  onGuardado,
}: {
  idPaciente: number;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const [doctores, setDoctores] = useState<DoctorOpcion[]>([]);
  const [servicios, setServicios] = useState<ServicioOpcion[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);

  const [form, setForm] = useState({
    id_servicio: "",
    id_doctor: "",
    fecha: "",
    hora: "",
    observacion: "",
  });

  const [slots, setSlots] = useState<SlotDisponibilidad[]>([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargarCatalogos() {
      const [{ data: d }, { data: s }] = await Promise.all([
        supabase.from("doctores").select("id, nombres, apellidos").eq("estado", true).order("nombres"),
        supabase.from("servicios").select("id, nombre, precio").eq("activo", true).order("nombre"),
      ]);
      setDoctores(d ?? []);
      setServicios(s ?? []);
      setCargandoCatalogos(false);
    }
    cargarCatalogos();
  }, []);

  useEffect(() => {
    if (!form.id_doctor || !form.fecha) {
      setSlots([]);
      return;
    }
    setCargandoSlots(true);
    obtenerHorariosDisponibles(Number(form.id_doctor), form.fecha)
      .then(setSlots)
      .finally(() => setCargandoSlots(false));
  }, [form.id_doctor, form.fecha]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.id_servicio || !form.id_doctor || !form.fecha || !form.hora) {
      setError("Completa servicio, doctor, fecha y hora antes de agendar.");
      return;
    }

    setGuardando(true);
    try {
      await crearCita({
        id_paciente: idPaciente,
        id_doctor: Number(form.id_doctor),
        id_servicio: Number(form.id_servicio),
        fecha: form.fecha,
        hora: form.hora,
        observacion: form.observacion,
      });
      onGuardado();
    } catch {
      setError(
        "No se pudo agendar. Es posible que ese horario ya se haya ocupado — elige otro e intenta de nuevo."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 sm:px-7 pt-6 sm:pt-7">
          <div>
            <h3 className="text-lg font-bold text-slate-800">Agendar Nueva Cita</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Solo elige lo que necesitas — el resto ya lo sabemos de tu cuenta.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {cargandoCatalogos ? (
          <div className="p-7 space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-11 rounded-xl bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Servicio</label>
              <select
                required
                value={form.id_servicio}
                onChange={(e) => setForm({ ...form, id_servicio: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
              >
                <option value="">Selecciona un servicio...</option>
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
                onChange={(e) => setForm({ ...form, id_doctor: e.target.value, hora: "" })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
              >
                <option value="">Selecciona un doctor...</option>
                {doctores.map((d) => (
                  <option key={d.id} value={d.id}>{d.nombres} {d.apellidos}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">Fecha</label>
              <input
                type="date"
                required
                value={form.fecha}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setForm({ ...form, fecha: e.target.value, hora: "" })}
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Hora disponible
              </label>
              {!form.id_doctor || !form.fecha ? (
                <p className="text-xs text-slate-400 italic py-2">
                  Elige doctor y fecha para ver los horarios disponibles.
                </p>
              ) : cargandoSlots ? (
                <div className="grid grid-cols-4 gap-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div key={i} className="h-9 rounded-lg bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <p className="text-xs text-rose-500 font-medium py-2">
                  No hay horarios disponibles ese día. Prueba con otra fecha.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((s) => (
                    <button
                      key={s.hora}
                      type="button"
                      disabled={!s.disponible}
                      onClick={() => setForm({ ...form, hora: s.hora })}
                      className={`py-2 rounded-lg text-xs font-semibold transition-colors ${
                        form.hora === s.hora
                          ? "bg-sky-600 text-white"
                          : s.disponible
                          ? "bg-slate-100 text-slate-700 hover:bg-sky-100"
                          : "bg-slate-50 text-slate-300 line-through cursor-not-allowed"
                      }`}
                    >
                      {s.hora}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1.5">
                Motivo o comentario <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <textarea
                rows={2}
                value={form.observacion}
                onChange={(e) => setForm({ ...form, observacion: e.target.value })}
                placeholder="Ej. Dolor en muela superior..."
                className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400 resize-none"
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
                disabled={guardando || !form.hora}
                className="flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }}
              >
                {guardando ? <Loader2 size={15} className="animate-spin" /> : <CalendarCheck size={15} />}
                Confirmar Cita
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}