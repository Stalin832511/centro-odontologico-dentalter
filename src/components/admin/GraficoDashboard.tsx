"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from "recharts";
import { supabase } from "@/lib/supabase";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

interface PuntoGrafico {
  mes: string;
  valor: number;
}

// Tooltip personalizado en vez del default de Recharts (gris, sin estilo)
function CustomTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-white/10">
      <p className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">
        {label}
      </p>
      <p className="text-lg font-bold">
        {payload[0].value}
        <span className="text-sm font-normal text-slate-400 ml-1">citas</span>
      </p>
    </div>
  );
}

// Construye los últimos 6 meses (incluyendo el actual), en orden cronológico
function ultimosSeisMeses(): { year: number; month: number; label: string }[] {
  const resultado = [];
  const hoy = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
    resultado.push({ year: d.getFullYear(), month: d.getMonth(), label: MESES[d.getMonth()] });
  }
  return resultado;
}

export default function GraficoDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [data, setData] = useState<PuntoGrafico[] | null>(null);
  const [crecimiento, setCrecimiento] = useState<number | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let activo = true;

    async function cargarDatos() {
      const meses = ultimosSeisMeses();
      const desde = new Date(meses[0].year, meses[0].month, 1).toISOString().split("T")[0];

      const { data: citas, error } = await supabase
        .from("citas")
        .select("fecha")
        .gte("fecha", desde)
        .neq("estado", "CANCELADA");

      if (!activo) return;

      if (error || !citas) {
        setData(meses.map((m) => ({ mes: m.label, valor: 0 })));
        return;
      }

      const conteos = meses.map((m) => {
        const total = citas.filter((c) => {
          const [y, mo] = c.fecha.split("-").map(Number);
          return y === m.year && mo - 1 === m.month;
        }).length;
        return { mes: m.label, valor: total };
      });

      setData(conteos);

      // % de crecimiento del mes actual vs el anterior, para el badge
      const actual = conteos[conteos.length - 1]?.valor ?? 0;
      const anterior = conteos[conteos.length - 2]?.valor ?? 0;
      if (anterior > 0) {
        setCrecimiento(Math.round(((actual - anterior) / anterior) * 100));
      } else {
        setCrecimiento(actual > 0 ? 100 : 0);
      }
    }

    cargarDatos();
    return () => {
      activo = false;
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-xl shadow-slate-200/50 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-800">
            Rendimiento General
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Citas registradas por mes (últimos 6 meses)
          </p>
        </div>

        {crecimiento !== null && (
          <div
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${
              crecimiento >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
            }`}
          >
            <span>{crecimiento >= 0 ? "↑" : "↓"}</span>
            <span>{crecimiento >= 0 ? "+" : ""}{crecimiento}%</span>
          </div>
        )}
      </div>

      <div className="h-[260px] sm:h-[320px] md:h-[350px] w-full min-w-0">
        {isMounted && data && (
          <ResponsiveContainer width="100%" height="100%" debounce={1}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <defs>
                <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#eef2f6"
              />

              <XAxis
                dataKey="mes"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                dy={8}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#94a3b8", fontSize: 12 }}
                width={36}
                allowDecimals={false}
              />

              <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#06b6d4", strokeWidth: 1, strokeDasharray: "4 4" }} />

              <Area
                type="monotone"
                dataKey="valor"
                stroke="#06b6d4"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorValor)"
                activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
