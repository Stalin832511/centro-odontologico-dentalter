// ============================================================
// SERVICIOS DE HISTORIA CLÍNICA
// Centraliza la lógica para que un médico registre una consulta:
// diagnóstico, tratamiento, observaciones y receta.
// ============================================================

import { supabase } from "@/lib/supabase";

export interface RecetaInput {
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
}

/**
 * Obtiene la historia clínica de un paciente, o la crea si es su
 * primera consulta registrada en el sistema.
 */
export async function obtenerOCrearHistoria(idPaciente: number): Promise<number> {
  const { data: existente, error: buscarError } = await supabase
    .from("historia_clinica")
    .select("id")
    .eq("id_paciente", idPaciente)
    .maybeSingle();

  if (buscarError) throw buscarError;
  if (existente) return existente.id;

  const codigo = `HC-${idPaciente}-${Date.now().toString().slice(-6)}`;

  const { data: nueva, error: crearError } = await supabase
    .from("historia_clinica")
    .insert({ id_paciente: idPaciente, codigo, estado: "ACTIVO" })
    .select("id")
    .single();

  if (crearError) throw crearError;
  return nueva.id;
}

/**
 * Registra una consulta completa: crea (o reutiliza) la historia
 * clínica del paciente, agrega la evolución del día, y si el
 * médico recetó medicamentos, los guarda vinculados a esa evolución.
 */
export async function registrarConsulta(datos: {
  idPaciente: number;
  idDoctor: number;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
  recetas: RecetaInput[];
}): Promise<void> {
  const idHistoria = await obtenerOCrearHistoria(datos.idPaciente);

  const { data: evolucion, error: evolucionError } = await supabase
    .from("evolucion_clinica")
    .insert({
      id_historia: idHistoria,
      id_doctor: datos.idDoctor,
      diagnostico: datos.diagnostico || null,
      tratamiento: datos.tratamiento || null,
      observaciones: datos.observaciones || null,
    })
    .select("id")
    .single();

  if (evolucionError) throw evolucionError;

  const recetasValidas = datos.recetas.filter((r) => r.medicamento.trim().length > 0);

  if (recetasValidas.length > 0) {
    const { error: recetasError } = await supabase.from("recetas_medicas").insert(
      recetasValidas.map((r) => ({
        id_evolucion: evolucion.id,
        medicamento: r.medicamento.trim(),
        dosis: r.dosis.trim() || null,
        frecuencia: r.frecuencia.trim() || null,
        duracion: r.duracion.trim() || null,
        estado: "ACTIVA",
      }))
    );

    if (recetasError) throw recetasError;
  }
}