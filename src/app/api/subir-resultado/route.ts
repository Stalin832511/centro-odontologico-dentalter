// ============================================================
// POST /api/subir-resultado
// Endpoint PÚBLICO (sin sesión) — recibe el archivo que sube
// el laboratorio/clínica externa. Valida el token a mano (no
// hay usuario autenticado) y usa la service_role key SOLO
// aquí, en el servidor, para saltar RLS de forma controlada.
//
// FormData esperado:
//   token        (string, requerido)
//   archivo      (File, requerido)
//   subidoPor    (string, requerido) - nombre de quien sube
//   descripcion  (string, opcional)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function POST(req: NextRequest) {
  const formData = await req.formData();

  const token = formData.get("token") as string | null;
  const archivo = formData.get("archivo") as File | null;
  const subidoPor = (formData.get("subidoPor") as string | null)?.trim();
  const descripcion = (formData.get("descripcion") as string | null)?.trim();

  if (!token || !archivo || !subidoPor) {
    return NextResponse.json(
      { ok: false, error: "Faltan campos requeridos." },
      { status: 400 }
    );
  }

  // 1. Validar el token
  const { data: tokenData, error: tokenError } = await supabaseAdmin
    .from("tokens_carga")
    .select("id, id_historia, id_tipo_resultado, id_entidad_referente, expira_en, revocado")
    .eq("token", token)
    .maybeSingle();

  if (tokenError || !tokenData) {
    return NextResponse.json(
      { ok: false, error: "Enlace inválido." },
      { status: 404 }
    );
  }

  const expirado = new Date(tokenData.expira_en).getTime() < Date.now();
  if (tokenData.revocado || expirado) {
    return NextResponse.json(
      {
        ok: false,
        error: tokenData.revocado
          ? "Este enlace fue revocado."
          : "Este enlace ya expiró.",
      },
      { status: 403 }
    );
  }

  // 2. Subir el archivo al bucket "resultados"
  const extension = archivo.name.split(".").pop()?.toLowerCase() ?? "pdf";
  const nombreUnico = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${extension}`;
  // Carpeta por historia (no por paciente directo) para mantener
  // el mismo criterio de organización que usa radiografias.
  const rutaArchivo = `externos/${tokenData.id_historia}/${nombreUnico}`;

  const arrayBuffer = await archivo.arrayBuffer();

  const { error: uploadError } = await supabaseAdmin.storage
    .from("resultados")
    .upload(rutaArchivo, arrayBuffer, {
      contentType: archivo.type || "application/octet-stream",
      cacheControl: "3600",
      upsert: false,
    });

  if (uploadError) {
    return NextResponse.json(
      { ok: false, error: "No se pudo subir el archivo." },
      { status: 500 }
    );
  }

  // 3. Insertar el registro en "resultados"
  const { error: insertError } = await supabaseAdmin.from("resultados").insert({
    id_historia: tokenData.id_historia,
    id_tipo_resultado: tokenData.id_tipo_resultado,
    id_entidad_referente: tokenData.id_entidad_referente,
    descripcion: descripcion || null,
    archivo_url: rutaArchivo,
    origen: "externo",
    subido_por: subidoPor,
    estado: "pendiente",
    fecha: new Date().toISOString(),
  });

  if (insertError) {
    await supabaseAdmin.storage.from("resultados").remove([rutaArchivo]);
    return NextResponse.json(
      { ok: false, error: "No se pudo registrar el resultado." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}