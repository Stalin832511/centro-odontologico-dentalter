"use client";

import { useEffect, useState } from "react";
import {
  Users,
  CalendarDays,
  ClipboardCheck,
  Stethoscope,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

// ============================================================
// Utilidad: calcula el % de cambio entre este mes y el pasado
// ============================================================
function calcularCambio(actual: number, anterior: number): { texto: string; tipo: "up" | "down" | "flat" } {
  if (anterior === 0) {
    if (actual === 0) return { texto: "0%", tipo: "flat" };
    return { texto: "Nuevo", tipo: "up" };
  }
  const delta = Math.round(((actual - anterior) / anterior) * 100);
  if (delta === 0) return { texto: "0%", tipo: "flat" };
  return { texto: `${delta > 0 ? "+" : ""}${delta}%`, tipo: delta > 0 ? "up" : "down" };
}

function primerDiaMes(offsetMeses: number) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() + offsetMeses);
  return d.toISOString().split("T")[0];
}

interface CardData {
  titulo: string;
  valor: string;
  cambio: { texto: string; tipo: "up" | "down" | "flat" };
  icono: React.ReactNode;
  color: string;
}

export default function DashboardCards() {
  const [cards, setCards] = useState<CardData[] | null>(null);

  useEffect(() => {
    let activo = true;

    async function cargar() {
      const inicioEsteMes = primerDiaMes(0);
      const inicioMesPasado = primerDiaMes(-1);
      const hoyISO = new Date().toISOString().split("T")[0];

      const [
        { count: pacientesTotal },
        { count: pacientesEsteMes },
        { count: pacientesMesPasado },
        { count: citasHoy },
        { count: citasEsteMes },
        { count: citasMesPasado },
        { count: doctoresActivos },
        { count: atendidasEsteMes },
        { count: atendidasMesPasado },
      ] = await Promise.all([
        supabase.from("pacientes").select("*", { count: "exact", head: true }),
        supabase.from("pacientes").select("*", { count: "exact", head: true }).gte("creado_en", inicioEsteMes),
        supabase.from("pacientes").select("*", { count: "exact", head: true }).gte("creado_en", inicioMesPasado).lt("creado_en", inicioEsteMes),
        supabase.from("citas").select("*", { count: "exact", head: true }).eq("fecha", hoyISO).neq("estado", "CANCELADA"),
        supabase.from("citas").select("*", { count: "exact", head: true }).gte("fecha", inicioEsteMes).neq("estado", "CANCELADA"),
        supabase.from("citas").select("*", { count: "exact", head: true }).gte("fecha", inicioMesPasado).lt("fecha", inicioEsteMes).neq("estado", "CANCELADA"),
        supabase.from("doctores").select("*", { count: "exact", head: true }).eq("estado", true),
        supabase.from("citas").select("*", { count: "exact", head: true }).eq("estado", "ATENDIDA").gte("fecha", inicioEsteMes),
        supabase.from("citas").select("*", { count: "exact", head: true }).eq("estado", "ATENDIDA").gte("fecha", inicioMesPasado).lt("fecha", inicioEsteMes),
      ]);

      if (!activo) return;

      setCards([
        {
          titulo: "Pacientes",
          valor: String(pacientesTotal ?? 0),
          cambio: calcularCambio(pacientesEsteMes ?? 0, pacientesMesPasado ?? 0),
          icono: <Users size={34} />,
          color: "from-cyan-500 via-sky-500 to-blue-600",
        },
        {
          titulo: "Citas Hoy",
          valor: String(citasHoy ?? 0),
          cambio: calcularCambio(citasEsteMes ?? 0, citasMesPasado ?? 0),
          icono: <CalendarDays size={34} />,
          color: "from-violet-500 via-fuchsia-500 to-purple-600",
        },
        {
          titulo: "Atendidas este mes",
          valor: String(atendidasEsteMes ?? 0),
          cambio: calcularCambio(atendidasEsteMes ?? 0, atendidasMesPasado ?? 0),
          icono: <ClipboardCheck size={34} />,
          color: "from-emerald-500 via-green-500 to-teal-600",
        },
        {
          titulo: "Doctores Activos",
          valor: String(doctoresActivos ?? 0),
          cambio: { texto: "Activos", tipo: "flat" },
          icono: <Stethoscope size={34} />,
          color: "from-orange-400 via-amber-500 to-yellow-500",
        },
      ]);
    }

    cargar();
    return () => {
      activo = false;
    };
  }, []);

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {(cards ?? Array.from({ length: 4 })).map((card, index) => (
        <div
          key={index}
          className="relative overflow-hidden rounded-[30px] bg-white shadow-xl border border-slate-100 p-6 hover:-translate-y-2 transition-all duration-300"
        >
          {!card ? (
            <div className="animate-pulse space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-200" />
              <div className="h-3 w-20 bg-slate-200 rounded-full" />
              <div className="h-8 w-16 bg-slate-200 rounded-lg" />
              <div className="h-3 w-14 bg-slate-200 rounded-full" />
            </div>
          ) : (
            <>
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${(card as CardData).color} flex items-center justify-center text-white mb-5`}
              >
                {(card as CardData).icono}
              </div>

              <p className="text-slate-500 font-medium">{(card as CardData).titulo}</p>

              <h2 className="text-4xl font-black text-slate-800 mt-2">{(card as CardData).valor}</h2>

              <div className="mt-4 flex items-center gap-2">
                {(card as CardData).cambio.tipo === "up" && <TrendingUp size={18} className="text-emerald-500" />}
                {(card as CardData).cambio.tipo === "down" && <TrendingDown size={18} className="text-rose-500" />}
                {(card as CardData).cambio.tipo === "flat" && <Minus size={18} className="text-slate-400" />}
                <span
                  className={`font-bold ${
                    (card as CardData).cambio.tipo === "up"
                      ? "text-emerald-500"
                      : (card as CardData).cambio.tipo === "down"
                      ? "text-rose-500"
                      : "text-slate-400"
                  }`}
                >
                  {(card as CardData).cambio.texto}
                </span>
              </div>

              <div
                className={`absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-10 bg-gradient-to-br ${(card as CardData).color}`}
              />
            </>
          )}
        </div>
      ))}
    </section>
  );
}
