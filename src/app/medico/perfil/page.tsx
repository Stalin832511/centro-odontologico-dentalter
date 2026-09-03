"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SidebarMedico from "@/components/medico/SidebarMedico";
import TopbarMedico from "@/components/medico/TopbarMedico";
import {
  obtenerMiPerfilDoctor,
  actualizarMisDatosDoctor,
  subirFotoPerfilDoctor,
  PerfilDoctorActual,
} from "@/services/medico";
import {
  ArrowLeft,
  Phone,
  Mail,
  Stethoscope,
  IdCard,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Save,
  Camera,
} from "lucide-react";

export default function MisDatosMedicoPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const [perfil, setPerfil] = useState<PerfilDoctorActual | null>(null);
  const [form, setForm] = useState({ telefono: "", email: "", especialidad: "" });

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError(null);
      try {
        const data = await obtenerMiPerfilDoctor();
        if (!data) throw new Error();

        setPerfil(data);
        setForm({
          telefono: data.telefono ?? "",
          email: data.email ?? "",
          especialidad: data.especialidad ?? "",
        });
      } catch {
        setError("No pudimos cargar tus datos.");
      } finally {
        setCargando(false);
      }
    }
    cargar();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!perfil) return;

    setError(null);
    setGuardando(true);

    try {
      await actualizarMisDatosDoctor(perfil.id, {
        telefono: form.telefono.trim() || null,
        email: form.email.trim() || null,
        especialidad: form.especialidad.trim() || null,
      });
      setMensajeExito("Tus datos se actualizaron correctamente.");
      setTimeout(() => setMensajeExito(null), 3000);
    } catch {
      setError("No se pudieron guardar los cambios. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleSeleccionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo || !perfil) return;

    if (!archivo.type.startsWith("image/")) {
      setError("El archivo debe ser una imagen (JPG, PNG, etc.).");
      return;
    }
    if (archivo.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar los 5 MB.");
      return;
    }

    setError(null);
    setSubiendoFoto(true);

    try {
      const nuevaUrl = await subirFotoPerfilDoctor(perfil.id, archivo);
      setPerfil({ ...perfil, foto_url: nuevaUrl });
      setMensajeExito("Tu foto de perfil se actualizó correctamente.");
      setTimeout(() => setMensajeExito(null), 3000);
    } catch {
      setError("No se pudo subir la foto. Intenta de nuevo.");
    } finally {
      setSubiendoFoto(false);
      if (inputFotoRef.current) inputFotoRef.current.value = "";
    }
  }

  return (
    <main className="min-h-screen bg-[#f6f7fb]">
      <div className="flex">
        <SidebarMedico isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <section className="flex-1 min-w-0">
          <TopbarMedico onMenuClick={() => setSidebarOpen(true)} />

          <div className="p-4 md:p-6 xl:p-8 max-w-[700px] mx-auto">
            <button
              onClick={() => router.push("/medico/dashboard")}
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-teal-600 mb-5 transition-colors"
            >
              <ArrowLeft size={16} />
              Volver al inicio
            </button>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden rounded-2xl md:rounded-[28px] p-5 sm:p-8 md:p-10 mb-6 bg-gradient-to-br from-[#0a2e2c] via-[#0c3b3d] to-[#083344] shadow-[0_20px_60px_-15px_rgba(8,51,68,0.5)]"
            >
              <h1 className="text-white font-bold text-2xl sm:text-3xl md:text-[42px] leading-[1.1] mb-3 tracking-tight">
                Mis Datos
              </h1>
              <p className="text-slate-300 max-w-xl text-sm sm:text-[15px] leading-relaxed">
                Mantén actualizado tu teléfono, correo y especialidad.
              </p>
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

            <div className="bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-xl shadow-slate-200/50">
              {cargando ? (
                <div className="space-y-3">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
                  ))}
                </div>
              ) : perfil ? (
                <>
                  {/* FOTO DE PERFIL */}
                  <div className="flex flex-col items-center mb-6 pb-6 border-b border-slate-100">
                    <div className="relative">
                      {perfil.foto_url ? (
                        <img
                          src={perfil.foto_url}
                          alt="Foto de perfil"
                          className="w-24 h-24 rounded-full object-cover border-4 border-slate-100"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-teal-50 border-4 border-slate-100 flex items-center justify-center text-2xl font-black text-teal-600">
                          {perfil.nombres.charAt(0)}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => inputFotoRef.current?.click()}
                        disabled={subiendoFoto}
                        className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center border-4 border-white hover:bg-teal-700 transition-colors disabled:opacity-60"
                        title="Cambiar foto"
                      >
                        {subiendoFoto ? (
                          <Loader2 size={14} className="text-white animate-spin" />
                        ) : (
                          <Camera size={14} className="text-white" />
                        )}
                      </button>
                      <input
                        ref={inputFotoRef}
                        type="file"
                        accept="image/*"
                        onChange={handleSeleccionarFoto}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-3">
                      Toca el ícono de la cámara para cambiar tu foto
                    </p>
                  </div>

                  {/* Datos de solo lectura */}
                  <div className="grid grid-cols-2 gap-3 mb-5 pb-5 border-b border-slate-100">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                        Nombre completo
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {perfil.nombres} {perfil.apellidos}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <IdCard size={12} /> Cédula
                      </p>
                      <p className="text-sm font-semibold text-slate-700">{perfil.cedula}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-1.5">
                        <Stethoscope size={13} /> Especialidad
                      </label>
                      <input
                        value={form.especialidad}
                        onChange={(e) => setForm({ ...form, especialidad: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-1.5">
                        <Phone size={13} /> Teléfono
                      </label>
                      <input
                        value={form.telefono}
                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-1.5">
                        <Mail size={13} /> Correo electrónico
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-400/40 focus:border-teal-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={guardando}
                      className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg, #0d9488, #0c3b3d)" }}
                    >
                      {guardando ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                      Guardar Cambios
                    </button>
                  </form>
                </>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}