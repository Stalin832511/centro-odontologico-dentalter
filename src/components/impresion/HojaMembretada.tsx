"use client";

import { ReactNode } from "react";
import { clinicConfig } from "@/config/clinicConfig";

export type OrientacionImpresion = "portrait" | "landscape";

interface Props {
  /** Ej. "Resultado de Laboratorio", "Radiografía Dental", "Listado de Consultas del Día" */
  tituloDocumento: string;
  pacienteNombre?: string;
  pacienteCedula?: string;
  fecha?: string;
  children: ReactNode;

  /**
   * portrait  = A4 vertical
   * landscape = A4 horizontal
   */
  orientacion?: OrientacionImpresion;

  /**
   * Tipo de documento. "listado" está optimizado para tablas.
   */
  tipo?: "documento" | "listado" | "reporte";

  /** Mostrar u ocultar bloques opcionales */
  mostrarPaciente?: boolean;
  mostrarContacto?: boolean;
  mostrarFooter?: boolean;
}

export default function HojaMembretada({
  tituloDocumento,
  pacienteNombre,
  pacienteCedula,
  fecha,
  children,
  orientacion = "portrait",
  tipo = "documento",
  mostrarPaciente = true,
  mostrarContacto = true,
  mostrarFooter = true,
}: Props) {
  const fechaFormateada = fecha
    ? new Date(fecha).toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : new Date().toLocaleDateString("es-EC", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });

  const esHorizontal = orientacion === "landscape";

  return (
    <div
      id="hoja-membretada-imprimible"
      className={`min-h-screen bg-slate-100 print:bg-white ${
        esHorizontal ? "modo-horizontal" : "modo-vertical"
      }`}
    >
      {/* =========================================================
          BARRA DE ACCIONES — NO SE IMPRIME
      ========================================================= */}
      <div className="print:hidden sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-800">
              {tituloDocumento}
            </p>
            <p className="text-xs text-slate-500">
              A4 {esHorizontal ? "horizontal" : "vertical"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
            style={{
              background:
                "linear-gradient(135deg, #06b6d4 0%, #0891b2 45%, #2563eb 100%)",
            }}
          >
            <span className="text-lg">🖨</span>
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>

      {/* =========================================================
          HOJA A4
      ========================================================= */}
      <div
        className={`
          documento-impresion
          mx-auto
          bg-white
          shadow-xl
          print:shadow-none
          relative
          overflow-hidden
          ${
            esHorizontal
              ? "max-w-[1120px] min-h-[790px]"
              : "max-w-[794px] min-h-[1123px]"
          }
        `}
      >
        {/* =======================================================
            DECORACIÓN SUPERIOR
        ======================================================= */}
        <div className="absolute top-0 left-0 right-0 h-[155px] overflow-hidden pointer-events-none">
          <svg
            className="absolute inset-0 w-full h-full"
            viewBox={esHorizontal ? "0 0 1120 155" : "0 0 794 155"}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="membreteHeaderGradient"
                x1="0"
                y1="0"
                x2="1"
                y2="1"
              >
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="45%" stopColor="#0891b2" />
                <stop offset="100%" stopColor="#1d4ed8" />
              </linearGradient>
            </defs>

            <path
              d={
                esHorizontal
                  ? "M0 0H1120V70C950 125 820 25 680 65C520 110 390 25 250 70C140 105 70 90 0 120Z"
                  : "M0 0H794V70C680 125 590 25 480 65C350 110 260 25 150 70C80 100 35 90 0 120Z"
              }
              fill="url(#membreteHeaderGradient)"
            />

            <path
              d={
                esHorizontal
                  ? "M0 0H1120V38C940 90 820 0 680 42C500 90 400 5 250 45C140 72 60 60 0 80Z"
                  : "M0 0H794V38C670 90 590 0 480 42C350 90 270 5 150 45C80 72 35 60 0 80Z"
              }
              fill="#22d3ee"
              opacity="0.72"
            />
          </svg>
        </div>

        {/* Decoraciones */}
        <div className="absolute right-8 top-16 w-24 h-24 rounded-full border border-cyan-400/40 pointer-events-none" />

        <div
          className="absolute right-12 top-20 w-20 h-16 opacity-60 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(#06b6d4 1.5px, transparent 1.5px)",
            backgroundSize: "12px 12px",
          }}
        />

        {/* =======================================================
            HEADER
        ======================================================= */}
        <header className="relative z-10 px-8 pt-10 pb-7">
          <div className="flex items-start justify-between gap-8">
            {/* LOGO */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center">
                <svg
                  viewBox="0 0 100 100"
                  className="w-12 h-12"
                  fill="none"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient
                      id="membreteToothGradient"
                      x1="15"
                      y1="10"
                      x2="85"
                      y2="90"
                    >
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="50%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>

                  <path
                    d="
                      M50 8
                      C44 8 40 11 36 12
                      C31 13 27 9 22 10
                      C14 11 9 18 9 27
                      C9 36 13 43 18 50
                      C21 55 24 61 25 68
                      C26 75 27 85 32 91
                      C34 94 38 94 40 91
                      C43 87 43 79 45 73
                      C46 69 48 66 50 66
                      C52 66 54 69 55 73
                      C57 79 57 87 60 91
                      C62 94 66 94 68 91
                      C73 85 74 75 75 68
                      C76 61 79 55 82 50
                      C87 43 91 36 91 27
                      C91 18 86 11 78 10
                      C73 9 69 13 64 12
                      C60 11 56 8 50 8
                      Z
                    "
                    fill="#FFFFFF"
                    stroke="url(#membreteToothGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <path
                    d="M50 27C46 34 45 40 46 47C47 53 49 58 50 63C51 58 53 53 54 47C55 40 54 34 50 27Z"
                    fill="url(#membreteToothGradient)"
                    opacity="0.85"
                  />
                </svg>
              </div>

              <div>
                <p className="text-[11px] uppercase tracking-[4px] font-semibold text-slate-500">
                  Consultorio
                </p>

                <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-none">
                  {clinicConfig.logoWhite}
                  <span className="text-cyan-500">
                    {clinicConfig.logoColor}
                  </span>
                </h1>

                <p className="text-[10px] uppercase tracking-[2.5px] text-slate-400 font-semibold mt-2">
                  Salud · Estética · Confianza
                </p>
              </div>
            </div>

            {/* CONTACTO */}
            {mostrarContacto && (
              <div className="text-right pt-2 max-w-[300px]">
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  {clinicConfig.address}
                </p>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  {clinicConfig.email}
                </p>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  {clinicConfig.whatsapp}
                </p>
              </div>
            )}
          </div>
        </header>

        {/* =======================================================
            TÍTULO DEL DOCUMENTO
        ======================================================= */}
        <section className="relative z-10 px-8 pt-3 pb-5">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white shadow-md"
              style={{
                background:
                  "linear-gradient(135deg,#06b6d4,#2563eb)",
              }}
            >
              <span aria-hidden="true">📄</span>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[3px] font-semibold text-cyan-600">
                Tipo de documento
              </p>

              <h2 className="text-2xl font-black text-slate-900">
                {tituloDocumento}
              </h2>
            </div>
          </div>

          <div className="w-28 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-600" />
        </section>

        {/* =======================================================
            DATOS DEL PACIENTE / DOCUMENTO
        ======================================================= */}
        {mostrarPaciente && (
          <section className="relative z-10 mx-8 mb-6">
            <div className="rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50/70 via-white to-blue-50/60 px-5 py-4">
              <div
                className={`grid gap-5 ${
                  pacienteCedula
                    ? "grid-cols-2 md:grid-cols-4"
                    : "grid-cols-2 md:grid-cols-3"
                }`}
              >
                <Dato
                  etiqueta="Paciente"
                  valor={pacienteNombre || "No especificado"}
                />

                {pacienteCedula && (
                  <Dato
                    etiqueta="Cédula"
                    valor={pacienteCedula}
                  />
                )}

                <Dato
                  etiqueta="Documento"
                  valor={tituloDocumento}
                />

                <Dato
                  etiqueta="Fecha"
                  valor={fechaFormateada}
                />
              </div>
            </div>
          </section>
        )}

        {/* =======================================================
            CONTENIDO
        ======================================================= */}
        <main
          className={`relative z-10 px-8 pb-10 ${
            tipo === "listado" ? "contenido-listado" : ""
          }`}
        >
          {children}
        </main>

        {/* =======================================================
            FOOTER
        ======================================================= */}
        {mostrarFooter && (
          <footer className="relative mt-auto h-[125px] overflow-hidden">
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox={esHorizontal ? "0 0 1120 125" : "0 0 794 125"}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <defs>
                <linearGradient
                  id="membreteFooterGradient"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#0f3b73" />
                  <stop offset="55%" stopColor="#075985" />
                  <stop offset="100%" stopColor="#0891b2" />
                </linearGradient>
              </defs>

              <path
                d={
                  esHorizontal
                    ? "M0 125V55C180 5 310 80 500 48C700 10 850 75 1120 25V125Z"
                    : "M0 125V55C120 5 220 80 350 48C490 10 610 75 794 25V125Z"
                }
                fill="url(#membreteFooterGradient)"
              />

              <path
                d={
                  esHorizontal
                    ? "M0 125V92C180 50 330 105 520 77C720 48 900 100 1120 65V125Z"
                    : "M0 125V92C120 50 230 105 360 77C500 48 640 100 794 65V125Z"
                }
                fill="#020617"
                opacity="0.25"
              />
            </svg>

            <div className="relative z-10 h-full px-8 pb-5 flex items-end justify-between">
              <div>
                <p className="text-white font-black text-sm">
                  {clinicConfig.clinicName}
                </p>

                <p className="text-cyan-100 text-[10px] mt-1">
                  Tecnología y atención profesional para tu salud.
                </p>

                <p className="text-white/60 text-[9px] mt-2">
                  Documento de uso exclusivo del paciente y profesional tratante.
                </p>
              </div>

              <div className="text-right text-white/80 text-[9px]">
                <p>{clinicConfig.whatsapp}</p>
                <p>{clinicConfig.email}</p>
              </div>
            </div>
          </footer>
        )}
      </div>

      {/* =========================================================
          IMPRESIÓN
      ========================================================= */}
      <style jsx global>{`
        @page {
          size: A4 portrait;
          margin: 0;
        }

        @media print {
          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body * {
            visibility: hidden;
          }

          #hoja-membretada-imprimible,
          #hoja-membretada-imprimible * {
            visibility: visible;
          }

          #hoja-membretada-imprimible {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            min-height: 0 !important;
            background: white !important;
          }

          .documento-impresion {
            width: 100% !important;
            max-width: none !important;
            min-height: 0 !important;
            margin: 0 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            overflow: visible !important;
          }

          table {
            width: 100%;
            page-break-inside: auto;
          }

          thead {
            display: table-header-group;
          }

          tfoot {
            display: table-footer-group;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          img {
            max-width: 100%;
          }

          .contenido-listado {
            width: 100%;
          }

          ${
            esHorizontal
              ? `
                @page {
                  size: A4 landscape;
                  margin: 0;
                }
              `
              : `
                @page {
                  size: A4 portrait;
                  margin: 0;
                }
              `
          }
        }
      `}</style>
    </div>
  );
}

function Dato({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[9px] uppercase tracking-[1.5px] text-slate-400 font-bold">
        {etiqueta}
      </p>

      <p className="text-xs font-bold text-slate-800 mt-1 truncate">
        {valor}
      </p>
    </div>
  );
}
