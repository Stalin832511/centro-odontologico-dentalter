import { Microscope, ShieldCheck, Sparkles, HeartHandshake } from "lucide-react";

const RAZONES = [
  { icon: Microscope, title: "Diagnóstico de precisión", desc: "Tomografía 3D y escaneo digital milimétrico." },
  { icon: ShieldCheck, title: "Bioseguridad certificada", desc: "Esterilización clase B con trazabilidad total." },
  { icon: Sparkles, title: "Estética natural", desc: "Diseño de sonrisa digital, resultados armónicos." },
  { icon: HeartHandshake, title: "Atención personalizada", desc: "Seguimiento cercano en cada etapa." },
];

export default function PorQueElegirnos() {
  return (
    <section className="bg-[#12151a] py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
        <div className="w-full aspect-[4/3] order-2 lg:order-1 rounded-2xl overflow-hidden border border-white/10">
          <img
            src="/imagenes/Quienes-somos.jpeg"
            alt="Interior de la clínica DentalTER"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="order-1 lg:order-2">
          <p className="font-semibold tracking-[3px] text-[11px] sm:text-xs mb-3" style={{ color: "#22d3ee" }}>
            POR QUÉ ELEGIRNOS
          </p>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-50 mb-3 tracking-tight">
            Excelencia clínica respaldada por tecnología
          </h2>

          <p className="text-slate-400 text-sm md:text-base mb-8 leading-relaxed">
            Combinamos experiencia odontológica con equipamiento de última
            generación para tratamientos seguros, precisos y cómodos.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            {RAZONES.map((r) => {
              const Icon = r.icon;
              return (
                <div key={r.title} className="bg-[#171a20] border border-white/10 rounded-xl p-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
                    style={{ backgroundColor: "rgba(34,211,238,0.1)" }}
                  >
                    <Icon size={15} style={{ color: "#22d3ee" }} />
                  </div>
                  <h3 className="text-slate-50 font-semibold text-[13px] mb-1">{r.title}</h3>
                  <p className="text-slate-400 text-[11.5px] leading-relaxed">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
