import { Box, Radar, Zap, FlaskConical } from "lucide-react";

const EQUIPOS = [
  { icon: Box, title: "Escáner intraoral 3D", desc: "Impresiones digitales sin molestias" },
  { icon: Radar, title: "Tomografía CBCT", desc: "Imagen volumétrica de alta precisión" },
  { icon: Zap, title: "Láser de diodo", desc: "Tratamientos mínimamente invasivos" },
  { icon: FlaskConical, title: "Esterilización clase B", desc: "Trazabilidad total del instrumental" },
];

export default function Tecnologia() {
  return (
    <section className="bg-[#12151a] py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 grid lg:grid-cols-2 gap-10 items-center">
        <div>
          <p className="font-semibold tracking-[3px] text-[11px] sm:text-xs mb-3" style={{ color: "#22d3ee" }}>
            TECNOLOGÍA
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-50 mb-3 tracking-tight">
            Equipamiento de última generación
          </h2>
          <p className="text-slate-400 text-sm md:text-base mb-8 leading-relaxed">
            Invertimos en tecnología diagnóstica y terapéutica de vanguardia
            para reducir tiempos de tratamiento y aumentar la precisión.
          </p>

          <div className="grid sm:grid-cols-2 gap-5">
            {EQUIPOS.map((e) => {
              const Icon = e.icon;
              return (
                <div key={e.title} className="flex gap-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(34,211,238,0.1)" }}
                  >
                    <Icon size={15} style={{ color: "#22d3ee" }} />
                  </div>
                  <div>
                    <h3 className="text-slate-50 font-semibold text-[13px] mb-1">{e.title}</h3>
                    <p className="text-slate-400 text-[11.5px] leading-relaxed">{e.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-white/10">
          <img
            src="/imagenes/Agendas.jpeg"
            alt="Equipamiento y tecnología DentalTER"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
