import Link from "next/link";
import { Sparkles, AlignCenter, Bone, ScanLine, ShieldCheck, Siren, ArrowRight } from "lucide-react";
import { clinicConfig } from "@/config/clinicConfig";

const SERVICIOS = [
  { icon: Sparkles, title: "Estética dental", desc: "Carillas, blanqueamiento y diseño de sonrisa" },
  { icon: AlignCenter, title: "Ortodoncia", desc: "Brackets estéticos y alineadores invisibles" },
  { icon: Bone, title: "Implantes dentales", desc: "Rehabilitación guiada por tomografía 3D" },
  { icon: ScanLine, title: "Radiología digital", desc: "Diagnóstico preciso, baja radiación" },
  { icon: ShieldCheck, title: "Odontología preventiva", desc: "Limpiezas, selladores y control periódico" },
  { icon: Siren, title: "Urgencias dentales", desc: "Atención inmediata, dolor y traumatismos" },
];

export default function ServiciosPreview() {
  return (
    <section className="bg-white py-16 md:py-20 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-5 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <p className="font-semibold tracking-[3px] text-[11px] sm:text-xs mb-3" style={{ color: "#0891b2" }}>
              NUESTROS SERVICIOS
            </p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              Tratamientos de vanguardia
            </h2>
          </div>

          <Link
            href="/servicios"
            className="flex items-center gap-1.5 text-sm font-semibold shrink-0"
            style={{ color: "#0891b2" }}
          >
            Ver todos los servicios
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SERVICIOS.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.title} className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
                <div className="w-full aspect-[16/10]">
                  <img
                    src={clinicConfig.serviciosHero}
                    alt={s.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="p-4">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
                    style={{ backgroundColor: "#e0f7fb" }}
                  >
                    <Icon size={15} style={{ color: "#0891b2" }} />
                  </div>
                  <h3 className="text-slate-900 font-semibold text-[13px] mb-1">{s.title}</h3>
                  <p className="text-slate-500 text-[12px] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
