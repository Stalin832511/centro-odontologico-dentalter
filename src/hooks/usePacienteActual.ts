"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface PacienteActual {
  id: number;
  nombres: string;
  apellidos: string;
  foto_url: string | null;
}

// Hook reutilizable: obtiene los datos del paciente logueado
// (nombre real, no el email ni metadata de Auth) para usarlos
// en Sidebar, Topbar, y cualquier otra pantalla del portal.
// Evita repetir la misma consulta a Supabase en cada componente.
export function usePacienteActual() {
  const [paciente, setPaciente] = useState<PacienteActual | null>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (activo) setCargando(false);
        return;
      }

      const { data } = await supabase
        .from("pacientes")
        .select("id, nombres, apellidos, foto_url")
        .eq("id_usuario", user.id)
        .maybeSingle();

      if (activo) {
        setPaciente(data);
        setCargando(false);
      }
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  return { paciente, cargando };
}