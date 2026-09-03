"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SidebarPaciente from "@/components/paciente/SidebarPaciente";
import TopbarPaciente from "@/components/paciente/TopbarPaciente";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Stethoscope, ClipboardList, AlertCircle } from "lucide-react";

interface EvolucionFila {
  id: number;
  fecha: string;
  diagnostico: string | null;
  tratamiento: string | null;
  observaciones: string | null;
  doctor_nombre: string;
}

function formatFecha(fechaISO: string) {
  const [y, m, d] = fechaISO.split("T")[0].split("-");
  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
  ];
  return `${parseInt(d)} de ${meses[parseInt(m) - 1]} de ${y}`;
}

export default function HistorialPacientePage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [evoluciones, setEvoluciones] = useState<EvolucionFila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error();

        const { data: paciente } = await supabase
          .from("pacientes")
          .select("id")
          .eq("id_usuario", user.id)
          .single();
        if (!paciente) throw new Error();

        const { data: historia } = await supabase
          .from("historia_clinica")
          .select("id")
          .eq("id_paciente", paciente.id)
          .maybeSingle();

        if (!historia) {
          setEvoluciones([]);
          return;
        }

        const { data, error: evolucionesError } = await supabase
          .from("evolucion_clinica")
          .select(
            `id, fecha, diagnostico, tratamiento, observaciones,
             doctores ( nombres, apellidos )`
          )
          .eq("id_historia", historia.id)
          .order("fecha", { ascending: false });

        if (evolucionesError) throw evolucionesError;

        setEvoluciones(
          ((data as any[]) ?? []).map((e) => ({
            id: e.id,
            fecha: e.fecha,
            diagnostico: e.diagnostico,
            tratamiento: e.tratamiento,
            observaciones: e.observaciones,
            doctor_nombre: e.doctores ? `${e.doctores.nombres} ${e.doctores.apellidos}` : "—",
          }))
        );
      } catch {
        setError("No pudimos cargar tu historial.");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="flex">
        <SidebarPaciente isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <section className="flex-1 min-w-0">
          <TopbarPaciente onMenuClick={() => setSidebarOpen(true)} />

          <div className="p-4 md:p-6 xl:p-8 max-w-[900px] mx-auto">
            <button
              onClick={() => router.push("/paciente/dashboard")}
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-sky-600 mb-5 transition-colors"
            >
              <ArrowLeft size={16} />
              Volver al inicio
            </button>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl md:rounded-[28px] p-5 sm:p-8 md:p-10 mb-6 bg-gradient-to-br from-[#1e293b] via-[#1e3a4a] to-[#0c4a5e] shadow-[0_20px_60px_-15px_rgba(12,74,94,0.45)]"
            >
              <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-[42px] leading-[1.1] mb-3 tracking-tight">
                Mi Historial
              </h1>
              <p className="text-slate-300 max-w-xl text-sm sm:text-[15px] leading-relaxed">
                Línea de tiempo de tus consultas y tratamientos.
              </p>
            </motion.div>

            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5">
                <AlertCircle size={18} className="text-rose-500 shrink-0" />
                <p className="text-sm text-rose-700 font-medium">{error}</p>
              </div>
            )}

            {cargando ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-32 rounded-2xl bg-white shadow-xl animate-pulse" />
                ))}
              </div>
            ) : evoluciones.length === 0 ? (
              <div className="bg-white rounded-2xl sm:rounded-[32px] p-14 text-center shadow-xl shadow-slate-200/50">
                <ClipboardList size={26} className="text-slate-300 mx-auto mb-3" />
                <p className="text-sm font-semibold text-slate-600">
                  Aún no tienes consultas registradas
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {evoluciones.map((ev, i) => (
                  <motion.div
                    key={ev.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl sm:rounded-[28px] p-5 sm:p-6 shadow-xl shadow-slate-200/50"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-400 to-cyan-600 flex items-center justify-center text-white shrink-0">
                        <Stethoscope size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{formatFecha(ev.fecha)}</p>
                        <p className="text-xs text-slate-500">Dr(a). {ev.doctor_nombre}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      {ev.diagnostico && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Diagnóstico
                          </p>
                          <p className="text-slate-700">{ev.diagnostico}</p>
                        </div>
                      )}
                      {ev.tratamiento && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Tratamiento
                          </p>
                          <p className="text-slate-700">{ev.tratamiento}</p>
                        </div>
                      )}
                      {ev.observaciones && (
                        <div>
                          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                            Observaciones
                          </p>
                          <p className="text-slate-700">{ev.observaciones}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}