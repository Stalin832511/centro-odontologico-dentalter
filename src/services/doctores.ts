// ============================================================
// SERVICIOS DE DOCTORES
// ============================================================

import { supabase } from "@/lib/supabase";

export interface Doctor {
  id: number;
  id_usuario: string | null;
  cedula: string | null;
  nombres: string;
  apellidos: string;
  telefono: string | null;
  email: string | null;
  especialidad: string | null;
  colegio_numero: string | null;
  foto_url: string | null;
  estado: boolean;
}

export type DoctorInput = Omit<Doctor, "id" | "id_usuario" | "estado">;

/**
 * Trae todos los doctores.
 */
export async function listarDoctores(): Promise<Doctor[]> {
  const { data, error } = await supabase
    .from("doctores")
    .select("*")
    .order("nombres", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Crea un doctor SUELTO en el catálogo (sin invitación). Se deja
 * disponible por si en algún lugar quieres agregar un doctor sin
 * enviarle el link todavía.
 */
export async function crearDoctor(datos: DoctorInput): Promise<Doctor> {
  const { data, error } = await supabase
    .from("doctores")
    .insert({ ...datos, estado: true })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function actualizarDoctor(id: number, datos: Partial<DoctorInput>): Promise<void> {
  const { error } = await supabase.from("doctores").update(datos).eq("id", id);
  if (error) throw error;
}

export async function eliminarDoctor(id: number): Promise<void> {
  const { error } = await supabase.from("doctores").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Integra a un médico nuevo de una sola vez: crea su fila en
 * `doctores` con todos sus datos, Y le envía el magic link con
 * rol="medico" para que active su cuenta.
 *
 * Se usa desde el modal "Integrar Médico" — recibe el formulario
 * completo tal como lo llena el administrador.
 */
export async function invitarMedico(datos: {
  nombres: string;
  apellidos: string;
  especialidad: string;
  cedula: string;
  colegio_numero: string;
  telefono: string;
  email: string;
  foto_url: string;
}): Promise<void> {
  // 1) Crear su fila en el catálogo de doctores
  const { error: insertError } = await supabase.from("doctores").insert({
    nombres: datos.nombres.trim(),
    apellidos: datos.apellidos.trim(),
    especialidad: datos.especialidad.trim() || null,
    cedula: datos.cedula.trim(),
    colegio_numero: datos.colegio_numero.trim() || null,
    telefono: datos.telefono.trim() || null,
    email: datos.email.trim(),
    foto_url: datos.foto_url.trim() || null,
    estado: true,
  });

  if (insertError) throw insertError;

  // 2) Enviar el magic link — al activarlo, queda vinculado
  //    automáticamente gracias a la política "medico_vincula_su_cuenta"
  //    (compara la cédula del metadata contra la que acabamos de guardar).
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email: datos.email.trim(),
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}/activar-cuenta`,
      data: { rol: "medico", cedula: datos.cedula.trim() },
    },
  });

  if (otpError) throw otpError;
}

/**
 * Reenvía la invitación a un doctor que YA existe en el catálogo
 * pero que todavía no activó su cuenta (id_usuario es null).
 * Usa el correo y cédula que ya tiene guardados en su fila.
 */
export async function reenviarInvitacionMedico(doctor: Doctor): Promise<void> {
  if (!doctor.email || !doctor.cedula) {
    throw new Error(
      "Este doctor no tiene correo o cédula registrados. Edítalo primero para completar esos datos."
    );
  }

  const { error } = await supabase.auth.signInWithOtp({
    email: doctor.email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}/activar-cuenta`,
      data: { rol: "medico", cedula: doctor.cedula },
    },
  });

  if (error) throw error;
}