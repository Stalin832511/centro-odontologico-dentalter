"use client";

import { useState } from "react";
import { X, Loader2, AlertCircle, Upload, FileImage } from "lucide-react";
import { subirRadiografia } from "@/services/radiografias";

const TIPOS = [
  "Panorámica",
  "Periapical",
  "Bitewing (aleta de mordida)",
  "Oclusal",
  "Cefalométrica",
  "Otra",
];

export default function SubirRadiografiaModal({
  idPaciente,
  onClose,
  onGuardado,
}: {
  idPaciente: number;
  onClose: () => void;
  onGuardado: () => void;
}) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [tipo, setTipo] = useState(TIPOS[0]);
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);

  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!archivo) {
      setError("Selecciona un archivo antes de subir.");
      return;
    }

    setSubiendo(true);
    try {
      await subirRadiografia({ idPaciente, archivo, tipo, descripcion, fecha });
      onGuardado();
    } catch {
      setError("No se pudo subir la radiografía. Intenta de nuevo.");
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 sm:px-7 pt-6 sm:pt-7">
          <h3 className="text-lg font-bold text-slate-800">Subir Radiografía</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Archivo</label>
            <label
              className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 rounded-xl py-6 cursor-pointer hover:border-cyan-300 hover:bg-cyan-50/30 transition-colors"
            >
              <input
                type="file"
                accept="image/*,.pdf"
                className="hidden"
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              />
              {archivo ? (
                <>
                  <FileImage size={22} className="text-cyan-600" />
                  <p className="text-xs font-semibold text-slate-700">{archivo.name}</p>
                </>
              ) : (
                <>
                  <Upload size={22} className="text-slate-400" />
                  <p className="text-xs text-slate-500">Clic para elegir imagen o PDF</p>
                </>
              )}
            </label>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">Fecha</label>
            <input
              type="date"
              required
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 block mb-1.5">
              Descripción <span className="text-slate-400 font-normal">(opcional)</span>
            </label>
            <textarea
              rows={2}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej. Control post-endodoncia pieza 36..."
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
              disabled={subiendo}
              className="flex-1 py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }}
            >
              {subiendo && <Loader2 size={15} className="animate-spin" />}
              Subir
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}