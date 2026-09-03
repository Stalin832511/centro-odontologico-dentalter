import Link from "next/link";
import { CalendarCheck, Stethoscope } from "lucide-react";

export default function CTAFinal() {
  return (
    <section
      className="py-20 md:py-28 px-5 sm:px-6 text-center"
      style={{ background: "linear-gradient(135deg, #0e7490, #0891b2)" }}
    >
      <div className="max-w-2xl mx-auto">
        <p className="font-semibold tracking-[3px] text-[11px] sm:text-xs mb-4 text-cyan-50">
          ¿LISTO PARA TU CITA?
        </p>

        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 leading-tight tracking-tight">
          Tu sonrisa merece atención especializada
        </h2>

        <p className="text-cyan-50 text-sm md:text-base mb-8">
          Agenda tu consulta hoy y descubre por qué somos la clínica de
          confianza de miles de pacientes.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/agendar"
            className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold bg-white text-cyan-800 shadow-xl hover:scale-[1.03] transition-transform duration-300"
          >
            <CalendarCheck size={18} />
            Agendar Consulta
          </Link>

          <Link
            href="/servicios"
            className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl text-sm font-semibold text-white border border-white/40 hover:bg-white/10 transition-colors duration-300"
          >
            <Stethoscope size={18} />
            Ver Servicios
          </Link>
        </div>
      </div>
    </section>
  );
}
