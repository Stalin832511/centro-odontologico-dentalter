// ============================================================
// SERVICIOS DEL MÉDICO
// Helpers para que el panel médico sepa "quién soy" (id_doctor)
// y pueda listar a sus propios pacientes.
// ============================================================

import { supabase } from "@/lib/supabase";

export interface PacienteDelMedico {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  email: string | null;
}

/**
 * Devuelve el id de la fila en `doctores` que corresponde al
 * usuario actualmente logueado (busca por id_usuario = auth.uid()).
 */
export async function obtenerIdDoctorActual(): Promise<number> {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    throw new Error("No se pudo identificar al usuario logueado.");
  }

  const { data, error } = await supabase
    .from("doctores")
    .select("id")
    .eq("id_usuario", userData.user.id)
    .single();

  if (error || !data) {
    throw new Error(
      "No se encontró una fila de doctor vinculada a esta cuenta. Verifica que el registro en 'doctores' tenga el id_usuario correcto."
    );
  }

  return data.id;
}

/**
 * Lista los pacientes del médico logueado.
 */
export async function obtenerMisPacientes(): Promise<PacienteDelMedico[]> {
  const { data, error } = await supabase
    .from("pacientes")
    .select("id, cedula, nombres, apellidos, telefono, email")
    .order("nombres", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// ============================================================
// Perfil del doctor para mostrar identidad real (nombre, foto)
// ============================================================
export interface PerfilDoctorActual {
  id: number;
  nombres: string;
  apellidos: string;
  cedula: string;
  telefono: string | null;
  email: string | null;
  especialidad: string | null;
  foto_url: string | null;
}

/**
 * Devuelve el perfil de doctor vinculado a la cuenta logueada,
 * o null si esta cuenta no tiene ninguna fila en `doctores`.
 */
export async function obtenerMiPerfilDoctor(): Promise<PerfilDoctorActual | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("doctores")
    .select("id, nombres, apellidos, cedula, telefono, email, especialidad, foto_url")
    .eq("id_usuario", userData.user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}

/**
 * Actualiza los datos de contacto del médico logueado
 * (teléfono, correo, especialidad). El nombre y la cédula NO se
 * editan aquí — igual que con pacientes, esos son datos de
 * identidad que solo el administrador puede corregir.
 */
export async function actualizarMisDatosDoctor(
  idDoctor: number,
  datos: { telefono?: string | null; email?: string | null; especialidad?: string | null }
): Promise<void> {
  const { error } = await supabase
    .from("doctores")
    .update(datos)
    .eq("id", idDoctor);

  if (error) throw error;
}

/**
 * Sube (o reemplaza) la foto de perfil del médico logueado.
 * Reutiliza el mismo bucket "avatares" que ya usan los pacientes
 * — la carpeta se organiza por auth.uid(), así que funciona igual
 * sin importar el rol.
 */
export async function subirFotoPerfilDoctor(
  idDoctor: number,
  archivo: File
): Promise<string> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Debes iniciar sesión para subir tu foto.");

  const extension = archivo.name.split(".").pop();
  const rutaArchivo = `${user.id}/perfil.${extension}`;

  const { error: errorSubida } = await supabase.storage
    .from("avatares")
    .upload(rutaArchivo, archivo, { upsert: true });

  if (errorSubida) throw errorSubida;

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatares").getPublicUrl(rutaArchivo);

  const { error: errorUpdate } = await supabase
    .from("doctores")
    .update({ foto_url: publicUrl })
    .eq("id", idDoctor);

  if (errorUpdate) throw errorUpdate;

  return publicUrl;
}

// ============================================================
// Citas de la semana (para "Mis Consultas")
// ============================================================
export interface CitaSemana {
  id: number;
  fecha: string;
  hora: string;
  estado: string;
  pacientes: { id: number; nombres: string; apellidos: string } | null;
  servicios: { nombre: string } | null;
}

export async function obtenerCitasSemana(
  idDoctor: number,
  fechaInicio: string,
  fechaFin: string
): Promise<CitaSemana[]> {
  const { data, error } = await supabase
    .from("citas")
    .select(
      "id, fecha, hora, estado, pacientes ( id, nombres, apellidos ), servicios ( nombre )"
    )
    .eq("id_doctor", idDoctor)
    .gte("fecha", fechaInicio)
    .lte("fecha", fechaFin)
    .order("fecha", { ascending: true })
    .order("hora", { ascending: true });

  if (error) throw error;
  return (data as unknown as CitaSemana[]) ?? [];
}