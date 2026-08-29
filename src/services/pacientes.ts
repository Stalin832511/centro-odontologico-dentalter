// ============================================================
// SERVICIOS DE PACIENTES
// Centraliza toda la lógica de datos relacionada a pacientes,
// citas y activación de cuenta. Ningún componente debe hablar
// directo con Supabase — siempre pasa por aquí.
// ============================================================

import { supabase } from "@/lib/supabase";

// Forma de un registro de la tabla `pacientes`
export interface Paciente {
  id: number;
  cedula: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  email: string | null;
  id_usuario: string | null;
}

/**
 * Busca un paciente por cédula, y si no existe lo crea.
 * Usa la función de Postgres `buscar_o_crear_paciente` (SECURITY DEFINER),
 * en vez de hacer SELECT/INSERT directo sobre la tabla.
 *
 * Por qué: la tabla `pacientes` tiene RLS activado y solo permite
 * SELECT a administrador, médico, o al propio paciente ya logueado.
 * Un visitante anónimo agendando su primera cita no cumple ninguna
 * de esas condiciones, así que un INSERT + SELECT directo fallaría
 * con el error "row-level security policy". La función de Postgres
 * actúa como una "ventanilla controlada": puede leer/escribir en
 * pacientes internamente, pero solo hace exactamente esta operación,
 * sin exponer el resto de la tabla a cualquiera con la clave pública.
 *
 * El correo es OPCIONAL: pensado para pacientes de la tercera edad
 * o sin acceso a tecnología, que quieren agendar una consulta pero
 * no tienen (o no quieren dar) un email. Si no se provee, se envía
 * como `null` — el paciente queda registrado y su cita se agenda
 * igual, simplemente no se le crea acceso al portal en línea.
 */
export async function buscarOCrearPaciente(datos: {
  nombres: string;
  apellidos: string;
  cedula: string;
  telefono: string;
  email?: string;
}): Promise<{ paciente: Paciente; esNuevo: boolean; tieneCorreo: boolean }> {
  const emailNormalizado = datos.email?.trim() ? datos.email.trim() : null;

  const { data, error } = await supabase.rpc("buscar_o_crear_paciente", {
    p_cedula: datos.cedula,
    p_nombres: datos.nombres,
    p_apellidos: datos.apellidos,
    p_telefono: datos.telefono,
    p_email: emailNormalizado,
  });

  if (error) throw error;

  const paciente = data as Paciente;

  // Un paciente "nuevo" (recién creado en esta misma llamada) nunca
  // tiene id_usuario todavía, porque ese campo solo se llena cuando
  // activa su cuenta en /activar-cuenta. Un paciente que ya existía
  // y ya activó su cuenta antes, sí lo tendrá.
  const esNuevo = !paciente.id_usuario;

  return {
    paciente,
    esNuevo,
    tieneCorreo: Boolean(emailNormalizado),
  };
}

/**
 * Crea una cita vinculada a un paciente.
 *
 * Importante: NO se encadena .select() después del .insert() aquí.
 * Un INSERT con .select() dispara además una verificación de RLS de
 * SELECT sobre la fila insertada — y como `citas` no debe ser de
 * lectura pública, eso causaría el mismo error 42501 que tuvimos
 * con `pacientes`. Un INSERT simple (sin pedir los datos de vuelta)
 * solo necesita cumplir la política de INSERT, que si es abierta.
 *
 * Nota de integridad: la tabla `citas` tiene un índice único parcial
 * (id_doctor, fecha, hora) para citas no canceladas, así que si dos
 * personas intentan tomar el mismo horario del mismo doctor, la base
 * de datos rechaza la segunda automáticamente. Ese error de Postgres
 * se propaga tal cual hacia quien llame esta función.
 */
export async function crearCita(datos: {
  id_paciente: number;
  id_doctor: number;
  id_servicio: number;
  fecha: string;
  hora: string;
  observacion: string;
}): Promise<void> {
  const { error } = await supabase.from("citas").insert(datos);
  if (error) throw error;
}

/**
 * Envía el enlace mágico de activación de cuenta por correo real.
 * Supabase Auth genera el token, lo envía, y lo valida por completo
 * (expiración automática, un solo uso) — no manejamos nada de esto
 * nosotros mismos.
 *
 * Guardamos la cédula en el metadata del usuario para poder vincular
 * su cuenta de auth con su fila de `pacientes` más adelante, en la
 * pantalla de activar-cuenta.
 *
 * Solo se debe llamar cuando SÍ hay correo — el llamador es
 * responsable de verificar eso antes (ver agendar/page.tsx).
 */
export async function enviarLinkActivacion(
  email: string,
  cedula: string
): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: `${window.location.origin}/activar-cuenta`,
      data: { rol: "paciente", cedula },
    },
  });

  if (error) throw error;
}