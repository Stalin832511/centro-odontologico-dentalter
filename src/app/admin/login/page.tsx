"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  UserRound,
  Stethoscope,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Role = "administrador" | "medico" | "paciente";

const ROLES: {
  id: Role;
  label: string;
  icon: typeof ShieldCheck;
  redirect: string;
  placeholder: string;
}[] = [
  {
    id: "administrador",
    label: "Administrador",
    icon: ShieldCheck,
    redirect: "/admin/dashboard",
    placeholder: "admin@clinica.com",
  },
  {
    id: "medico",
    label: "Médico",
    icon: Stethoscope,
    // ⚠️ Revisa esta ruta: si tu carpeta real es "medicos/dashboard"
    // (plural), cámbiala a "/medicos/dashboard" para evitar un 404.
    redirect: "/medico/dashboard",
    placeholder: "doctor@clinica.com",
  },
  {
    id: "paciente",
    label: "Paciente",
    icon: UserRound,
    redirect: "/paciente/dashboard",
    placeholder: "tucorreo@ejemplo.com",
  },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get("role") as Role) || "administrador";

  const [role, setRole] = useState<Role>(initialRole);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeRole = ROLES.find((r) => r.id === role)!;
  const ActiveIcon = activeRole.icon;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1) Autenticación REAL contra Supabase
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError || !data.user) {
        throw new Error("Correo o contraseña incorrectos.");
      }

      // 2) Verificamos que el rol guardado en el usuario incluya el
      //    que seleccionó en el formulario (evita que un paciente
      //    entre por el selector de "Administrador", por ejemplo).
      //
      //    IMPORTANTE: el rol puede venir como texto simple
      //    ("rol": "medico") para cuentas normales, o como arreglo
      //    ("rol": ["administrador", "medico"]) para cuentas con
      //    doble rol como la de la Dra. Fajardo. Este bloque
      //    normaliza ambos casos antes de comparar.
      const rolGuardado = data.user.user_metadata?.rol as Role | Role[] | undefined;
      const rolesDeLaCuenta = Array.isArray(rolGuardado)
        ? rolGuardado
        : rolGuardado
        ? [rolGuardado]
        : [];

      if (!rolesDeLaCuenta.includes(role)) {
        await supabase.auth.signOut();
        throw new Error(
          `Esta cuenta no tiene permisos de ${activeRole.label.toLowerCase()}. Verifica el tipo de cuenta seleccionado.`
        );
      }

      // 3) Redirige al dashboard correspondiente
      router.push(activeRole.redirect);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocurrió un error al iniciar sesión.");
      setLoading(false);
    }
  }

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
            <ActiveIcon size={22} />
            <span>Acceso {activeRole.label.toLowerCase()}</span>
          </div>

          <h1 className="text-5xl xl:text-6xl font-black leading-tight mb-6">
            Centro
            <br />
            Odontológico
            <br />
            Premium
          </h1>

          <p className="text-xl text-white/80 leading-relaxed max-w-xl">
            Plataforma inteligente para la gestión de pacientes, doctores,
            citas médicas, servicios, reportes y administración integral
            del consultorio.
          </p>
        </div>

        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 md:p-10">
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-[26px] sm:rounded-[30px] bg-white flex items-center justify-center text-4xl sm:text-5xl mb-4 sm:mb-5">
                🦷
              </div>
              <h2 className="text-white text-3xl sm:text-4xl font-black mb-2">
                Iniciar Sesión
              </h2>
              <p className="text-white/70 text-sm sm:text-base">
                Selecciona tu tipo de cuenta para continuar
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-7 p-1.5 bg-white/10 border border-white/15 rounded-2xl">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const isActive = role === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id)}
                    className={`
                      flex flex-col items-center gap-1.5
                      py-3 rounded-xl
                      text-[11px] sm:text-xs font-semibold
                      transition-all duration-200
                      ${isActive
                        ? "bg-white text-slate-800 shadow-lg"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                      }
                    `}
                  >
                    <Icon
                      size={19}
                      className={isActive ? "text-cyan-600" : "text-white/60"}
                    />
                    {r.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="text-white/80 text-sm block mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60"
                  />
                  <input
                    type="email"
                    required
                    placeholder={activeRole.placeholder}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="
                      w-full bg-white/10 border border-white/20
                      rounded-2xl py-3.5 sm:py-4 pl-12 pr-4
                      text-white placeholder:text-white/40
                      outline-none focus:border-cyan-400
                      transition-colors
                    "
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="text-white/80 text-sm block mb-2">
                  Contraseña
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
                    className="
                      w-full bg-white/10 border border-white/20
                      rounded-2xl py-3.5 sm:py-4 pl-12 pr-11
                      text-white placeholder:text-white/40
                      outline-none focus:border-cyan-400
                      transition-colors
                    "
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

              <div className="flex justify-end mb-6">
                <Link
                  href="/recuperar-password"
                  className="text-xs sm:text-sm text-cyan-300 hover:text-cyan-200 hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {error && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-400/30 text-red-300 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full py-4 rounded-2xl
                  bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600
                  text-white font-bold
                  flex items-center justify-center gap-3
                  hover:scale-[1.02]
                  disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100
                  transition-all
                "
              >
                {loading ? "Verificando..." : `Ingresar como ${activeRole.label}`}
                {!loading && <ArrowRight size={20} />}
              </button>
            </form>

            {role === "paciente" && (
              <p className="text-center text-sm text-white/70 mt-6">
                ¿Primera vez aquí?{" "}
                <Link href="/agendar" className="font-semibold text-cyan-300 hover:underline">
                  Agenda tu primera cita para crear tu cuenta
                </Link>
              </p>
            )}

            <div className="text-center mt-6 sm:mt-8 text-white/60 text-sm">
              © {new Date().getFullYear()} Centro Odontológico Premium
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}