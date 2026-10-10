// ============================================================
// SERVICIOS DE RESULTADOS (RX externas, laboratorio, prótesis, etc.)
// Mismo patrón que services/radiografias.ts
// ============================================================

import { supabase } from "@/lib/supabase";
import { obtenerOCrearHistoria } from "@/services/historiaClinica";

export interface TipoResultado {
  id: number;
  slug: string;
  nombre: string;
  icono: string | null;
  permite_multiples: boolean;
}

export interface EntidadReferente {
  id: number;
  nombre: string;
  tipo: string | null;
  telefono: string | null;
  email: string | null;
}

export interface Resultado {
  id: number;
  id_historia: number;
  id_tipo_resultado: number;
  id_entidad_referente: number | null;
  titulo: string | null;
  descripcion: string | null;
  archivo_url: string | null;
  origen: "interno" | "externo";
  subido_por: string | null;
  estado: "pendiente" | "revisado";
  fecha: string;
}

export interface ResultadoConUrl extends Resultado {
  urlFirmada: string;
  tipo_resultado?: TipoResultado;
  entidad_referente?: EntidadReferente | null;
}

const SEGUNDOS_VALIDEZ_URL = 3600;

// ============================================================
// CATÁLOGOS
// ============================================================

export async function listarTiposResultado(): Promise<TipoResultado[]> {
  const { data, error } = await supabase
    .from("tipos_resultado")
    .select("id, slug, nombre, icono, permite_multiples")
    .eq("activo", true)
    .order("orden", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function listarEntidadesReferentes(): Promise<
  EntidadReferente[]
> {
  const { data, error } = await supabase
    .from("entidades_referentes")
    .select("id, nombre, tipo, telefono, email")
    .eq("activo", true)
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ============================================================
// SUBIR RESULTADO (uso interno — admin/médico logueados)
// ============================================================

export async function subirResultado(datos: {
  idPaciente: number;
  idTipoResultado: number;
  archivo: File | null;
  titulo: string;
  descripcion: string;
  fecha: string;
}): Promise<void> {
  const idHistoria = await obtenerOCrearHistoria(datos.idPaciente);

  let rutaArchivo: string | null = null;

  if (datos.archivo) {
    const extension =
      datos.archivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const nombreUnico = `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${extension}`;
    rutaArchivo = `${datos.idPaciente}/${nombreUnico}`;

    const { error: uploadError } = await supabase.storage
      .from("resultados")
      .upload(rutaArchivo, datos.archivo, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;
  }

  const { error: insertError } = await supabase.from("resultados").insert({
    id_historia: idHistoria,
    id_tipo_resultado: datos.idTipoResultado,
    titulo: datos.titulo.trim() || null,
    descripcion: datos.descripcion.trim() || null,
    archivo_url: rutaArchivo,
    origen: "interno",
    estado: "revisado",
    fecha: datos.fecha,
  });

  if (insertError) {
    if (rutaArchivo) {
      await supabase.storage.from("resultados").remove([rutaArchivo]);
    }
    throw insertError;
  }
}

// ============================================================
// LISTAR RESULTADOS DE UN PACIENTE (admin/médico)
// ============================================================

export async function listarResultadosPorPaciente(
  idPaciente: number
): Promise<ResultadoConUrl[]> {
  const { data: historia, error: historiaError } = await supabase
    .from("historia_clinica")
    .select("id")
    .eq("id_paciente", idPaciente)
    .maybeSingle();

  if (historiaError) throw historiaError;
  if (!historia) return [];

  const { data, error } = await supabase
    .from("resultados")
    .select(
      `id, id_historia, id_tipo_resultado, id_entidad_referente,
       titulo, descripcion, archivo_url, origen, subido_por, estado, fecha,
       tipos_resultado ( id, slug, nombre, icono, permite_multiples ),
       entidades_referentes ( id, nombre, tipo, telefono, email )`
    )
    .eq("id_historia", historia.id)
    .order("fecha", { ascending: false });

  if (error) throw error;

  const resultados = (data as any[]) ?? [];

  const conUrls = await Promise.all(
    resultados.map(async (r) => {
      let urlFirmada = "";
      if (r.archivo_url) {
        const { data: firmada } = await supabase.storage
          .from("resultados")
          .createSignedUrl(r.archivo_url, SEGUNDOS_VALIDEZ_URL);
        urlFirmada = firmada?.signedUrl ?? "";
      }
      return {
        ...r,
        tipo_resultado: r.tipos_resultado,
        entidad_referente: r.entidades_referentes,
        urlFirmada,
      };
    })
  );

  return conUrls;
}

// ============================================================
// LISTAR MIS RESULTADOS (paciente logueado)
// ============================================================

export async function listarMisResultados(): Promise<ResultadoConUrl[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: paciente, error } = await supabase
    .from("pacientes")
    .select("id")
    .eq("id_usuario", user.id)
    .maybeSingle();

  if (error) throw error;
  if (!paciente) return [];

  // RLS ya filtra a "estado = revisado o no" según tu política;
  // si quieres ocultar pendientes al paciente, añade el filtro:
  // .eq("estado", "revisado") en la policy o aquí.
  return listarResultadosPorPaciente(paciente.id);
}

// ============================================================
// MARCAR COMO REVISADO
// ============================================================

export async function marcarResultadoRevisado(id: number): Promise<void> {
  const { error } = await supabase
    .from("resultados")
    .update({ estado: "revisado" })
    .eq("id", id);

  if (error) throw error;
}

// ============================================================
// ELIMINAR RESULTADO
// ============================================================

export async function eliminarResultado(
  id: number,
  archivoUrl: string | null
): Promise<void> {
  if (archivoUrl) {
    const { error: storageError } = await supabase.storage
      .from("resultados")
      .remove([archivoUrl]);
    if (storageError) throw storageError;
  }

  const { error: dbError } = await supabase
    .from("resultados")
    .delete()
    .eq("id", id);

  if (dbError) throw dbError;
}