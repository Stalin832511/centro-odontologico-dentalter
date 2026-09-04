import { supabase } from "@/lib/supabase";

export interface RecetaInput {
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
}

export interface Receta {
  id: number;
  medicamento: string;
  dosis: string | null;
  frecuencia: string | null;
  duracion: string | null;
}

export interface EvolucionClinica {
  id: number;
  fecha: string | null;
  motivo_consulta: string | null;
  diagnostico: string | null;
  tratamiento: string | null;
  observaciones: string | null;
  doctor: {
    nombres: string;
    apellidos: string;
  } | null;
  recetas: Receta[];
}

export interface HistoriaCompleta {
  id: number;
  codigo: string;
  evoluciones: EvolucionClinica[];
}

export async function obtenerOCrearHistoria(
  idPaciente: number
): Promise<number> {
  const { data: existente, error: buscarError } = await supabase
    .from("historia_clinica")
    .select("id")
    .eq("id_paciente", idPaciente)
    .maybeSingle();

  if (buscarError) {
    throw buscarError;
  }

  if (existente) {
    return existente.id;
  }

  const codigo = `HC-${idPaciente}-${Date.now().toString().slice(-6)}`;

  const { data: nueva, error: crearError } = await supabase
    .from("historia_clinica")
    .insert({
      id_paciente: idPaciente,
      codigo,
      estado: "ACTIVO",
    })
    .select("id")
    .single();

  if (crearError) {
    throw crearError;
  }

  return nueva.id;
}

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

  if (evolucionError) {
    throw evolucionError;
  }

  const recetasValidas = datos.recetas.filter(
    (r) => r.medicamento.trim().length > 0
  );

  if (recetasValidas.length > 0) {
    const { error: recetasError } = await supabase
      .from("recetas_medicas")
      .insert(
        recetasValidas.map((r) => ({
          id_evolucion: evolucion.id,
          medicamento: r.medicamento.trim(),
          dosis: r.dosis.trim() || null,
          frecuencia: r.frecuencia.trim() || null,
          duracion: r.duracion.trim() || null,
          estado: "ACTIVA",
        }))
      );

    if (recetasError) {
      throw recetasError;
    }
  }
}

export async function obtenerHistoriaCompleta(
  idPaciente: number
): Promise<HistoriaCompleta | null> {
  const { data: historia, error: historiaError } = await supabase
    .from("historia_clinica")
    .select("id, codigo")
    .eq("id_paciente", idPaciente)
    .maybeSingle();

  if (historiaError) {
    throw historiaError;
  }

  if (!historia) {
    return null;
  }

  const { data: evoluciones, error: evolucionesError } = await supabase
    .from("evolucion_clinica")
    .select(`
      id,
      fecha,
      diagnostico,
      tratamiento,
      observaciones,
      doctores (
        nombres,
        apellidos
      ),
      recetas_medicas (
        id,
        medicamento,
        dosis,
        frecuencia,
        duracion
      )
    `)
    .eq("id_historia", historia.id)
    .order("fecha", { ascending: false });

  if (evolucionesError) {
    throw evolucionesError;
  }

  return {
    id: historia.id,
    codigo: historia.codigo,
    evoluciones: (evoluciones || []).map((ev: any) => ({
      id: ev.id,
      fecha: ev.fecha,
      motivo_consulta: null,
      diagnostico: ev.diagnostico,
      tratamiento: ev.tratamiento,
      observaciones: ev.observaciones,
      doctor: ev.doctores
        ? {
            nombres: ev.doctores.nombres,
            apellidos: ev.doctores.apellidos,
          }
        : null,
      recetas: ev.recetas_medicas || [],
    })),
  };
}