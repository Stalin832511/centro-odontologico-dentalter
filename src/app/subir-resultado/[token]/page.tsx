"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileText,
} from "lucide-react";

interface InfoToken {
  valido: boolean;
  motivo?: string;
  pacienteNombre?: string;
  tipoResultado?: string;
  entidadNombre?: string | null;
}

export default function SubirResultadoPage() {
  const params = useParams();
  const token = params.token as string;

  const [info, setInfo] = useState<InfoToken | null>(null);
  const [cargandoInfo, setCargandoInfo] = useState(true);

  const [archivo, setArchivo] = useState<File | null>(null);
  const [subidoPor, setSubidoPor] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/validar-token?token=${token}`)
      .then((r) => r.json())
      .then(setInfo)
      .catch(() =>
        setInfo({ valido: false, motivo: "No se pudo validar el enlace." })
      )
      .finally(() => setCargandoInfo(false));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!archivo || !subidoPor.trim()) return;

    setEnviando(true);
    setError(null);

    const formData = new FormData();
    formData.append("token", token);
    formData.append("archivo", archivo);
    formData.append("subidoPor", subidoPor.trim());
    formData.append("descripcion", descripcion.trim());

    try {
      const res = await fetch("/api/subir-resultado", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error ?? "No se pudo enviar el resultado.");
        setEnviando(false);
        return;
      }

      setEnviado(true);
    } catch {
      setError("No se pudo enviar el resultado. Verifica tu conexión.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0b1220] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* CABECERA */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 px-6 py-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-white/20 mx-auto flex items-center justify-center mb-3">
            <UploadCloud size={26} className="text-white" />
          </div>
          <h1 className="text-white font-bold text-xl">Enviar Resultado</h1>
          <p className="text-white/80 text-sm mt-1">
            Portal seguro para centros médicos aliados
          </p>
        </div>

        <div className="p-6 sm:p-7">
          {cargandoInfo ? (
            <div className="py-10 flex flex-col items-center gap-3">
              <Loader2 size={24} className="animate-spin text-cyan-500" />
              <p className="text-sm text-slate-500">Verificando enlace…</p>
            </div>
          ) : !info?.valido ? (
            <div className="py-8 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                <AlertCircle size={22} className="text-rose-500" />
              </div>
              <p className="font-semibold text-slate-700">Enlace no disponible</p>
              <p className="text-sm text-slate-500">{info?.motivo}</p>
            </div>
          ) : enviado ? (
            <div className="py-8 flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 size={22} className="text-emerald-500" />
              </div>
              <p className="font-semibold text-slate-700">
                Resultado enviado correctamente
              </p>
              <p className="text-sm text-slate-500">
                La clínica lo revisará en breve. Puedes cerrar esta página.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold mb-1">
                  Paciente
                </p>
                <p className="font-bold text-slate-800">
                  {info.pacienteNombre}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Tipo de resultado: {info.tipoResultado}
                  {info.entidadNombre ? ` · ${info.entidadNombre}` : ""}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Tu nombre (quien sube el archivo)
                  </label>
                  <input
                    type="text"
                    required
                    value={subidoPor}
                    onChange={(e) => setSubidoPor(e.target.value)}
                    placeholder="Ej. Laboratorio San Rafael"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Archivo (PDF o imagen)
                  </label>
                  <label className="flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 border-dashed border-slate-200 cursor-pointer hover:border-cyan-300 transition-colors">
                    <FileText size={18} className="text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-500 truncate">
                      {archivo ? archivo.name : "Seleccionar archivo…"}
                    </span>
                    <input
                      type="file"
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(e) =>
                        setArchivo(e.target.files?.[0] ?? null)
                      }
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                    Descripción (opcional)
                  </label>
                  <textarea
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={3}
                    placeholder="Notas sobre el resultado…"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 resize-none"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-rose-600 text-sm">
                    <AlertCircle size={15} className="shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={enviando || !archivo || !subidoPor.trim()}
                  className="w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 transition-opacity"
                  style={{
                    background: "linear-gradient(135deg, #0ea5e9, #0369a1)",
                  }}
                >
                  {enviando ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <UploadCloud size={16} />
                  )}
                  Enviar resultado
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}