// ============================================================
// SERVICIOS DE TOKENS DE CARGA (enlaces para externos)
// ============================================================

import { supabase } from "@/lib/supabase";

export interface TokenCarga {
  id: number;
  token: string;
  id_historia: number;
  id_tipo_resultado: number;
  id_entidad_referente: number | null;
  expira_en: string;
  revocado: boolean;
  creado_en: string;
}

// ============================================================
// GENERAR ENLACE (admin/médico logueados)
// ============================================================

export async function generarTokenCarga(datos: {
  idPaciente: number;
  idTipoResultado: number;
  idEntidadReferente: number | null;
  diasValidez?: number;
}): Promise<{ token: string; url: string }> {
  const { obtenerOCrearHistoria } = await import(
    "@/services/historiaClinica"
  );
  const idHistoria = await obtenerOCrearHistoria(datos.idPaciente);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const dias = datos.diasValidez ?? 7;
  const expiraEn = new Date(
    Date.now() + dias * 24 * 60 * 60 * 1000
  ).toISOString();

  const { data, error } = await supabase
    .from("tokens_carga")
    .insert({
      id_historia: idHistoria,
      id_tipo_resultado: datos.idTipoResultado,
      id_entidad_referente: datos.idEntidadReferente,
      expira_en: expiraEn,
      creado_por: user?.id ?? null,
    })
    .select("token")
    .single();

  if (error) throw error;

  const url = `${window.location.origin}/subir-resultado/${data.token}`;

  return { token: data.token, url };
}

// ============================================================
// LISTAR ENLACES DE UN PACIENTE (para revocar/ver estado)
// ============================================================

export async function listarTokensPorPaciente(idPaciente: number) {
  const { data: historia } = await supabase
    .from("historia_clinica")
    .select("id")
    .eq("id_paciente", idPaciente)
    .maybeSingle();

  if (!historia) return [];

  const { data, error } = await supabase
    .from("tokens_carga")
    .select(
      `id, token, expira_en, revocado, creado_en,
       tipos_resultado ( nombre ),
       entidades_referentes ( nombre )`
    )
    .eq("id_historia", historia.id)
    .order("creado_en", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ============================================================
// REVOCAR ENLACE
// ============================================================

export async function revocarTokenCarga(id: number): Promise<void> {
  const { error } = await supabase
    .from("tokens_carga")
    .update({ revocado: true })
    .eq("id", id);

  if (error) throw error;
}