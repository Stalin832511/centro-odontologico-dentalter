"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SidebarPaciente from "@/components/paciente/SidebarPaciente";
import TopbarPaciente from "@/components/paciente/TopbarPaciente";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Pill, AlertCircle } from "lucide-react";

interface RecetaFila {
  id: number;
  medicamento: string;
  dosis: string | null;
  frecuencia: string | null;
  duracion: string | null;
  estado: string;
  fecha: string;
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

export default function MiRecetaPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recetas, setRecetas] = useState<RecetaFila[]>([]);
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
          setRecetas([]);
          return;
        }

        const { data: evoluciones } = await supabase
          .from("evolucion_clinica")
          .select("id")
          .eq("id_historia", historia.id);

        const ids = (evoluciones ?? []).map((e) => e.id);
        if (ids.length === 0) {
          setRecetas([]);
          return;
        }

        const { data, error: recetasError } = await supabase
          .from("recetas_medicas")
          .select(
            `id, medicamento, dosis, frecuencia, duracion, estado,
             evolucion_clinica ( fecha, doctores ( nombres, apellidos ) )`
          )
          .in("id_evolucion", ids)
          .order("id", { ascending: false });

        if (recetasError) throw recetasError;

        setRecetas(
          ((data as any[]) ?? []).map((r) => ({
            id: r.id,
            medicamento: r.medicamento,
            dosis: r.dosis,
            frecuencia: r.frecuencia,
            duracion: r.duracion,
            estado: r.estado,
            fecha: r.evolucion_clinica?.fecha ?? "",
            doctor_nombre: r.evolucion_clinica?.doctores
              ? `${r.evolucion_clinica.doctores.nombres} ${r.evolucion_clinica.doctores.apellidos}`
              : "—",
          }))
        );
      } catch {
        setError("No pudimos cargar tus recetas.");
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
                Mis Recetas
              </h1>
              <p className="text-slate-300 max-w-xl text-sm sm:text-[15px] leading-relaxed">
                Historial completo de medicamentos recetados por tus doctores.
              </p>
            </motion.div>

            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5">
                <AlertCircle size={18} className="text-rose-500 shrink-0" />
                <p className="text-sm text-rose-700 font-medium">{error}</p>
              </div>
            )}

            <div className="bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-xl shadow-slate-200/50">
              {cargando ? (
                <div className="space-y-3">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : recetas.length === 0 ? (
                <div className="text-center py-14">
                  <Pill size={26} className="text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-600">
                    Aún no tienes recetas registradas
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recetas.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-start gap-3 p-4 rounded-2xl border border-slate-100"
                    >
                      <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center shrink-0">
                        <Pill size={18} className="text-sky-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-800">
                            {r.medicamento}
                            {r.dosis ? ` · ${r.dosis}` : ""}
                          </p>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              r.estado === "ACTIVA"
                                ? "bg-emerald-50 text-emerald-600"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {r.estado === "ACTIVA" ? "Activa" : r.estado}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {r.frecuencia ?? "Según indicación médica"}
                          {r.duracion ? ` · ${r.duracion}` : ""}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Dr(a). {r.doctor_nombre} · {r.fecha && formatFecha(r.fecha)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}