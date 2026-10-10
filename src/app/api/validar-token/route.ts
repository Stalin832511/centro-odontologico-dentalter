// ============================================================
// GET /api/validar-token?token=xxxx
// Endpoint PÚBLICO (sin sesión) — usado por la página que abre
// el laboratorio externo. Devuelve solo lo mínimo indispensable:
// nombre del paciente, tipo de resultado esperado, y si el
// enlace sigue vigente. Nunca expone cédula, historia completa
// ni ningún otro dato.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { valido: false, motivo: "Falta el token." },
      { status: 400 }
    );
  }

  const { data, error } = await supabaseAdmin
    .from("tokens_carga")
    .select(
      `id, expira_en, revocado,
       tipos_resultado ( nombre ),
       entidades_referentes ( nombre ),
       historia_clinica (
         pacientes ( nombres, apellidos )
       )`
    )
    .eq("token", token)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json(
      { valido: false, motivo: "Enlace no encontrado." },
      { status: 404 }
    );
  }

  const expirado = new Date(data.expira_en).getTime() < Date.now();

  if (data.revocado || expirado) {
    return NextResponse.json({
      valido: false,
      motivo: data.revocado
        ? "Este enlace fue revocado por la clínica."
        : "Este enlace ya expiró. Solicita uno nuevo a la clínica.",
    });
  }

  const historia = data.historia_clinica as any;
  const paciente = historia?.pacientes;

  return NextResponse.json({
    valido: true,
    pacienteNombre: paciente
      ? `${paciente.nombres} ${paciente.apellidos}`
      : "Paciente",
    tipoResultado: (data.tipos_resultado as any)?.nombre ?? "Resultado",
    entidadNombre: (data.entidades_referentes as any)?.nombre ?? null,
  });
}