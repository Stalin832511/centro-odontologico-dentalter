// ============================================================
// SERVICIOS DE SERVICIOS ODONTOLÓGICOS (catálogo de tratamientos)
// ============================================================

import { supabase } from "@/lib/supabase";

export interface ServicioOdontologico {
  id: number;
  nombre: string;
  precio: number;
  descripcion: string | null;
  activo: boolean;
}

export type ServicioInput = Omit<ServicioOdontologico, "id" | "activo">;

export async function listarServicios(): Promise<ServicioOdontologico[]> {
  const { data, error } = await supabase
    .from("servicios")
    .select("*")
    .order("nombre", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function crearServicio(datos: ServicioInput): Promise<void> {
  const { error } = await supabase.from("servicios").insert({ ...datos, activo: true });
  if (error) throw error;
}

export async function actualizarServicio(
  id: number,
  datos: Partial<ServicioInput>
): Promise<void> {
  const { error } = await supabase.from("servicios").update(datos).eq("id", id);
  if (error) throw error;
}

/**
 * Alterna activo/inactivo en vez de borrar. Un servicio inactivo
 * deja de aparecer en el formulario de "Agendar Cita" y en el
 * selector de "Nueva Cita" del admin, pero no rompe las citas
 * pasadas que ya lo tenían asignado.
 */
export async function alternarActivoServicio(id: number, activo: boolean): Promise<void> {
  const { error } = await supabase.from("servicios").update({ activo }).eq("id", id);
  if (error) throw error;
}

export async function eliminarServicio(id: number): Promise<void> {
  const { error } = await supabase.from("servicios").delete().eq("id", id);
  if (error) throw error;
}