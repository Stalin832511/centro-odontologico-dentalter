// ============================================================
// SERVICIO DE DISPONIBILIDAD
// Calcula las horas disponibles de un doctor en una fecha dada,
// combinando su horario de trabajo (horarios_doctores) con las
// citas que ya existen ese día — sin exponer de quién es cada cita
// (usa la función RPC horas_ocupadas, que solo revela el horario).
// ============================================================

import { supabase } from "@/lib/supabase";

export interface SlotDisponibilidad {
  hora: string;
  disponible: boolean;
}

const DIAS_SEMANA = [
  "DOMINGO", "LUNES", "MARTES", "MIERCOLES",
  "JUEVES", "VIERNES", "SABADO",
];

const DURACION_SLOT_MINUTOS = 30;

export async function obtenerHorariosDisponibles(
  idDoctor: number,
  fecha: string
): Promise<SlotDisponibilidad[]> {
  // 1) Determinar el día de la semana de esa fecha (en horario local,
  //    para evitar el desfase típico de interpretar "YYYY-MM-DD" como UTC)
  const [anio, mes, dia] = fecha.split("-").map(Number);
  const fechaLocal = new Date(anio, mes - 1, dia);
  const diaSemana = DIAS_SEMANA[fechaLocal.getDay()];

  // 2) Traer el horario de trabajo del doctor ese día
  const { data: horarios, error: errorHorarios } = await supabase
    .from("horarios_doctores")
    .select("hora_inicio, hora_fin")
    .eq("id_doctor", idDoctor)
    .eq("dia_semana", diaSemana);

  if (errorHorarios) throw errorHorarios;
  if (!horarios || horarios.length === 0) return [];

  // 3) Generar los slots de tiempo dentro de ese horario
  const slotsGenerados: string[] = [];
  for (const bloque of horarios) {
    const [hIni, mIni] = bloque.hora_inicio.split(":").map(Number);
    const [hFin, mFin] = bloque.hora_fin.split(":").map(Number);

    let minutosActuales = hIni * 60 + mIni;
    const minutosFin = hFin * 60 + mFin;

    while (minutosActuales < minutosFin) {
      const h = String(Math.floor(minutosActuales / 60)).padStart(2, "0");
      const m = String(minutosActuales % 60).padStart(2, "0");
      slotsGenerados.push(`${h}:${m}`);
      minutosActuales += DURACION_SLOT_MINUTOS;
    }
  }

  // 4) Traer las horas ya ocupadas (vía la función segura, sin exponer
  //    de quién es cada cita)
  const { data: ocupadas, error: errorOcupadas } = await supabase.rpc(
    "horas_ocupadas",
    { p_id_doctor: idDoctor, p_fecha: fecha }
  );

  if (errorOcupadas) throw errorOcupadas;

  const horasOcupadas = new Set(
    (ocupadas ?? []).map((o: { hora: string }) => o.hora.slice(0, 5))
  );

  // 5) Combinar: cada slot generado, marcado como libre u ocupado
  return slotsGenerados.map((hora) => ({
    hora,
    disponible: !horasOcupadas.has(hora),
  }));
}