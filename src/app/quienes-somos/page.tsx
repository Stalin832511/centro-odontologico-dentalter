"use client";

// Navbar
import Navbar from "@/components/Navbar";

// Iconos premium
import {
  Award,
  HeartHandshake,
  ShieldCheck,
  Smile,
  Stethoscope,
  Sparkles,
  Star,
} from "lucide-react";

export default function QuienesSomos() {

  const valores = [
    {
      icon: <HeartHandshake size={34} />,
      title: "Atención Personalizada",
      desc: "Cada paciente recibe una evaluación individual con tratamientos diseñados específicamente para sus necesidades clínicas.",
    },

    {
      icon: <ShieldCheck size={34} />,
      title: "Tecnología Avanzada",
      desc: "Trabajamos con equipos digitales modernos para ofrecer diagnósticos precisos y tratamientos odontológicos seguros.",
    },

    {
      icon: <Smile size={34} />,
      title: "Estética Dental",
      desc: "Creamos sonrisas armónicas y naturales combinando salud, funcionalidad y estética avanzada.",
    },

    {
      icon: <Award size={34} />,
      title: "Experiencia Profesional",
      desc: "Más de 15 años brindando excelencia odontológica con atención ética, profesional y humana.",
    },
  ];


  const doctores = [

    {
      nombre: "Dra. Tatiana Fajardo",
      especialidad: "Odontología Integral y Estética Dental",
      imagen: "/imagenes/Dra_fajardo.png",

      descripcion:
        "Especialista en odontología integral con amplia experiencia en rehabilitación oral, estética dental y tratamientos modernos orientados a la salud y armonía de la sonrisa.",

      experiencia:
        "Reconocida por su enfoque clínico personalizado, precisión estética y atención profesional enfocada en el bienestar integral del paciente.",
    },

    {
      nombre: "Dr. Jackson Bravo",
      especialidad: "Endodoncia y Cirugía Oral",
      imagen: "/imagenes/Dr_Bravo.jpeg",

      descripcion:
        "Especialista en endodoncia avanzada y cirugías de terceros molares, realizando procedimientos seguros, precisos y mínimamente invasivos.",

      experiencia:
        "Cuenta con trayectoria profesional en tratamientos complejos orientados a preservar la salud oral y mejorar la calidad de vida del paciente.",
    },

    {
      nombre: "Dra. Deborah Maldonado",
      especialidad: "Cirugía de Frenillo Labial y Lingual",
      imagen: "/imagenes/Dra_Maldonado.jpeg",

      descripcion:
        "Especialista en procedimientos quirúrgicos funcionales enfocados en cirugía de frenillos labiales y linguales mediante técnicas modernas y seguras.",

      experiencia:
        "Destaca por su atención profesional, precisión clínica y enfoque especializado en mejorar la funcionalidad y bienestar oral.",
    },
  ];


  return (

    <main className="min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-100 via-cyan-50 to-sky-100 text-slate-800">

      {/* NAVBAR */}
      <Navbar />


      {/* HERO PREMIUM */}
      <section className="relative h-[70vh] md:h-[90vh] overflow-hidden">

        <img
          src="/imagenes/Quienes-somos.jpeg"
          alt="Clínica odontológica"
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />

        {/* EFECTO SUAVE */}
        <div className="absolute inset-0 bg-cyan-500/10 backdrop-blur-[2px]" />


        {/* CONTENIDO */}
        <div className="relative z-10 h-full flex items-center">

          <div className="max-w-7xl mx-auto px-6 w-full">

            <div className="max-w-3xl">

              <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 backdrop-blur-2xl px-6 py-3 rounded-full mb-8 shadow-xl">

                <Sparkles className="text-cyan-300" size={20} />

                <p className="text-cyan-200 tracking-[4px] text-sm font-semibold">
                  CLÍNICA ODONTOLÓGICA PREMIUM
                </p>

              </div>

              <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-8">
                Especialistas en salud y estética dental avanzada
              </h1>

              <p className="text-white/90 text-lg md:text-2xl leading-relaxed max-w-2xl">
                Combinamos experiencia profesional, innovación tecnológica
                y atención personalizada para transformar sonrisas con excelencia.
              </p>

              {/* BOTONES */}
              <div className="flex flex-wrap gap-5 mt-10">

                <button className="bg-cyan-400 hover:bg-cyan-300 transition-all duration-300 text-slate-900 font-semibold px-8 py-4 rounded-2xl shadow-2xl">
                  Agendar Consulta
                </button>

                <button className="border border-white/30 bg-white/10 backdrop-blur-xl hover:bg-white/20 transition-all duration-300 text-white font-semibold px-8 py-4 rounded-2xl">
                  Conocer Especialistas
                </button>

              </div>

            </div>

          </div>

        </div>

      </section>



      {/* CONTENIDO PRINCIPAL */}
      <section className="max-w-7xl mx-auto px-6 py-28 grid lg:grid-cols-2 gap-20 items-center">

        {/* IMAGEN */}
        <div className="relative">

          <img
            src="/imagenes/Quienes-somos2.jpeg"
            alt="Equipo odontológico"
            className="relative z-10 w-full rounded-[45px] border-[8px] border-white shadow-2xl"
          />

          {/* BADGE */}
          <div
            className="
              absolute bottom-5 right-3
              md:bottom-10 md:-right-6
              z-20
              bg-white/80 backdrop-blur-2xl
              px-5 py-4 md:px-8 md:py-7
              rounded-3xl
              shadow-2xl border border-white/60
            "
          >

            <h3 className="text-3xl md:text-5xl font-bold text-slate-900">
              15+
            </h3>

            <p className="text-sm md:text-base text-slate-600 leading-tight">
              Años de experiencia
            </p>

          </div>

        </div>


        {/* TEXTO */}
        <div>

          <p className="text-[#02D3F1] font-semibold tracking-[4px] mb-5">
            EXPERIENCIA · CONFIANZA · TECNOLOGÍA
          </p>

          <h2 className="text-4xl md:text-6xl font-bold leading-tight text-slate-900 mb-8">
            Transformamos sonrisas con excelencia profesional
          </h2>

          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Nuestro equipo odontológico está conformado por especialistas altamente capacitados en diferentes áreas de la odontología moderna.
          </p>

          <p className="text-slate-600 text-lg leading-relaxed mb-6">
            Brindamos tratamientos integrales mediante tecnología avanzada, atención personalizada y procedimientos enfocados en la salud, funcionalidad y estética dental.
          </p>

          <p className="text-slate-600 text-lg leading-relaxed">
            Cada tratamiento es realizado bajo altos estándares de calidad, garantizando seguridad, precisión y una experiencia profesional premium.
          </p>

        </div>

      </section>



      {/* ESPECIALISTAS */}
      <section className="max-w-7xl mx-auto px-6 pb-28">

        <div className="text-center mb-20">

          <p className="text-[#02D3F1] font-semibold tracking-[4px] mb-5">
            NUESTRO EQUIPO MÉDICO
          </p>

          <h2 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
            Especialistas altamente calificados
          </h2>

          <p className="text-slate-600 text-lg max-w-3xl mx-auto">
            Profesionales comprometidos con brindar tratamientos odontológicos modernos,
            seguros y personalizados mediante experiencia clínica y tecnología avanzada.
          </p>

        </div>


        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">

          {doctores.map((doctor, i) => (

            <div
              key={i}
              className="
                relative
                bg-white/65
                backdrop-blur-2xl
                border border-white/60
                rounded-[40px]
                shadow-xl
                overflow-hidden
                hover:-translate-y-2
                transition-all
                duration-500
              "
            >

              {/* FONDO DECORATIVO */}
              <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-r from-cyan-400 to-sky-500" />

              {/* CONTENIDO */}
              <div className="relative z-10 px-8 pb-10 pt-12 text-center">

                {/* IMAGEN REDONDA */}
                <div className="relative w-52 h-52 mx-auto mb-8">

                  <div className="absolute inset-0 rounded-full bg-white/30 blur-2xl" />

                  <img
                    src={doctor.imagen}
                    alt={doctor.nombre}
                    className="
                      relative
                      w-full
                      h-full
                      object-cover
                      rounded-full
                      border-[8px]
                      border-white
                      shadow-2xl
                    "
                  />

                </div>


                {/* ICONO */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
                  <Stethoscope size={30} />
                </div>


                {/* NOMBRE */}
                <h3 className="text-3xl font-bold text-slate-900 mb-3">
                  {doctor.nombre}
                </h3>

                {/* ESPECIALIDAD */}
                <p className="text-cyan-600 font-semibold mb-6">
                  {doctor.especialidad}
                </p>

                {/* RESEÑA */}
                <p className="text-slate-600 leading-relaxed text-[15px] mb-5">
                  {doctor.descripcion}
                </p>

                <p className="text-slate-500 leading-relaxed text-[14px]">
                  {doctor.experiencia}
                </p>


                {/* ESTRELLAS */}
                <div className="flex justify-center gap-2 mt-8 text-cyan-500">

                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />
                  <Star size={18} fill="currentColor" />

                </div>

              </div>

            </div>

          ))}

        </div>

      </section>



      {/* VALORES */}
      <section className="max-w-7xl mx-auto px-6 pb-28">

        <div className="text-center mb-16">

          <p className="text-[#02D3F1] font-semibold tracking-[4px] mb-5">
            NUESTRA FILOSOFÍA
          </p>

          <h2 className="text-4xl md:text-6xl font-bold text-slate-900">
            Comprometidos con tu bienestar
          </h2>

        </div>


        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">

          {valores.map((item, i) => (

            <div
              key={i}
              className="
                bg-white/60
                backdrop-blur-2xl
                border border-white/60
                p-8
                rounded-[34px]
                shadow-lg
                hover:-translate-y-2
                transition-all
                duration-300
              "
            >

              {/* ICONO */}
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center text-white mb-8 shadow-xl">
                {item.icon}
              </div>

              {/* TITULO */}
              <h3 className="text-2xl font-bold mb-5 text-slate-900">
                {item.title}
              </h3>

              {/* TEXTO */}
              <p className="text-slate-600 text-[15px] leading-relaxed">
                {item.desc}
              </p>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}