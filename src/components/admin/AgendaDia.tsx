"use client";

import { useEffect, useState } from "react";
import { Clock3, UserRound, CalendarX2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface ItemAgenda {
  id: number;
  hora: string;
  paciente: string;
}

function formatHora(hora: string) {
  const [h, m] = hora.split(":").map(Number);
  const periodo = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${periodo}`;
}

export default function AgendaDia() {
  const [agenda, setAgenda] = useState<ItemAgenda[] | null>(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const hoyISO = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("citas")
        .select("id, hora, pacientes ( nombres, apellidos )")
        .eq("fecha", hoyISO)
        .neq("estado", "CANCELADA")
        .order("hora", { ascending: true });

      if (!activo) return;

      if (error || !data) {
        setAgenda([]);
        return;
      }

      setAgenda(
        data.map((c: any) => ({
          id: c.id,
          hora: c.hora,
          paciente: c.pacientes ? `${c.pacientes.nombres} ${c.pacientes.apellidos}` : "Paciente",
        }))
      );
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  return (
    <div className="bg-white rounded-[32px] p-6 shadow-xl">
      <h2 className="text-2xl font-black text-slate-800 mb-6">
        Agenda del Día
      </h2>

      {agenda === null ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[68px] rounded-2xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : agenda.length === 0 ? (
        <div className="flex flex-col items-center text-center gap-3 py-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
            <CalendarX2 size={20} className="text-slate-400" />
          </div>
          <p className="text-sm font-semibold text-slate-600">
            No hay citas para hoy
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {agenda.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between bg-slate-50 rounded-2xl p-4"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-100 flex items-center justify-center text-cyan-600">
                  <Clock3 size={20} />
                </div>

                <div>
                  <p className="font-bold">{formatHora(item.hora)}</p>
                  <p className="text-slate-500">{item.paciente}</p>
                </div>
              </div>

              <UserRound className="text-slate-400" size={22} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
