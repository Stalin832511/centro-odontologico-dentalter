"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle, FileText } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { capitalizarNombre } from "@/lib/texto";
import HojaMembretada from "@/components/impresion/HojaMembretada";

interface DatosImpresion {
  titulo: string;
  descripcion: string | null;
  fecha: string;
  archivoUrl: string;
  esPdf: boolean;
  pacienteNombre: string;
  pacienteCedula: string;
}

export default function ImprimirResultadoPage() {
  const params = useParams();
  const idResultado = params.id as string;

  const [datos, setDatos] = useState<DatosImpresion | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function cargar() {
      setCargando(true);
      setError(null);

      // RLS ya filtra: si es paciente, solo ve lo suyo; si es
      // staff, ve cualquiera. Si no tiene permiso, "data" viene null.
      const { data, error: err } = await supabase
        .from("resultados")
        .select(
          `id, titulo, descripcion, archivo_url, fecha,
           tipos_resultado ( nombre ),
           historia_clinica (
             pacientes ( nombres, apellidos, cedula )
           )`
        )
        .eq("id", idResultado)
        .maybeSingle();

      if (err || !data) {
        setError("No se pudo cargar este resultado o no tienes acceso a él.");
        setCargando(false);
        return;
      }

      let archivoUrl = "";
      if ((data as any).archivo_url) {
        const { data: firmada } = await supabase.storage
          .from("resultados")
          .createSignedUrl((data as any).archivo_url, 3600);
        archivoUrl = firmada?.signedUrl ?? "";
      }

      const paciente = (data as any).historia_clinica?.pacientes;

      setDatos({
        titulo:
          (data as any).titulo ??
          (data as any).tipos_resultado?.nombre ??
          "Resultado",
        descripcion: (data as any).descripcion,
        fecha: (data as any).fecha,
        archivoUrl,
        esPdf: archivoUrl.toLowerCase().split("?")[0].endsWith(".pdf"),
        pacienteNombre: paciente
          ? `${capitalizarNombre(paciente.nombres)} ${capitalizarNombre(
              paciente.apellidos
            )}`
          : "Paciente",
        pacienteCedula: paciente?.cedula ?? "",
      });
      setCargando(false);
    }

    cargar();
  }, [idResultado]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-cyan-500" />
      </div>
    );
  }

  if (error || !datos) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center px-4">
        <AlertCircle size={28} className="text-rose-400" />
        <p className="text-sm font-semibold text-slate-600">{error}</p>
      </div>
    );
  }

  return (
    <HojaMembretada
      tituloDocumento={datos.titulo}
      pacienteNombre={datos.pacienteNombre}
      pacienteCedula={datos.pacienteCedula}
      fecha={datos.fecha}
    >
      {datos.descripcion && (
        <p className="text-sm text-slate-600 mb-5">{datos.descripcion}</p>
      )}

      {datos.archivoUrl ? (
        datos.esPdf ? (
          <iframe
            src={datos.archivoUrl}
            title={datos.titulo}
            className="w-full h-[600px] rounded-xl border border-slate-200"
          />
        ) : (
          <img
            src={datos.archivoUrl}
            alt={datos.titulo}
            className="w-full rounded-xl border border-slate-200"
          />
        )
      ) : (
        <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
          <FileText size={28} />
          <p className="text-sm">Este resultado no tiene un archivo adjunto.</p>
        </div>
      )}
    </HojaMembretada>
  );
}