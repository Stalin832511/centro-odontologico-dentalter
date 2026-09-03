import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import { clinicConfig } from "@/config/clinicConfig";

const MENU = [
  { name: "Inicio", link: "/" },
  { name: "Servicios", link: "/servicios" },
  { name: "Quiénes Somos", link: "/quienes-somos" },
  { name: "Testimonios", link: "/testimonios" },
  { name: "Contacto", link: "/contacto" },
];

export default function Footer() {
  return (
    <footer className="bg-[#0d0f13] pt-14 pb-28 lg:pb-10 px-5 sm:px-6">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        <div>
          <h3 className="text-lg font-extrabold uppercase mb-3 tracking-tight">
            <span className="text-white">{clinicConfig.logoWhite}</span>
            <span style={{ color: clinicConfig.primaryColor }}>{clinicConfig.logoColor}</span>
          </h3>
          <p className="text-slate-400 text-[12px] leading-relaxed">
            Clínica odontológica premium comprometida con tu salud bucal y bienestar.
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-widest mb-3" style={{ color: "#22d3ee" }}>
            MENÚ
          </p>
          <ul className="space-y-2">
            {MENU.map((item) => (
              <li key={item.link}>
                <Link href={item.link} className="text-slate-400 hover:text-white text-[12px] transition-colors duration-300">
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-widest mb-3" style={{ color: "#22d3ee" }}>
            CONTACTO
          </p>
          <ul className="space-y-2.5 text-[12px] text-slate-400">
            <li className="flex items-start gap-2">
              <MapPin size={14} className="mt-0.5 shrink-0" style={{ color: "#22d3ee" }} />
              {clinicConfig.address}
            </li>
            <li className="flex items-center gap-2">
              <Mail size={14} className="shrink-0" style={{ color: "#22d3ee" }} />
              {clinicConfig.email}
            </li>
            <li className="flex items-center gap-2">
              <Phone size={14} className="shrink-0" style={{ color: "#22d3ee" }} />
              {clinicConfig.whatsapp}
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[10px] font-semibold tracking-widest mb-3" style={{ color: "#22d3ee" }}>
            HORARIO
          </p>
          <ul className="space-y-2 text-[12px] text-slate-400">
            <li>Lunes a viernes: 8:00 - 18:00</li>
            <li>Sábados: 9:00 - 13:00</li>
            <li>Urgencias: 24/7</li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-white/10 pt-5 text-center">
        <p className="text-slate-500 text-[11px]">
          © {new Date().getFullYear()} {clinicConfig.clinicName}. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
