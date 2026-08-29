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
 *
 * Todas las escrituras clínicas (evolucion_clinica.id_doctor, etc.)
 * necesitan este id numérico, NO el auth.uid() del médico — son
 * dos cosas distintas: uno identifica la cuenta de login, el otro
 * identifica la fila de doctor en el negocio.
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
 *
 * No hace falta filtrar nada a mano: la política RLS
 * `medico_ve_sus_pacientes` ya limita el SELECT solo a los
 * pacientes que tienen (o tuvieron) cita con este doctor.
 * Esta función es idéntica en espíritu a la de `admin/pacientes`,
 * solo que aquí la base de datos hace el filtrado por nosotros.
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
// en CUALQUIER panel donde la cuenta logueada esté vinculada a
// una fila de `doctores` — se usa tanto en el panel médico como
// en el panel admin cuando la misma persona (ej. la dueña) tiene
// también un registro como doctora.
// ============================================================
export interface PerfilDoctorActual {
  id: number;
  nombres: string;
  apellidos: string;
  especialidad: string | null;
  foto_url: string | null;
}

/**
 * Devuelve el perfil de doctor vinculado a la cuenta logueada,
 * o null si esta cuenta no tiene ninguna fila en `doctores`
 * (ej. un administrador que no es también doctor). A diferencia
 * de obtenerIdDoctorActual(), esta función NO lanza error si no
 * encuentra nada — es para mostrar identidad, no para escribir
 * datos clínicos.
 */
export async function obtenerMiPerfilDoctor(): Promise<PerfilDoctorActual | null> {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return null;

  const { data, error } = await supabase
    .from("doctores")
    .select("id, nombres, apellidos, especialidad, foto_url")
    .eq("id_usuario", userData.user.id)
    .maybeSingle();

  if (error || !data) return null;
  return data;
}