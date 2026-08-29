"use client";

// ============================================================
// NuevaConsultaModal
// Formulario para que el médico registre una consulta completa:
// diagnóstico, tratamiento, observaciones y 0..N medicamentos
// recetados. Usa registrarConsulta() de services/historiaClinica.ts
// (ya construido) y obtenerIdDoctorActual() de services/medico.ts.
// ============================================================

import { useState } from "react";
import { X, Loader2, AlertCircle, Plus, Trash2, Pill } from "lucide-react";
import { registrarConsulta, RecetaInput } from "@/services/historiaClinica";
import { obtenerIdDoctorActual, PacienteDelMedico } from "@/services/medico";

const RECETA_VACIA: RecetaInput = {
  medicamento: "",
  dosis: "",
  frecuencia: "",
  duracion: "",
};

export default function NuevaConsultaModal({
  paciente,
  onClose,
  onGuardado,
}: {
  paciente: PacienteDelMedico;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const [diagnostico, setDiagnostico] = useState("");
  const [tratamiento, setTratamiento] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [recetas, setRecetas] = useState<RecetaInput[]>([]);

  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function agregarReceta() {
    setRecetas((prev) => [...prev, { ...RECETA_VACIA }]);
  }

  function actualizarReceta(index: number, campo: keyof RecetaInput, valor: string) {
    setRecetas((prev) =>
      prev.map((r, i) => (i === index ? { ...r, [campo]: valor } : r))
    );
  }

  function quitarReceta(index: number) {
    setRecetas((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!diagnostico.trim() && !tratamiento.trim()) {
      setError("Escribe al menos el diagnóstico o el tratamiento antes de guardar.");
      return;
    }

    setGuardando(true);
    try {
      const idDoctor = await obtenerIdDoctorActual();

      await registrarConsulta({
        idPaciente: paciente.id,
        idDoctor,
        diagnostico: diagnostico.trim(),
        tratamiento: tratamiento.trim(),
        observaciones: observaciones.trim(),
        recetas,
      });

      onGuardado();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo guardar la consulta. Intenta de nuevo."
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 sm:px-7 pt-6 sm:pt-7">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-800">
              Nueva Consulta
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Paciente: {paciente.nombres} {paciente.apellidos}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Diagnóstico
            </label>
            <textarea
              rows={2}
              value={diagnostico}
              onChange={(e) => setDiagnostico(e.target.value)}
              placeholder="Ej. Caries en pieza 36, gingivitis leve..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Tratamiento
            </label>
            <textarea
              rows={2}
              value={tratamiento}
              onChange={(e) => setTratamiento(e.target.value)}
              placeholder="Ej. Obturación con resina, control en 15 días..."
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Observaciones{" "}
              <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 resize-none"
            />
          </div>

          {/* RECETAS */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Pill size={14} className="text-cyan-600" />
                Receta médica{" "}
                <span className="text-slate-400 font-normal">(opcional)</span>
              </label>
              <button
                type="button"
                onClick={agregarReceta}
                className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 hover:text-cyan-700"
              >
                <Plus size={14} />
                Agregar medicamento
              </button>
            </div>

            {recetas.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Sin medicamentos recetados en esta consulta.
              </p>
            ) : (
              <div className="space-y-3">
                {recetas.map((r, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 rounded-xl p-3 relative"
                  >
                    <input
                      value={r.medicamento}
                      onChange={(e) => actualizarReceta(i, "medicamento", e.target.value)}
                      placeholder="Medicamento"
                      className="col-span-2 sm:col-span-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-cyan-400/40"
                    />
                    <input
                      value={r.dosis}
                      onChange={(e) => actualizarReceta(i, "dosis", e.target.value)}
                      placeholder="Dosis"
                      className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-cyan-400/40"
                    />
                    <input
                      value={r.frecuencia}
                      onChange={(e) => actualizarReceta(i, "frecuencia", e.target.value)}
                      placeholder="Frecuencia"
                      className="rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-cyan-400/40"
                    />
                    <div className="flex gap-1.5">
                      <input
                        value={r.duracion}
                        onChange={(e) => actualizarReceta(i, "duracion", e.target.value)}
                        placeholder="Duración"
                        className="flex-1 rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none focus:ring-2 focus:ring-cyan-400/40"
                      />
                      <button
                        type="button"
                        onClick={() => quitarReceta(i)}
                        className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-rose-50 shrink-0"
                        title="Quitar"
                      >
                        <Trash2 size={13} className="text-rose-500" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
              Guardar Consulta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}