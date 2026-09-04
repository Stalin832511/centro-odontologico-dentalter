"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/context/AuthContext";

type Rol = "administrador" | "medico" | "paciente";

interface ProtegerRutaProps {
  children: ReactNode;
  rolRequerido: Rol;
  rutaLogin: string;
}

export default function ProtegerRuta({
  children,
  rolRequerido,
  rutaLogin,
}: ProtegerRutaProps) {
  const router = useRouter();
  const pathname = usePathname();

  const { user, rol, cargando } = useAuth();

  const [verificando, setVerificando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function verificarSesion() {
      try {
        const {
          data: { user: usuarioActual },
          error,
        } = await supabase.auth.getUser();

        if (!activo) return;

        if (error || !usuarioActual) {
          setVerificando(false);
          router.replace(rutaLogin);
          return;
        }

        const rolActual = usuarioActual.user_metadata?.rol;

        if (rolActual !== rolRequerido) {
          setVerificando(false);
          router.replace(rutaLogin);
          return;
        }

        setVerificando(false);
      } catch (error) {
        console.error("Error verificando la sesión:", error);

        if (!activo) return;

        setVerificando(false);
        router.replace(rutaLogin);
      }
    }

    /*
     * Primera verificación.
     *
     * No verificamos mientras AuthContext todavía
     * está cargando la sesión inicial.
     */
    if (!cargando) {
      verificarSesion();
    }

    /*
     * Maneja el caso del botón "Atrás" del navegador.
     *
     * Algunos navegadores pueden restaurar una página
     * desde la memoria (bfcache) después de cerrar sesión.
     */
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) {
        verificarSesion();
      }
    }

    /*
     * Cuando el usuario vuelve a la pestaña,
     * comprobamos nuevamente la sesión.
     */
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        verificarSesion();
      }
    }

    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      activo = false;

      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [cargando, rolRequerido, rutaLogin, router]);

  /*
   * Mientras AuthContext está obteniendo la sesión,
   * no mostramos el contenido protegido.
   */
  if (cargando || verificando) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-teal-500" />

          <p className="text-sm text-gray-600">
            Verificando sesión...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Protección adicional utilizando el estado global
   * de autenticación.
   */
  if (!user) {
    return null;
  }

  /*
   * Protección adicional mediante el rol.
   */
  if (rol !== rolRequerido) {
    return null;
  }

  return <>{children}</>;
}