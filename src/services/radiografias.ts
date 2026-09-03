// ============================================================
// SERVICIOS DE RADIOGRAFÍAS
// Sube archivos al bucket privado "radiografias" de Supabase
// Storage y guarda su registro en la tabla `radiografias`,
// vinculado a la historia clínica del paciente (igual que las
// evoluciones). Como el bucket es privado, la lectura siempre
// pasa por una URL firmada temporal — nunca una URL pública fija.
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

const SEGUNDOS_VALIDEZ_URL = 3600; // 1 hora

/**
 * Sube el archivo de una radiografía y crea su registro. Crea (o
 * reutiliza) la historia clínica del paciente, igual que al
 * registrar una consulta — un paciente nunca tiene dos historias.
 */
export async function subirRadiografia(datos: {
  idPaciente: number;
  archivo: File;
  tipo: string;
  descripcion: string;
  fecha: string; // formato YYYY-MM-DD
}): Promise<void> {
  const idHistoria = await obtenerOCrearHistoria(datos.idPaciente);

  const extension = datos.archivo.name.split(".").pop() ?? "jpg";
  const nombreUnico = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;
  // Carpeta = id del paciente, para que la política de storage
  // "paciente_ve_sus_radiografias" pueda filtrar por dueño.
  const rutaArchivo = `${datos.idPaciente}/${nombreUnico}`;

  const { error: uploadError } = await supabase.storage
    .from("radiografias")
    .upload(rutaArchivo, datos.archivo, { cacheControl: "3600", upsert: false });

  if (uploadError) throw uploadError;

  const { error: insertError } = await supabase.from("radiografias").insert({
    id_historia: idHistoria,
    tipo: datos.tipo || null,
    descripcion: datos.descripcion || null,
    archivo_url: rutaArchivo,
    fecha: datos.fecha,
  });

  if (insertError) {
    // Si falló guardar el registro, no dejamos el archivo huérfano.
    await supabase.storage.from("radiografias").remove([rutaArchivo]);
    throw insertError;
  }
}

/**
 * Lista las radiografías de un paciente (a través de su historia
 * clínica), cada una con una URL firmada válida por 1 hora — el
 * bucket es privado, así que no hay URLs públicas permanentes.
 */
export async function listarRadiografiasPorPaciente(
  idPaciente: number
): Promise<RadiografiaConUrl[]> {
  const { data: historia } = await supabase
    .from("historia_clinica")
    .select("id")
    .eq("id_paciente", idPaciente)
    .maybeSingle();

  if (!historia) return [];

  const { data, error } = await supabase
    .from("radiografias")
    .select("*")
    .eq("id_historia", historia.id)
    .order("fecha", { ascending: false });

  if (error) throw error;

  const conUrls = await Promise.all(
    (data ?? []).map(async (r) => {
      const { data: firmada } = await supabase.storage
        .from("radiografias")
        .createSignedUrl(r.archivo_url, SEGUNDOS_VALIDEZ_URL);
      return { ...r, urlFirmada: firmada?.signedUrl ?? "" };
    })
  );

  return conUrls;
}

/**
 * Lista las radiografías del PACIENTE logueado (no de un id
 * cualquiera) — resuelve su propio id de paciente a partir de su
 * cuenta de Auth, y reutiliza la misma función de arriba. La
 * política RLS "paciente_ve_sus_radiografias_tabla" garantiza
 * además, a nivel de base de datos, que nunca pueda ver las de
 * otro paciente aunque intentara forzar el id.
 */
export async function listarMisRadiografias(): Promise<RadiografiaConUrl[]> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];

  const { data: paciente } = await supabase
    .from("pacientes")
    .select("id")
    .eq("id_usuario", userData.user.id)
    .maybeSingle();

  if (!paciente) return [];

  return listarRadiografiasPorPaciente(paciente.id);
}

export async function eliminarRadiografia(id: number, archivoUrl: string): Promise<void> {
  const { error: storageError } = await supabase.storage
    .from("radiografias")
    .remove([archivoUrl]);
  if (storageError) throw storageError;

  const { error: dbError } = await supabase.from("radiografias").delete().eq("id", id);
  if (dbError) throw dbError;
}