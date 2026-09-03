"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SidebarPaciente from "@/components/paciente/SidebarPaciente";
import TopbarPaciente from "@/components/paciente/TopbarPaciente";
import { supabase } from "@/lib/supabase";
import { subirFotoPerfil } from "@/services/pacientes";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  IdCard,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Save,
  Camera,
} from "lucide-react";

interface DatosPaciente {
  id: number;
  nombres: string;
  apellidos: string;
  cedula: string;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  foto_url: string | null;
}

export default function MisDatosPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const inputFotoRef = useRef<HTMLInputElement>(null);

  const [datos, setDatos] = useState<DatosPaciente | null>(null);
  const [form, setForm] = useState({ telefono: "", email: "", direccion: "" });

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
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error();

        const { data, error: err } = await supabase
          .from("pacientes")
          .select("id, nombres, apellidos, cedula, telefono, email, direccion, foto_url")
          .eq("id_usuario", user.id)
          .single();

        if (err || !data) throw new Error();

        setDatos(data);
        setForm({
          telefono: data.telefono ?? "",
          email: data.email ?? "",
          direccion: data.direccion ?? "",
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
    if (!datos) return;

    setError(null);
    setGuardando(true);

    const { error: err } = await supabase
      .from("pacientes")
      .update({
        telefono: form.telefono.trim() || null,
        email: form.email.trim() || null,
        direccion: form.direccion.trim() || null,
      })
      .eq("id", datos.id);

    setGuardando(false);

    if (err) {
      setError("No se pudieron guardar los cambios. Intenta de nuevo.");
      return;
    }

    setMensajeExito("Tus datos se actualizaron correctamente.");
    setTimeout(() => setMensajeExito(null), 3000);
  }

  async function handleSeleccionarFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const archivo = e.target.files?.[0];
    if (!archivo || !datos) return;

    // Validaciones básicas antes de subir
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
      const nuevaUrl = await subirFotoPerfil(datos.id, archivo);
      setDatos({ ...datos, foto_url: nuevaUrl });
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
        <SidebarPaciente isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <section className="flex-1 min-w-0">
          <TopbarPaciente onMenuClick={() => setSidebarOpen(true)} />

          <div className="p-4 md:p-6 xl:p-8 max-w-[700px] mx-auto">
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
                Mis Datos
              </h1>
              <p className="text-slate-300 max-w-xl text-sm sm:text-[15px] leading-relaxed">
                Mantén actualizado tu teléfono, correo y dirección.
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
              ) : datos ? (
                <>
                  {/* FOTO DE PERFIL */}
                  <div className="flex flex-col items-center mb-6 pb-6 border-b border-slate-100">
                    <div className="relative">
                      <img
                        src={datos.foto_url || "/imagenes/Quienes-somos.jpeg"}
                        alt="Foto de perfil"
                        className="w-24 h-24 rounded-full object-cover border-4 border-slate-100"
                      />
                      <button
                        type="button"
                        onClick={() => inputFotoRef.current?.click()}
                        disabled={subiendoFoto}
                        className="absolute bottom-0 right-0 w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center border-4 border-white hover:bg-sky-700 transition-colors disabled:opacity-60"
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

                  {/* Datos de solo lectura — identidad, no se edita aquí */}
                  <div className="grid grid-cols-2 gap-3 mb-5 pb-5 border-b border-slate-100">
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                        Nombre completo
                      </p>
                      <p className="text-sm font-semibold text-slate-700">
                        {datos.nombres} {datos.apellidos}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                        <IdCard size={12} /> Cédula
                      </p>
                      <p className="text-sm font-semibold text-slate-700">{datos.cedula}</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-1.5">
                        <Phone size={13} /> Teléfono
                      </label>
                      <input
                        value={form.telefono}
                        onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
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
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5 mb-1.5">
                        <MapPin size={13} /> Dirección
                      </label>
                      <input
                        value={form.direccion}
                        onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-sky-400/40 focus:border-sky-400"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={guardando}
                      className="w-full py-3 rounded-xl text-white text-sm font-semibold transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                      style={{ background: "linear-gradient(135deg, #0ea5e9, #0369a1)" }}
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