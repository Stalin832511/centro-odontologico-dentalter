"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import TopbarMedico from "@/components/medico/TopbarMedico";
import SidebarMedico from "@/components/medico/SidebarMedico";
import NuevaConsultaModal from "@/components/medico/NuevaConsultaModal";
import { obtenerMisPacientes, PacienteDelMedico } from "@/services/medico";
import {
  Search,
  Phone,
  Mail,
  IdCard,
  UserRound,
  Stethoscope,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

export default function MisPacientesPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pacientes, setPacientes] = useState<PacienteDelMedico[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState("");
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const [pacienteParaConsulta, setPacienteParaConsulta] =
    useState<PacienteDelMedico | null>(null);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      const data = await obtenerMisPacientes();
      setPacientes(data);
    } catch {
      setError("No pudimos cargar tu listado de pacientes.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  const pacientesFiltrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return pacientes;
    return pacientes.filter((p) =>
      `${p.nombres} ${p.apellidos} ${p.cedula}`.toLowerCase().includes(q)
    );
  }, [busqueda, pacientes]);

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="flex">
        <SidebarMedico isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <section className="flex-1 min-w-0">
          <TopbarMedico onMenuClick={() => setSidebarOpen(true)} />

          <div className="p-4 md:p-6 xl:p-8 max-w-[1600px] mx-auto">
            {/* HERO */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              className="relative overflow-hidden rounded-2xl md:rounded-[28px] p-5 sm:p-8 md:p-10 mb-6 md:mb-8 bg-[#0b1220] shadow-[0_20px_60px_-15px_rgba(11,18,32,0.45)]"
            >
              <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-3 md:mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  <p className="uppercase tracking-[3px] text-[10px] sm:text-xs font-semibold text-cyan-300/90">
                    Mis pacientes
                  </p>
                </div>
                <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-[42px] leading-[1.1] mb-3 tracking-tight">
                  Tus pacientes
                </h1>
                <p className="text-slate-400 max-w-xl text-sm sm:text-[15px] leading-relaxed">
                  Consulta a tus pacientes y registra una nueva consulta con
                  diagnóstico, tratamiento y receta.
                </p>
              </div>
            </motion.div>

            {mensajeExito && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3.5">
                <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />
                <p className="text-sm text-emerald-700 font-medium">{mensajeExito}</p>
              </div>
            )}
            {error && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3.5">
                <AlertCircle size={18} className="text-rose-500 shrink-0" />
                <p className="text-sm text-rose-700 font-medium">{error}</p>
              </div>
            )}

            {/* LISTADO */}
            <motion.div
              initial="hidden"
              animate="show"
              variants={fadeUp}
              custom={1}
              className="bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-xl shadow-slate-200/50"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
                <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                  <UserRound size={20} className="text-cyan-600" />
                  Listado de Pacientes
                </h2>

                <div className="relative">
                  <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por nombre o cédula..."
                    className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm w-56 sm:w-64 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
                  />
                </div>
              </div>

              {cargando ? (
                <div className="space-y-2">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : pacientesFiltrados.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm font-semibold text-slate-600">
                    {busqueda
                      ? "No se encontraron pacientes con esa búsqueda"
                      : "Aún no tienes pacientes con citas registradas"}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs uppercase tracking-wide text-slate-400 border-b border-slate-100">
                        <th className="pb-3 font-semibold">Paciente</th>
                        <th className="pb-3 font-semibold">Cédula</th>
                        <th className="pb-3 font-semibold">Teléfono</th>
                        <th className="pb-3 font-semibold">Correo</th>
                        <th className="pb-3 font-semibold text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pacientesFiltrados.map((p) => (
                        <tr
                          key={p.id}
                          className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition-colors"
                        >
                          <td className="py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-sky-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                {p.nombres.charAt(0)}
                                {p.apellidos.charAt(0)}
                              </div>
                              <span className="font-semibold text-slate-700">
                                {p.nombres} {p.apellidos}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <IdCard size={13} className="text-slate-400" />
                              {p.cedula}
                            </span>
                          </td>
                          <td className="py-3.5 text-slate-500">
                            {p.telefono ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Phone size={13} className="text-slate-400" />
                                {p.telefono}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          <td className="py-3.5 text-slate-500">
                            {p.email ? (
                              <span className="inline-flex items-center gap-1.5">
                                <Mail size={13} className="text-slate-400" />
                                {p.email}
                              </span>
                            ) : (
                              <span className="text-slate-300 text-xs italic">Sin correo</span>
                            )}
                          </td>
                          <td className="py-3.5">
                            <div className="flex justify-end">
                              <button
                                onClick={() => setPacienteParaConsulta(p)}
                                className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-white text-xs font-semibold"
                                style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }}
                              >
                                <Stethoscope size={14} />
                                Nueva Consulta
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      </div>

      {pacienteParaConsulta && (
        <NuevaConsultaModal
          paciente={pacienteParaConsulta}
          onClose={() => setPacienteParaConsulta(null)}
          onGuardado={() => {
            setPacienteParaConsulta(null);
            setMensajeExito(
              `Consulta registrada correctamente para ${pacienteParaConsulta.nombres}.`
            );
            setTimeout(() => setMensajeExito(null), 3500);
          }}
        />
      )}
    </main>
  );
}
