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

const data = [
  { mes: "Ene", valor: 30 },
  { mes: "Feb", valor: 45 },
  { mes: "Mar", valor: 60 },
  { mes: "Abr", valor: 55 },
  { mes: "May", valor: 80 },
  { mes: "Jun", valor: 95 },
];

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

export default function GraficoDashboard() {
  // Evita que Recharts intente medir el contenedor antes de que el DOM
  // tenga dimensiones reales (esto es lo que causaba el error width(-1)/height(-1)
  // y rompía el render en la primera carga del dashboard)
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="bg-white rounded-2xl sm:rounded-[32px] p-5 sm:p-6 shadow-xl shadow-slate-200/50 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div>
          <h2 className="text-lg sm:text-2xl font-black text-slate-800">
            Rendimiento General
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Estadísticas de crecimiento mensual
          </p>
        </div>

        {/* Indicador de tendencia, refuerza que el dato es positivo */}
        <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-full text-xs font-bold">
          <span>↑</span>
          <span>+18%</span>
        </div>
      </div>

      <div className="h-[260px] sm:h-[320px] md:h-[350px] w-full min-w-0">
        {isMounted && (
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