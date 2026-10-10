"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SidebarPaciente from "@/components/paciente/SidebarPaciente";
import TopbarPaciente from "@/components/paciente/TopbarPaciente";
import { listarMisRadiografias, RadiografiaConUrl } from "@/services/radiografias";
import { listarMisResultados, ResultadoConUrl } from "@/services/resultados";
import {
  ArrowLeft,
  ScanLine,
  FlaskConical,
  FileStack,
  FileImage,
  FileText,
  Download,
  Printer,
  Loader2,
} from "lucide-react";

type Pestana = "rx" | "laboratorio" | "otros";

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
 * dispara la descarga. Requiere el paquete "jspdf".
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

function descargarPDFDirecto(url: string, nombreArchivo: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = nombreArchivo.endsWith(".pdf") ? nombreArchivo : `${nombreArchivo}.pdf`;
  a.target = "_blank";
  a.click();
}

function esPDF(url: string) {
  return url.toLowerCase().split("?")[0].endsWith(".pdf");
}

// ------------------------------------------------------------
// Forma unificada para mezclar radiografías (sistema viejo) con
// resultados (sistema nuevo) en una sola grilla, sin tocar los
// tipos originales de cada servicio.
// ------------------------------------------------------------
interface ItemUnificado {
  key: string;
  // id real en la tabla "resultados" — null cuando el item viene
  // del sistema viejo de radiografías (todavía no tiene hoja
  // membretada propia, ver nota en handleImprimir).
  idResultado: number | null;
  titulo: string;
  fecha: string;
  descripcion: string | null;
  urlFirmada: string;
  origenExterno: boolean;
}

export default function ResultadosPacientePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // null = pantalla de menú (solo botones); con valor = categoría abierta
  const [pestanaActiva, setPestanaActiva] = useState<Pestana | null>(null);

  const [radiografias, setRadiografias] = useState<RadiografiaConUrl[]>([]);
  const [resultados, setResultados] = useState<ResultadoConUrl[]>([]);

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [ampliada, setAmpliada] = useState<ItemUnificado | null>(null);
  const [descargandoId, setDescargandoId] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const [rx, res] = await Promise.all([
          listarMisRadiografias(),
          listarMisResultados(),
        ]);
        setRadiografias(rx);
        setResultados(res);
      } catch {
        setError("No pudimos cargar tus resultados. Intenta de nuevo más tarde.");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  // ------------------------------------------------------------
  // RX: radiografías del sistema viejo + resultados nuevos cuyo
  // tipo sea "radiografia" (ej. una RX que subió un laboratorio
  // externo por enlace)
  // ------------------------------------------------------------
  const itemsRX = useMemo<ItemUnificado[]>(() => {
    const deViejo: ItemUnificado[] = radiografias.map((r) => ({
      key: `rx-${r.id}`,
      idResultado: null,
      titulo: r.tipo ?? "Radiografía",
      fecha: r.fecha,
      descripcion: r.descripcion,
      urlFirmada: r.urlFirmada,
      origenExterno: false,
    }));

    const deNuevo: ItemUnificado[] = resultados
      .filter((r) => r.tipo_resultado?.slug === "radiografia")
      .map((r) => ({
        key: `res-${r.id}`,
        idResultado: r.id,
        titulo: r.titulo ?? r.tipo_resultado?.nombre ?? "Radiografía",
        fecha: r.fecha,
        descripcion: r.descripcion,
        urlFirmada: r.urlFirmada,
        origenExterno: r.origen === "externo",
      }));

    return [...deViejo, ...deNuevo].sort(
      (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    );
  }, [radiografias, resultados]);

  const itemsLaboratorio = useMemo<ItemUnificado[]>(
    () =>
      resultados
        .filter((r) => r.tipo_resultado?.slug === "laboratorio")
        .map((r) => ({
          key: `res-${r.id}`,
          idResultado: r.id,
          titulo: r.titulo ?? "Laboratorio",
          fecha: r.fecha,
          descripcion: r.descripcion,
          urlFirmada: r.urlFirmada,
          origenExterno: r.origen === "externo",
        })),
    [resultados]
  );

  const itemsOtros = useMemo<ItemUnificado[]>(
    () =>
      resultados
        .filter(
          (r) =>
            r.tipo_resultado?.slug !== "radiografia" &&
            r.tipo_resultado?.slug !== "laboratorio"
        )
        .map((r) => ({
          key: `res-${r.id}`,
          idResultado: r.id,
          titulo: r.titulo ?? r.tipo_resultado?.nombre ?? "Documento",
          fecha: r.fecha,
          descripcion: r.descripcion,
          urlFirmada: r.urlFirmada,
          origenExterno: r.origen === "externo",
        })),
    [resultados]
  );

  async function handleDescargar(item: ItemUnificado) {
    if (!item.urlFirmada) return;
    setDescargandoId(item.key);
    try {
      if (esPDF(item.urlFirmada)) {
        descargarPDFDirecto(item.urlFirmada, `${item.titulo}-${item.fecha}`);
      } else {
        await descargarComoPDF(item.urlFirmada, `${item.titulo}-${item.fecha}`);
      }
    } catch {
      setError("No se pudo descargar el archivo. Intenta de nuevo.");
    } finally {
      setDescargandoId(null);
    }
  }

  function handleImprimir(item: ItemUnificado) {
    if (item.idResultado) {
      // Sistema nuevo: abre la hoja membretada con logo, datos de
      // la clínica y del paciente ya formateados.
      window.open(`/imprimir-resultado/${item.idResultado}`, "_blank");
    } else if (item.urlFirmada) {
      // Radiografías del sistema viejo (aún no migradas a
      // "resultados"): por ahora se imprime el archivo directo.
      window.open(item.urlFirmada, "_blank");
    }
  }

  const itemsPestanaActiva =
    pestanaActiva === "rx"
      ? itemsRX
      : pestanaActiva === "laboratorio"
      ? itemsLaboratorio
      : pestanaActiva === "otros"
      ? itemsOtros
      : [];

  const mensajeVacio =
    pestanaActiva === "rx"
      ? {
          titulo: "Aún no tienes radiografías digitalizadas",
          detalle:
            "Cuando tu doctor suba una radiografía, aparecerá aquí automáticamente para que la veas y descargues.",
        }
      : pestanaActiva === "laboratorio"
      ? {
          titulo: "Aún no tienes resultados de laboratorio",
          detalle:
            "Cuando la clínica o un laboratorio aliado suba tu resultado, aparecerá aquí.",
        }
      : {
          titulo: "Aún no tienes otros documentos",
          detalle: "Aquí verás avances de prótesis y otros documentos clínicos.",
        };

  const TARJETAS: {
    id: Pestana;
    label: string;
    icon: typeof ScanLine;
    color: string;
    cantidad: number;
  }[] = [
    { id: "rx", label: "Radiografías", icon: ScanLine, color: "from-cyan-500 to-sky-600", cantidad: itemsRX.length },
    { id: "laboratorio", label: "Laboratorio", icon: FlaskConical, color: "from-violet-500 to-fuchsia-600", cantidad: itemsLaboratorio.length },
    { id: "otros", label: "Otros documentos", icon: FileStack, color: "from-emerald-500 to-teal-600", cantidad: itemsOtros.length },
  ];

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
                  Consulta, descarga e imprime tus radiografías, resultados
                  de laboratorio y demás documentos de la clínica.
                </p>
              </div>
            </motion.div>

            {/* MENÚ — solo botones grandes con ícono, nada abierto todavía */}
            {pestanaActiva === null && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {TARJETAS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <motion.button
                      key={t.id}
                      onClick={() => setPestanaActiva(t.id)}
                      whileHover={{ y: -4 }}
                      whileTap={{ scale: 0.97 }}
                      className="text-left bg-white rounded-[28px] p-6 shadow-xl shadow-slate-200/50 border border-slate-100 transition-shadow hover:shadow-2xl"
                    >
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.color} flex items-center justify-center text-white mb-5`}
                      >
                        <Icon size={26} />
                      </div>
                      <h3 className="font-bold text-slate-800 text-lg">{t.label}</h3>
                      <p className="text-sm text-slate-400 mt-1">
                        {cargando
                          ? "Cargando…"
                          : `${t.cantidad} documento${t.cantidad === 1 ? "" : "s"}`}
                      </p>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}

            {/* CATEGORÍA ABIERTA */}
            {pestanaActiva !== null && (
              <>
                <button
                  onClick={() => setPestanaActiva(null)}
                  className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sky-600 mb-5 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Volver a Mis Resultados
                </button>

                {error && (
                  <div className="mb-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5 text-sm text-rose-700 font-medium">
                    {error}
                  </div>
                )}

                <motion.div
                  key={pestanaActiva}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-xl shadow-slate-200/50"
                >
                  <div className="flex items-center gap-2 mb-5">
                    {(() => {
                      const Icon = TARJETAS.find((t) => t.id === pestanaActiva)!.icon;
                      return <Icon size={20} className="text-sky-600" />;
                    })()}
                    <h2 className="text-lg font-black text-slate-800">
                      {TARJETAS.find((t) => t.id === pestanaActiva)!.label}
                    </h2>
                  </div>

                  {cargando ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {[0, 1, 2].map((i) => (
                        <div key={i} className="aspect-square rounded-2xl bg-slate-100 animate-pulse" />
                      ))}
                    </div>
                  ) : itemsPestanaActiva.length === 0 ? (
                    <div className="text-center py-14">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                        <FileImage size={22} className="text-slate-300" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">
                        {mensajeVacio.titulo}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                        {mensajeVacio.detalle}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {itemsPestanaActiva.map((item) => (
                        <div key={item.key} className="group">
                          <button
                            onClick={() => setAmpliada(item)}
                            className="w-full aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative"
                          >
                            {item.urlFirmada ? (
                              esPDF(item.urlFirmada) ? (
                                <div className="w-full h-full flex flex-col items-center justify-center">
                                  <FileText size={26} className="text-rose-400" />
                                </div>
                              ) : (
                                <img
                                  src={item.urlFirmada}
                                  alt={item.titulo}
                                  className="w-full h-full object-cover"
                                />
                              )
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <FileImage size={20} className="text-slate-300" />
                              </div>
                            )}

                            {item.origenExterno && (
                              <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-cyan-600 text-[9px] font-bold text-white shadow-sm">
                                Externo
                              </span>
                            )}
                          </button>
                          <div className="mt-2 flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-700 truncate">
                                {item.titulo}
                              </p>
                              <p className="text-[11px] text-slate-400">{formatFecha(item.fecha)}</p>
                            </div>
                            <div className="flex gap-1 shrink-0">
                              <button
                                onClick={() => handleImprimir(item)}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-sky-100 flex items-center justify-center transition-colors"
                                title="Imprimir"
                              >
                                <Printer size={13} className="text-slate-600" />
                              </button>
                              <button
                                onClick={() => handleDescargar(item)}
                                disabled={descargandoId === item.key}
                                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-sky-100 flex items-center justify-center transition-colors disabled:opacity-50"
                                title="Descargar"
                              >
                                {descargandoId === item.key ? (
                                  <Loader2 size={13} className="animate-spin text-sky-600" />
                                ) : (
                                  <Download size={13} className="text-slate-600" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </>
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
            {esPDF(ampliada.urlFirmada) ? (
              <iframe
                src={ampliada.urlFirmada}
                title={ampliada.titulo}
                className="w-full h-[75vh] rounded-2xl bg-white"
              />
            ) : (
              <img
                src={ampliada.urlFirmada}
                alt={ampliada.titulo}
                className="w-full max-h-[75vh] object-contain rounded-2xl"
              />
            )}
            <div className="flex items-center justify-between mt-4">
              <div>
                <p className="text-white font-semibold text-sm">
                  {ampliada.titulo} · {formatFecha(ampliada.fecha)}
                </p>
                {ampliada.descripcion && (
                  <p className="text-slate-300 text-xs mt-0.5">{ampliada.descripcion}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleImprimir(ampliada)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 text-white text-sm font-semibold hover:bg-white/20"
                >
                  <Printer size={15} />
                  Imprimir
                </button>
                <button
                  onClick={() => handleDescargar(ampliada)}
                  disabled={descargandoId === ampliada.key}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-slate-800 text-sm font-semibold disabled:opacity-60"
                >
                  {descargandoId === ampliada.key ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Download size={15} />
                  )}
                  Descargar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}