import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      nombres,
      apellidos,
      cedula,
      telefono,
      email,
      servicio_id,
      doctor_id,
      fecha,
      hora,
      observaciones,
    } = body;

    if (
      !nombres ||
      !apellidos ||
      !cedula ||
      !telefono ||
      !doctor_id ||
      !fecha ||
      !hora
    ) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios" },
        { status: 400 }
      );
    }

    // Verificar que el horario esté disponible
    const { data: existe, error: verificarError } = await supabase
      .from("citas")
      .select("id")
      .eq("id_doctor", doctor_id)
      .eq("fecha", fecha)
      .eq("hora", hora)
      .maybeSingle();

    if (verificarError) {
      console.error("ERROR VERIFICANDO CITA:", verificarError);

      return NextResponse.json(
        { error: "No se pudo verificar la disponibilidad" },
        { status: 500 }
      );
    }

    if (existe) {
      return NextResponse.json(
        { error: "Horario no disponible" },
        { status: 400 }
      );
    }

    // Crear paciente
    const { data: paciente, error: pacienteError } = await supabase
      .from("pacientes")
      .insert({
        nombres,
        apellidos,
        cedula,
        telefono,
        email: email || null,
      })
      .select("id")
      .single();

    if (pacienteError) {
      console.error("ERROR CREANDO PACIENTE:", pacienteError);

      return NextResponse.json(
        { error: "No se pudo crear el paciente" },
        { status: 500 }
      );
    }

    // Crear cita
    const { data: cita, error: citaError } = await supabase
      .from("citas")
      .insert({
        id_paciente: paciente.id,
        id_doctor: doctor_id,
        id_servicio: servicio_id || null,
        fecha,
        hora,
        observacion: observaciones || null,
        estado: "pendiente",
      })
      .select()
      .single();

    if (citaError) {
      console.error("ERROR CREANDO CITA:", citaError);

      return NextResponse.json(
        { error: "No se pudo crear la cita" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Cita agendada correctamente",
      cita,
    });
  } catch (error) {
    console.error("ERROR API CITAS:", error);

    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}