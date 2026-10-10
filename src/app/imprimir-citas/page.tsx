"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { capitalizarNombre } from "@/lib/texto";
import HojaMembretada from "@/components/impresion/HojaMembretada";

interface CitaFila {
  id: number;
  fecha: string;
  hora: string;
  estado: string;
  paciente_nombre: string;
  doctor_nombre: string;
  servicio_nombre: string;
}

const ESTADO_ESTILOS: Record<string, string> = {
  PENDIENTE: "text-amber-600",
  CONFIRMADA: "text-emerald-600",
  ATENDIDA: "text-slate-500",
  CANCELADA: "text-rose-600",
};

function formatFecha(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function formatHora(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  const periodo = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${periodo}`;
}

function ImprimirCitasContent() {
  const params = useSearchParams();
  const [citas, setCitas] = useState<CitaFila[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function cargar() {
      setCargando(true);

      let query = supabase
        .from("citas")
        .select(
          `id, fecha, hora, estado, id_doctor,
           pacientes ( nombres, apellidos ),
           doctores ( nombres, apellidos ),
           servicios ( nombre )`
        )
        .order("fecha", { ascending: false })
        .order("hora", { ascending: false })
        .limit(200);

      const estado = params.get("estado");
      const doctor = params.get("doctor");
      const desde = params.get("desde");
      const hasta = params.get("hasta");

      if (estado) query = query.eq("estado", estado);
      if (doctor) query = query.eq("id_doctor", Number(doctor));
      if (desde) query = query.gte("fecha", desde);
      if (hasta) query = query.lte("fecha", hasta);

      const { data } = await query;

      const q = (params.get("q") ?? "").toLowerCase();

      const filas = ((data as any[]) ?? [])
        .map((c) => ({
          id: c.id,
          fecha: c.fecha,
          hora: c.hora,
          estado: c.estado,
          paciente_nombre: c.pacientes
            ? `${capitalizarNombre(c.pacientes.nombres)} ${capitalizarNombre(c.pacientes.apellidos)}`
            : "—",
          doctor_nombre: c.doctores
            ? `${capitalizarNombre(c.doctores.nombres)} ${capitalizarNombre(c.doctores.apellidos)}`
            : "—",
          servicio_nombre: c.servicios?.nombre ?? "—",
        }))
        .filter((c) =>
          q
            ? `${c.paciente_nombre} ${c.doctor_nombre} ${c.servicio_nombre}`
                .toLowerCase()
                .includes(q)
            : true
        );

      setCitas(filas);
      setCargando(false);
    }

    cargar();
  }, [params]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <HojaMembretada
      tituloDocumento="Listado de Citas"
      pacienteNombre="—"
      fecha={new Date().toISOString()}
    >
      {citas.length === 0 ? (
        <p className="text-sm text-slate-500 text-center py-10">
          No hay citas que coincidan con los filtros aplicados.
        </p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="py-2.5 pr-3 text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                Paciente
              </th>
              <th className="py-2.5 pr-3 text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                Doctor
              </th>
              <th className="py-2.5 pr-3 text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                Servicio
              </th>
              <th className="py-2.5 pr-3 text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                Fecha
              </th>
              <th className="py-2.5 pr-3 text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                Hora
              </th>
              <th className="py-2.5 text-[11px] uppercase tracking-wide text-slate-400 font-semibold">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {citas.map((c) => (
              <tr key={c.id} className="border-b border-slate-50">
                <td className="py-2.5 pr-3 font-semibold text-slate-700">
                  {c.paciente_nombre}
                </td>
                <td className="py-2.5 pr-3 text-slate-600">{c.doctor_nombre}</td>
                <td className="py-2.5 pr-3 text-slate-600">{c.servicio_nombre}</td>
                <td className="py-2.5 pr-3 text-slate-600">{formatFecha(c.fecha)}</td>
                <td className="py-2.5 pr-3 text-slate-600">{formatHora(c.hora)}</td>
                <td
                  className={`py-2.5 font-semibold ${
                    ESTADO_ESTILOS[c.estado] ?? "text-slate-500"
                  }`}
                >
                  {c.estado}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </HojaMembretada>
  );
}

export default function ImprimirCitasPage() {
  return (
    <Suspense fallback={null}>
      <ImprimirCitasContent />
    </Suspense>
  );
}