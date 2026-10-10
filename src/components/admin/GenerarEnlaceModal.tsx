"use client";

import { useState } from "react";
import { X, Loader2, Copy, CheckCircle2, Link as LinkIcon } from "lucide-react";
import { generarTokenCarga } from "@/services/tokensCarga";
import type { TipoResultado, EntidadReferente } from "@/services/resultados";

interface Props {
  idPaciente: number;
  tipos: TipoResultado[];
  entidades: EntidadReferente[];
  onClose: () => void;
}

export default function GenerarEnlaceModal({
  idPaciente,
  tipos,
  entidades,
  onClose,
}: Props) {
  const [idTipo, setIdTipo] = useState<number | "">(tipos[0]?.id ?? "");
  const [idEntidad, setIdEntidad] = useState<number | "">("");
  const [dias, setDias] = useState(7);
  const [generando, setGenerando] = useState(false);
  const [urlGenerada, setUrlGenerada] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  async function handleGenerar() {
    if (!idTipo) return;
    setGenerando(true);
    try {
      const { url } = await generarTokenCarga({
        idPaciente,
        idTipoResultado: Number(idTipo),
        idEntidadReferente: idEntidad ? Number(idEntidad) : null,
        diasValidez: dias,
      });
      setUrlGenerada(url);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerando(false);
    }
  }

  function copiar() {
    if (!urlGenerada) return;
    navigator.clipboard.writeText(urlGenerada);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 pt-6">
          <h3 className="text-lg font-bold text-slate-800">
            Generar enlace para externo
          </h3>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!urlGenerada ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Tipo de resultado que se espera
                </label>
                <select
                  value={idTipo}
                  onChange={(e) => setIdTipo(Number(e.target.value))}
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
                  Centro/laboratorio (opcional)
                </label>
                <select
                  value={idEntidad}
                  onChange={(e) => setIdEntidad(e.target.value ? Number(e.target.value) : "")}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40"
                >
                  <option value="">Sin especificar</option>
                  {entidades.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nombre}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  ¿No aparece? Agrégalo primero en el listado de centros
                  aliados.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Días de validez del enlace
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={dias}
                  onChange={(e) => setDias(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40"
                />
              </div>

              <button
                onClick={handleGenerar}
                disabled={generando || !idTipo}
                className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }}
              >
                {generando ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <LinkIcon size={16} />
                )}
                Generar enlace
              </button>
            </>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-700">
                  Enlace generado. Envíalo por WhatsApp o correo al centro
                  aliado — es válido por {dias} día{dias === 1 ? "" : "s"}.
                </p>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <input
                  readOnly
                  value={urlGenerada}
                  className="flex-1 bg-transparent text-xs text-slate-600 outline-none truncate"
                />
                <button
                  onClick={copiar}
                  className="shrink-0 w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center"
                >
                  {copiado ? (
                    <CheckCircle2 size={15} className="text-emerald-500" />
                  ) : (
                    <Copy size={15} className="text-slate-500" />
                  )}
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cerrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}