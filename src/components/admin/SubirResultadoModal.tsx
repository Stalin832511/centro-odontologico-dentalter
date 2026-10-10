"use client";

import { useState } from "react";
import { X, Loader2, FileText, AlertCircle } from "lucide-react";
import { subirResultado, TipoResultado } from "@/services/resultados";

interface Props {
  idPaciente: number;
  tipos: TipoResultado[];
  onClose: () => void;
  onGuardado: () => void;
}

export default function SubirResultadoModal({
  idPaciente,
  tipos,
  onClose,
  onGuardado,
}: Props) {
  const [idTipo, setIdTipo] = useState<number | "">(tipos[0]?.id ?? "");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!idTipo) return;

    setGuardando(true);
    setError(null);

    try {
      await subirResultado({
        idPaciente,
        idTipoResultado: Number(idTipo),
        archivo,
        titulo,
        descripcion,
        fecha,
      });
      onGuardado();
    } catch (err) {
      console.error(err);
      setError("No se pudo guardar el resultado.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6">
          <h3 className="text-lg font-bold text-slate-800">Subir resultado</h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Tipo de resultado
            </label>
            <select
              value={idTipo}
              onChange={(e) => setIdTipo(Number(e.target.value))}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40"
            >
              {tipos.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Título
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej. Biometría hemática"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Archivo (opcional para avances sin documento)
            </label>
            <label className="flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-cyan-300">
              <FileText size={18} className="text-slate-400 shrink-0" />
              <span className="text-sm text-slate-500 truncate">
                {archivo ? archivo.name : "Seleccionar archivo…"}
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => setArchivo(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              Descripción
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 resize-none"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-600 text-sm">
              <AlertCircle size={15} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={guardando || !idTipo}
            className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }}
          >
            {guardando && <Loader2 size={16} className="animate-spin" />}
            Guardar resultado
          </button>
        </form>
      </div>
    </div>
  );
}