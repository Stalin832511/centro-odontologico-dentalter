"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SidebarPaciente from "@/components/paciente/SidebarPaciente";
import TopbarPaciente from "@/components/paciente/TopbarPaciente";
import { listarMisRadiografias, RadiografiaConUrl } from "@/services/radiografias";
import {
  ArrowLeft,
  ScanLine,
  FlaskConical,
  FileStack,
  FileImage,
  Download,
  Loader2,
} from "lucide-react";

type Pestana = "rx" | "laboratorio" | "otros";

const PESTANAS: { id: Pestana; label: string; icon: typeof ScanLine; disponible: boolean }[] = [
  { id: "rx", label: "Radiografías", icon: ScanLine, disponible: true },
  { id: "laboratorio", label: "Laboratorio", icon: FlaskConical, disponible: false },
  { id: "otros", label: "Otros documentos", icon: FileStack, disponible: false },
];

function formatFecha(fechaISO: string) {
  const [y, m, d] = fechaISO.split("T")[0].split("-");
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
}

/**
 * Convierte una imagen (por su URL) en un PDF de una página y
 * dispara la descarga. Requiere el paquete "jspdf":
 *   npm install jspdf
 */
async function descargarComoPDF(url: string, nombreArchivo: string) {
  const { jsPDF } = await import("jspdf");

  const respuesta = await fetch(url);
  const blob = await respuesta.blob();
  const dataUrl: string = await new Promise((resolve, reject) => {
    const lector = new FileReader();
    lector.onload = () => resolve(lector.result as string);
    lector.onerror = reject;
    lector.readAsDataURL(blob);
  });

  const imagen = new Image();
  await new Promise((resolve, reject) => {
    imagen.onload = resolve;
    imagen.onerror = reject;
    imagen.src = dataUrl;
  });

  const esHorizontal = imagen.width > imagen.height;
  const pdf = new jsPDF({
    orientation: esHorizontal ? "landscape" : "portrait",
    unit: "px",
    format: [imagen.width, imagen.height],
  });

  pdf.addImage(dataUrl, "JPEG", 0, 0, imagen.width, imagen.height);
  pdf.save(nombreArchivo.endsWith(".pdf") ? nombreArchivo : `${nombreArchivo}.pdf`);
}

export default function ResultadosPacientePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pestanaActiva, setPestanaActiva] = useState<Pestana>("rx");

  const [radiografias, setRadiografias] = useState<RadiografiaConUrl[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ampliada, setAmpliada] = useState<RadiografiaConUrl | null>(null);
  const [descargandoId, setDescargandoId] = useState<number | null>(null);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const data = await listarMisRadiografias();
        setRadiografias(data);
      } catch {
        setError("No pudimos cargar tus resultados. Intenta de nuevo más tarde.");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  async function handleDescargar(r: RadiografiaConUrl) {
    setDescargandoId(r.id);
    try {
      await descargarComoPDF(r.urlFirmada, `${r.tipo ?? "radiografia"}-${r.fecha}`);
    } catch {
      setError("No se pudo generar el PDF. Intenta de nuevo.");
    } finally {
      setDescargandoId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="flex">
        <SidebarPaciente isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <section className="flex-1 min-w-0">
          <TopbarPaciente onMenuClick={() => setSidebarOpen(true)} />

          <div className="p-4 md:p-6 xl:p-8 max-w-[1100px] mx-auto">
            <button
              onClick={() => router.push("/paciente/dashboard")}
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sky-600 mb-5 transition-colors"
            >
              <ArrowLeft size={16} />
              Volver al inicio
            </button>

            {/* HERO */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl md:rounded-[28px] p-5 sm:p-8 md:p-10 mb-6 bg-gradient-to-br from-[#1e293b] via-[#1e3a4a] to-[#0c4a5e] shadow-[0_20px_60px_-15px_rgba(12,74,94,0.45)]"
            >
              <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-sky-400/10 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
                  <p className="uppercase tracking-[3px] text-[10px] sm:text-xs font-semibold text-sky-300/90">
                    Tu historial digital
                  </p>
                </div>
                <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-[42px] leading-[1.1] mb-3 tracking-tight">
                  Mis Resultados
                </h1>
                <p className="text-slate-300 max-w-xl text-sm sm:text-[15px] leading-relaxed">
                  Consulta y descarga tus radiografías y estudios realizados
                  en la clínica.
                </p>
              </div>
            </motion.div>

            {/* PESTAÑAS — ahora todas clickeables, con shake al tocar */}
            <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 w-fit">
              {PESTANAS.map((p) => {
                const Icon = p.icon;
                const activa = pestanaActiva === p.id;
                return (
                  <motion.button
                    key={p.id}
                    onClick={() => setPestanaActiva(p.id)}
                    whileTap={{ x: [0, -3, 3, -3, 3, 0] }}
                    transition={{ duration: 0.35 }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      activa
                        ? "bg-sky-600 text-white shadow-md"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Icon size={16} />
                    {p.label}
                    {!p.disponible && (
                      <span className="text-[9px] font-bold uppercase bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full">
                        Próx.
                      </span>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {error && (
              <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5 text-sm text-rose-700 font-medium">
                {error}
              </div>
            )}

            {/* CONTENIDO */}
            {pestanaActiva === "rx" && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-xl shadow-slate-200/50"
              >
                {cargando ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="aspect-square rounded-2xl bg-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : radiografias.length === 0 ? (
                  <div className="text-center py-14">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                      <FileImage size={22} className="text-slate-300" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600">
                      Aún no tienes radiografías digitalizadas
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Cuando tu doctor suba una radiografía, aparecerá aquí
                      automáticamente para que la veas y descargues.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {radiografias.map((r) => (
                      <div key={r.id} className="group">
                        <button
                          onClick={() => setAmpliada(r)}
                          className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative"
                        >
                          {r.urlFirmada ? (
                            <img
                              src={r.urlFirmada}
                              alt={r.tipo ?? "Radiografía"}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileImage size={20} className="text-slate-300" />
                            </div>
                          )}
                        </button>
                        <div className="mt-2 flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-700 truncate">
                              {r.tipo ?? "Radiografía"}
                            </p>
                            <p className="text-[11px] text-slate-400">{formatFecha(r.fecha)}</p>
                          </div>
                          <button
                            onClick={() => handleDescargar(r)}
                            disabled={descargandoId === r.id}
                            className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-sky-100 flex items-center justify-center transition-colors shrink-0 disabled:opacity-50"
                            title="Descargar en PDF"
                          >
                            {descargandoId === r.id ? (
                              <Loader2 size={13} className="animate-spin text-sky-600" />
                            ) : (
                              <Download size={13} className="text-slate-600" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {pestanaActiva === "laboratorio" && (
              <div className="bg-white rounded-2xl sm:rounded-[32px] p-14 text-center shadow-xl shadow-slate-200/50">
                <FlaskConical size={26} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">Resultados de laboratorio</p>
                <p className="text-xs text-slate-400 mt-1">Próximamente disponible.</p>
              </div>
            )}

            {pestanaActiva === "otros" && (
              <div className="bg-white rounded-2xl sm:rounded-[32px] p-14 text-center shadow-xl shadow-slate-200/50">
                <FileStack size={26} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">Otros documentos</p>
                <p className="text-xs text-slate-400 mt-1">Próximamente disponible.</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* VISOR AMPLIADO */}
      {ampliada && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80"
          onClick={() => setAmpliada(null)}
        >
          <div className="max-w-3xl w-full" onClick={(e) => e.stopPropagation()}>
            <img
              src={ampliada.urlFirmada}
              alt={ampliada.tipo ?? "Radiografía"}
              className="w-full max-h-[75vh] object-contain rounded-2xl"
            />
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-white font-semibold text-sm">
                  {ampliada.tipo} · {formatFecha(ampliada.fecha)}
                </p>
                {ampliada.descripcion && (
                  <p className="text-slate-300 text-xs mt-0.5">{ampliada.descripcion}</p>
                )}
              </div>
              <button
                onClick={() => handleDescargar(ampliada)}
                disabled={descargandoId === ampliada.id}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-800 text-sm font-semibold disabled:opacity-60"
              >
                {descargandoId === ampliada.id ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Download size={15} />
                )}
                Descargar PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}