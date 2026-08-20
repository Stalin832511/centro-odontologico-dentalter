"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Sparkles,
  Mail,
  RotateCw,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

// ============================================================
// Traducción de errores a mensajes claros para el usuario
// ============================================================
function traducirErrorLink(errorCode: string | null, errorDescription: string | null) {
  switch (errorCode) {
    case "otp_expired":
      return "Tu enlace de activación caducó o ya fue utilizado.";
    case "access_denied":
      return "El enlace ya no es válido. Puede que haya expirado o que ya se haya usado antes.";
    default:
      return errorDescription
        ? decodeURIComponent(errorDescription.replace(/\+/g, " "))
        : null;
  }
}

function traducirErrorPassword(mensaje: string) {
  if (mensaje.includes("different from the old password")) {
    return "Elige una contraseña distinta a la que usaste antes.";
  }
  if (mensaje.includes("Password should be at least")) {
    return "La contraseña es demasiado corta.";
  }
  if (mensaje.includes("session") || mensaje.includes("expired")) {
    return "Tu sesión de activación expiró. Solicita un nuevo enlace.";
  }
  return "Ocurrió un error al guardar tu contraseña. Intenta nuevamente.";
}

export default function ActivarCuentaPage() {
  const router = useRouter();
  const { user, cargando: cargandoAuth } = useAuth();

  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // Detección del error que Supabase manda directo en el hash de la URL
  // (#error=access_denied&error_code=otp_expired&...) — no depende de useAuth.
  const [linkErrorMsg, setLinkErrorMsg] = useState<string | null>(null);

  // Si cargandoAuth se queda pegado en true (por ejemplo, porque el link
  // traía un error y el listener de auth nunca dispara), no dejamos al
  // usuario viendo el spinner para siempre.
  const [tiempoAgotado, setTiempoAgotado] = useState(false);

  // Reenvío de correo de activación
  const [mostrarReenvio, setMostrarReenvio] = useState(false);
  const [emailReenvio, setEmailReenvio] = useState("");
  const [estadoReenvio, setEstadoReenvio] = useState<"idle" | "enviando" | "enviado" | "error">("idle");
  const [mensajeReenvio, setMensajeReenvio] = useState("");

  useEffect(() => {
    const hash = window.location.hash?.substring(1) ?? "";
    const hashParams = new URLSearchParams(hash);
    const err = hashParams.get("error");
    if (err) {
      const code = hashParams.get("error_code");
      const desc = hashParams.get("error_description");
      setLinkErrorMsg(traducirErrorLink(code, desc));
    }
  }, []);

  useEffect(() => {
    if (!cargandoAuth) return;
    const t = setTimeout(() => setTiempoAgotado(true), 8000);
    return () => clearTimeout(t);
  }, [cargandoAuth]);

  // ===============================
  // REGLAS DE CONTRASEÑA
  // ===============================
  const requisitos = [
    { label: "Mínimo 8 caracteres", cumple: password.length >= 8 },
    { label: "Al menos una letra mayúscula", cumple: /[A-Z]/.test(password) },
    { label: "Al menos un número", cumple: /[0-9]/.test(password) },
  ];

  const passwordValida = requisitos.every((r) => r.cumple);
  const passwordsCoinciden =
    password.length > 0 && password === confirmarPassword;

  // ===============================
  // CREAR CONTRASEÑA Y COMPLETAR ACTIVACIÓN
  // ===============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!passwordValida) {
      setError("La contraseña no cumple los requisitos mínimos");
      return;
    }

    if (!passwordsCoinciden) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setEnviando(true);

    // --- Paso 1: guardar la contraseña -------------------------------
    // Separado del paso 2 a propósito: si esto tiene éxito, el usuario
    // YA quedó activado. Un fallo posterior en la vinculación de cédula
    // no debe hacerle creer que su contraseña no se guardó (eso era lo
    // que causaba el error "New password should be different" al reintentar).
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(traducirErrorPassword(updateError.message));
      setEnviando(false);
      return;
    }

    // --- Paso 2: vincular su fila de `pacientes` (no bloqueante) -----
    const cedula = user?.user_metadata?.cedula;
    if (cedula && user) {
      const { error: linkError } = await supabase
        .from("pacientes")
        .update({ id_usuario: user.id })
        .eq("cedula", cedula);

      if (linkError) {
        // No detenemos el flujo del usuario por esto: su cuenta ya está
        // activa. Lo dejamos registrado para revisarlo desde soporte.
        console.error("No se pudo vincular la cédula al usuario:", linkError);
      }
    }

    router.push("/paciente/dashboard");
  };

  // ===============================
  // REENVIAR ENLACE DE ACTIVACIÓN
  // ===============================
  const handleReenviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setMensajeReenvio("");

    if (!emailReenvio.trim()) {
      setMensajeReenvio("Ingresa tu correo para reenviarte el enlace.");
      return;
    }

    setEstadoReenvio("enviando");

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email: emailReenvio.trim(),
    });

    if (resendError) {
      setEstadoReenvio("error");
      setMensajeReenvio("No pudimos reenviar el correo. Verifica que esté bien escrito.");
      return;
    }

    setEstadoReenvio("enviado");
  };

  // ===============================
  // ESTADO: CARGANDO SESIÓN
  // ===============================
  const mostrandoCarga = cargandoAuth && !tiempoAgotado && !linkErrorMsg;

  if (mostrandoCarga) {
    return (
      <main className="min-h-screen relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-900" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-cyan-400 animate-spin" />
          <p className="text-white/70 text-sm">Verificando tu enlace...</p>
        </div>
      </main>
    );
  }

  // ===============================
  // ESTADO: NO HAY SESIÓN → EL LINK NO ES VÁLIDO O YA EXPIRÓ
  // ===============================
  if (!user) {
    return (
      <main className="min-h-screen relative flex items-center justify-center overflow-hidden px-5">
        <div className="absolute inset-0">
          <img
            src="/imagenes/Quienes-somos.jpeg"
            alt="DentalCare"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-cyan-900/70" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-[32px] sm:rounded-[40px] p-8 sm:p-10 text-center">
            <div className="w-20 h-20 mx-auto rounded-[26px] bg-red-500/15 flex items-center justify-center mb-6">
              <XCircle size={40} className="text-red-400" />
            </div>
            <h2 className="text-white text-2xl sm:text-3xl font-black mb-3">
              Enlace no válido
            </h2>
            <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-6">
              {linkErrorMsg ??
                "Este enlace de activación ya fue usado, expiró, o no es correcto."}
            </p>

            {!mostrarReenvio ? (
              <div className="space-y-3">
                <button
                  onClick={() => setMostrarReenvio(true)}
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white font-bold hover:scale-[1.02] transition-all"
                >
                  <RotateCw size={18} />
                  Reenviar enlace de activación
                </button>
                <Link
                  href="/agendar"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/20 text-white/80 font-semibold hover:bg-white/5 transition-all"
                >
                  Agendar una consulta nueva
                </Link>
                <Link
                  href="/admin/login?role=paciente"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-white/20 text-white/80 font-semibold hover:bg-white/5 transition-all"
                >
                  Ya tengo cuenta, iniciar sesión
                </Link>
              </div>
            ) : estadoReenvio === "enviado" ? (
              <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 flex flex-col items-center gap-2">
                <CheckCircle2 size={26} className="text-emerald-400" />
                <p className="text-emerald-300 text-sm font-semibold">Correo reenviado</p>
                <p className="text-white/60 text-xs">
                  Revisa tu bandeja de entrada y spam, y abre el enlace en cuanto llegue.
                </p>
              </div>
            ) : (
              <form onSubmit={handleReenviar} className="space-y-3 text-left">
                <label className="text-white/80 text-sm block">Tu correo electrónico</label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                  />
                  <input
                    type="email"
                    value={emailReenvio}
                    onChange={(e) => setEmailReenvio(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-3.5 pl-11 pr-4 text-white placeholder:text-white/40 outline-none focus:border-cyan-400 transition-colors text-sm"
                  />
                </div>

                {mensajeReenvio && (
                  <p className="text-xs text-red-300">{mensajeReenvio}</p>
                )}

                <button
                  type="submit"
                  disabled={estadoReenvio === "enviando"}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 text-white font-bold hover:scale-[1.02] disabled:opacity-60 transition-all"
                >
                  {estadoReenvio === "enviando" ? "Enviando..." : "Enviar enlace"}
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarReenvio(false)}
                  className="w-full text-center text-white/50 text-xs font-semibold hover:text-white/70"
                >
                  Cancelar
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ===============================
  // ESTADO: FORMULARIO DE ACTIVACIÓN
  // ===============================
  return (
    <main className="min-h-screen relative flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="/imagenes/Quienes-somos.jpeg"
          alt="DentalCare"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-cyan-900/70" />
      </div>

      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 items-center px-5 sm:px-6 py-10">
        <div className="hidden lg:block text-white pr-12">
          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/10 backdrop-blur-xl border border-white/10 mb-8">
            <Sparkles size={22} className="text-cyan-300" />
            <span>Bienvenido al equipo DentalCare</span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-black leading-tight mb-6">
            Tu cita ya
            <br />
            está agendada
          </h1>

          <p className="text-xl text-white/80 leading-relaxed max-w-xl">
            Solo falta un paso: crea tu contraseña para acceder a tu portal
            de paciente, donde podrás ver tu receta médica, historial y
            próximas citas.
          </p>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 md:p-10">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-[26px] sm:rounded-[30px] bg-white flex items-center justify-center text-4xl sm:text-5xl mb-4 sm:mb-5">
                🦷
              </div>
              <h2 className="text-white text-3xl sm:text-4xl font-black mb-2">
                Activa tu cuenta
              </h2>
              <p className="text-white/70 text-sm sm:text-base">
                Para <span className="text-cyan-300">{user.email}</span>
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="text-white/80 text-sm block mb-2">
                  Crea tu contraseña
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-3.5 sm:py-4 pl-12 pr-11 text-white placeholder:text-white/40 outline-none focus:border-cyan-400 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80"
                  >
                    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <label className="text-white/80 text-sm block mb-2">
                  Confirma tu contraseña
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••"
                    value={confirmarPassword}
                    onChange={(e) => setConfirmarPassword(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-3.5 sm:py-4 pl-12 pr-4 text-white placeholder:text-white/40 outline-none focus:border-cyan-400 transition-colors"
                  />
                </div>
                {confirmarPassword.length > 0 && (
                  <p
                    className={`text-xs mt-2 flex items-center gap-1.5 ${
                      passwordsCoinciden ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {passwordsCoinciden ? (
                      <>
                        <CheckCircle2 size={13} /> Las contraseñas coinciden
                      </>
                    ) : (
                      <>
                        <XCircle size={13} /> Las contraseñas no coinciden
                      </>
                    )}
                  </p>
                )}
              </div>

              <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                {requisitos.map((req, i) => (
                  <p
                    key={i}
                    className={`text-xs flex items-center gap-2 transition-colors ${
                      req.cumple ? "text-emerald-400" : "text-white/50"
                    }`}
                  >
                    {req.cumple ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0" />
                    )}
                    {req.label}
                  </p>
                ))}
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-400/30 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={enviando || !passwordValida || !passwordsCoinciden}
                className="
                  w-full py-4 rounded-2xl
                  bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600
                  text-white font-bold
                  flex items-center justify-center gap-3
                  hover:scale-[1.02]
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  transition-all
                "
              >
                {enviando ? (
                  "Activando cuenta..."
                ) : (
                  <>
                    <ShieldCheck size={20} />
                    Activar mi cuenta
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="text-center mt-6 sm:mt-8 text-white/60 text-sm">
              © {new Date().getFullYear()} Centro Odontológico Premium
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
