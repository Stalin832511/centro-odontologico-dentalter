// ============================================================
// SERVICIOS DE RADIOGRAFÍAS
// ============================================================

import { supabase } from "@/lib/supabase";
import { obtenerOCrearHistoria } from "@/services/historiaClinica";

export interface Radiografia {
  id: number;
  id_historia: number;
  tipo: string | null;
  descripcion: string | null;
  archivo_url: string;
  fecha: string;
}

export interface RadiografiaConUrl extends Radiografia {
  urlFirmada: string;
}

const SEGUNDOS_VALIDEZ_URL = 3600;

// ============================================================
// SUBIR RADIOGRAFÍA
// ============================================================

export async function subirRadiografia(datos: {
  idPaciente: number;
  archivo: File;
  tipo: string;
  descripcion: string;
  fecha: string;
}): Promise<void> {
  const idHistoria = await obtenerOCrearHistoria(datos.idPaciente);

  const extension =
    datos.archivo.name.split(".").pop()?.toLowerCase() ?? "jpg";

  const nombreUnico = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extension}`;

  const rutaArchivo = `${datos.idPaciente}/${nombreUnico}`;

  const { error: uploadError } = await supabase.storage
    .from("radiografias")
    .upload(rutaArchivo, datos.archivo, {
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { error: insertError } = await supabase
    .from("radiografias")
    .insert({
      id_historia: idHistoria,
      tipo: datos.tipo || null,
      descripcion: datos.descripcion.trim() || null,
      archivo_url: rutaArchivo,
      fecha: datos.fecha,
    });

  if (insertError) {
    // Si la BD falla, intentamos eliminar el archivo
    // para evitar archivos huérfanos en Storage.
    await supabase.storage
      .from("radiografias")
      .remove([rutaArchivo]);

    throw insertError;
  }
}

// ============================================================
// LISTAR RADIOGRAFÍAS DE UN PACIENTE
// ============================================================

export async function listarRadiografiasPorPaciente(
  idPaciente: number
): Promise<RadiografiaConUrl[]> {
  const { data: historia, error: historiaError } = await supabase
    .from("historia_clinica")
    .select("id")
    .eq("id_paciente", idPaciente)
    .maybeSingle();

  if (historiaError) {
    throw historiaError;
  }

  if (!historia) {
    return [];
  }

  const { data, error } = await supabase
    .from("radiografias")
    .select(
      "id, id_historia, tipo, descripcion, archivo_url, fecha"
    )
    .eq("id_historia", historia.id)
    .order("fecha", { ascending: false });

  if (error) {
    throw error;
  }

  const radiografias = data ?? [];

  const conUrls = await Promise.all(
    radiografias.map(async (radiografia) => {
      const { data: firmada, error: urlError } =
        await supabase.storage
          .from("radiografias")
          .createSignedUrl(
            radiografia.archivo_url,
            SEGUNDOS_VALIDEZ_URL
          );

      return {
        ...radiografia,
        urlFirmada: urlError
          ? ""
          : firmada?.signedUrl ?? "",
      };
    })
  );

  return conUrls;
}

// ============================================================
// LISTAR RADIOGRAFÍAS DEL PACIENTE LOGUEADO
// ============================================================

export async function listarMisRadiografias(): Promise<
  RadiografiaConUrl[]
> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: paciente, error } = await supabase
    .from("pacientes")
    .select("id")
    .eq("id_usuario", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!paciente) {
    return [];
  }

  return listarRadiografiasPorPaciente(paciente.id);
}

// ============================================================
// ELIMINAR RADIOGRAFÍA
// ============================================================

export async function eliminarRadiografia(
  id: number,
  archivoUrl: string
): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from("radiografias")
    .remove([archivoUrl]);

  if (storageError) {
    throw storageError;
  }

  const { error: dbError } = await supabase
    .from("radiografias")
    .delete()
    .eq("id", id);

  if (dbError) {
    throw dbError;
  }
}