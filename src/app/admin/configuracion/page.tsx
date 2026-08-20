"use client";

import { useState } from "react";
import {
  Lock,
  Save,
  ShieldCheck,
  CheckCircle,
} from "lucide-react";

export default function ConfiguracionPage() {

  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [confirmar, setConfirmar] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  const cambiarPassword = () => {

    setMensaje("");
    setError("");

    const passwordGuardada =
      localStorage.getItem("admin_password") ||
      "admin123";

    if (actual !== passwordGuardada) {
      setError("La contraseña actual es incorrecta");
      return;
    }

    if (nueva.length < 6) {
      setError(
        "La nueva contraseña debe tener mínimo 6 caracteres"
      );
      return;
    }

    if (nueva !== confirmar) {
      setError(
        "Las nuevas contraseñas no coinciden"
      );
      return;
    }

    localStorage.setItem(
      "admin_password",
      nueva
    );

    setMensaje(
      "Contraseña actualizada correctamente"
    );

    setActual("");
    setNueva("");
    setConfirmar("");
  };

  return (
    <main className="p-6 md:p-10">

      <div className="mb-8">

        <h1 className="text-4xl font-black text-slate-800">
          Configuración
        </h1>

        <p className="text-slate-500 mt-2">
          Administración de seguridad y acceso.
        </p>

      </div>

      <div
        className="
          max-w-3xl

          bg-white

          rounded-[30px]

          shadow-xl

          p-8
        "
      >

        <div className="flex items-center gap-4 mb-8">

          <div
            className="
              w-16
              h-16

              rounded-2xl

              bg-cyan-100

              flex
              items-center
              justify-center

              text-cyan-600
            "
          >
            <ShieldCheck size={32} />
          </div>

          <div>

            <h2 className="text-2xl font-bold">
              Cambiar Contraseña
            </h2>

            <p className="text-slate-500">
              Actualice la contraseña de acceso al sistema.
            </p>

          </div>

        </div>

        {/* Contraseña actual */}

        <div className="mb-5">

          <label className="block mb-2 font-medium">
            Contraseña Actual
          </label>

          <div className="relative">

            <Lock
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2

                text-slate-400
              "
            />

            <input
              type="password"
              value={actual}
              onChange={(e) =>
                setActual(e.target.value)
              }
              className="
                w-full

                border

                rounded-2xl

                pl-12
                pr-4
                py-4

                outline-none

                focus:ring-2
                focus:ring-cyan-400
              "
            />

          </div>

        </div>

        {/* Nueva */}

        <div className="mb-5">

          <label className="block mb-2 font-medium">
            Nueva Contraseña
          </label>

          <div className="relative">

            <Lock
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2

                text-slate-400
              "
            />

            <input
              type="password"
              value={nueva}
              onChange={(e) =>
                setNueva(e.target.value)
              }
              className="
                w-full

                border

                rounded-2xl

                pl-12
                pr-4
                py-4

                outline-none

                focus:ring-2
                focus:ring-cyan-400
              "
            />

          </div>

        </div>

        {/* Confirmar */}

        <div className="mb-8">

          <label className="block mb-2 font-medium">
            Confirmar Nueva Contraseña
          </label>

          <div className="relative">

            <Lock
              className="
                absolute
                left-4
                top-1/2
                -translate-y-1/2

                text-slate-400
              "
            />

            <input
              type="password"
              value={confirmar}
              onChange={(e) =>
                setConfirmar(e.target.value)
              }
              className="
                w-full

                border

                rounded-2xl

                pl-12
                pr-4
                py-4

                outline-none

                focus:ring-2
                focus:ring-cyan-400
              "
            />

          </div>

        </div>

        {error && (

          <div
            className="
              mb-6

              bg-red-100
              text-red-700

              rounded-xl

              p-4
            "
          >
            {error}
          </div>

        )}

        {mensaje && (

          <div
            className="
              mb-6

              bg-green-100
              text-green-700

              rounded-xl

              p-4

              flex
              items-center
              gap-3
            "
          >
            <CheckCircle size={20} />
            {mensaje}
          </div>

        )}

        <button
          onClick={cambiarPassword}
          className="
            bg-gradient-to-r
            from-cyan-500
            to-blue-600

            text-white

            px-8
            py-4

            rounded-2xl

            font-semibold

            flex
            items-center
            gap-3

            hover:scale-105

            transition-all
          "
        >
          <Save size={20} />
          Guardar Cambios
        </button>

      </div>

    </main>
  );
}