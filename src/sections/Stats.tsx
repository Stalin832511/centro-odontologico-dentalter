import { Award, Users, ShieldCheck, Clock } from "lucide-react";

const STATS = [
  { icon: Award, value: "12+", label: "Años de trayectoria" },
  { icon: Users, value: "8,500+", label: "Pacientes atendidos" },
  { icon: ShieldCheck, value: "98%", label: "Índice de satisfacción" },
  { icon: Clock, value: "24/7", label: "Atención de urgencias" },
];

export default function Stats() {
  return (
    <section className="bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-200">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="flex flex-col items-center text-center gap-2 py-8 md:py-10 px-4"
            >
              <Icon size={20} style={{ color: "#0891b2" }} />
              <span className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                {stat.value}
              </span>
              <span className="text-[11px] md:text-xs text-slate-500 tracking-wide">
                {stat.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
