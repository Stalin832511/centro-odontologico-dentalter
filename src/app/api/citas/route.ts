import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const {
      nombres,
      apellidos,
      telefono,
      email,
      servicio_id,
      doctor_id,
      fecha,
      hora,
      observaciones,
    } = body;

    // ===============================
    // VALIDAR DATOS
    // ===============================

    if (
      !nombres ||
      !apellidos ||
      !telefono ||
      !servicio_id ||
      !doctor_id ||
      !fecha ||
      !hora
    ) {

      return NextResponse.json(
        {
          error: "Faltan campos obligatorios",
        },
        {
          status: 400,
        }
      );

    }

    // ===============================
    // VALIDAR HORARIO DISPONIBLE
    // ===============================

    const existe = await pool.query(
      `
      SELECT id
      FROM citas
      WHERE doctor_id = $1
      AND fecha = $2
      AND hora = $3
      `,
      [
        doctor_id,
        fecha,
        hora,
      ]
    );

    if (existe.rows.length > 0) {

      return NextResponse.json(
        {
          error: "Horario no disponible",
        },
        {
          status: 400,
        }
      );

    }

    // ===============================
    // CREAR PACIENTE
    // ===============================

    const pacienteResult = await pool.query(
      `
      INSERT INTO pacientes (
        nombres,
        apellidos,
        telefono,
        email
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [
        nombres,
        apellidos,
        telefono,
        email || null,
      ]
    );

    const paciente_id = pacienteResult.rows[0].id;

    // ===============================
    // CREAR CITA
    // ===============================

    const citaResult = await pool.query(
      `
      INSERT INTO citas (
        paciente_id,
        doctor_id,
        servicio_id,
        fecha,
        hora,
        observaciones,
        estado,
        creado_desde
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8
      )
      RETURNING *
      `,
      [
        paciente_id,
        doctor_id,
        servicio_id,
        fecha,
        hora,
        observaciones || "",
        "pendiente",
        "web",
      ]
    );

    // ===============================
    // RESPUESTA EXITOSA
    // ===============================

    return NextResponse.json({
      success: true,
      message: "Cita agendada correctamente",
      cita: citaResult.rows[0],
    });

  } catch (error) {

    console.log("ERROR API CITAS:", error);

    return NextResponse.json(
      {
        error: "Error interno del servidor",
      },
      {
        status: 500,
      }
    );

  }

}