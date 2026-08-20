"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function Servicios() {

  // CONTROL ACORDEÓN
  const [open, setOpen] = useState<number | null>(0);

  const servicios = [

    {
      title: "Odontología General",
      img: "/imagenes/Imagen-1.jpeg",
      desc:
        "Brindamos atención odontológica integral orientada a la prevención, el diagnóstico oportuno y el tratamiento de las principales condiciones bucodentales. Cada valoración se realiza con un enfoque personalizado, combinando procedimientos actuales y protocolos seguros que preservan la funcionalidad dental y la salud oral a largo plazo, para pacientes de todas las edades.",
    },

    {
      title: "Profilaxis Dental",
      img: "/imagenes/Imagen-2.jpeg",
      desc:
        "Nuestro servicio de profilaxis dental está diseñado para la prevención y el cuidado integral de la salud bucal. Mediante una limpieza profesional profunda eliminamos placa bacteriana, sarro y manchas superficiales, reduciendo de forma efectiva el riesgo de caries, gingivitis y enfermedad periodontal, y devolviendo a la sonrisa su aspecto saludable.",
    },

    {
      title: "Fluorización Dental",
      img: "/imagenes/Imagen-3.jpeg",
      desc:
        "Aplicamos tratamientos de fluorización con productos de alta calidad orientados a fortalecer y remineralizar el esmalte dental. Este procedimiento preventivo ayuda a reducir la sensibilidad, proteger las piezas dentales frente a la caries y reforzar la salud oral de niños, jóvenes y adultos.",
    },

    {
      title: "Restauraciones Dentales",
      img: "/imagenes/Imagen-4.jpeg",
      desc:
        "Recuperamos la forma, función y estética de piezas dentales afectadas por caries, fracturas o desgaste mediante restauraciones realizadas con materiales modernos y de alta durabilidad. Cada procedimiento busca devolver una apariencia natural y armónica, respetando la anatomía original del diente.",
    },

    {
      title: "Extracciones Dentales",
      img: "/imagenes/Imagen-5.jpeg",
      desc:
        "Realizamos extracciones dentales mediante técnicas seguras y mínimamente invasivas, priorizando siempre la comodidad y una recuperación adecuada del paciente. Atendemos casos de piezas dañadas, infecciones, fracturas o limitaciones de espacio con criterio clínico y protocolos actualizados.",
    },

    {
      title: "Cirugía de Terceros Molares",
      img: "/imagenes/Imagen-6.jpeg",
      desc:
        "Ofrecemos cirugía especializada de terceros molares (muelas del juicio) respaldada por diagnóstico clínico y radiográfico preciso. Nuestro enfoque está orientado a resolver casos de dolor, inflamación, infecciones o retención dental mediante procedimientos modernos, seguros y de recuperación controlada.",
    },

    {
      title: "Blanqueamiento Dental",
      img: "/imagenes/Imagen-1.jpeg",
      desc:
        "Diseñamos tratamientos de blanqueamiento dental profesional orientados a mejorar el tono y luminosidad natural de los dientes. Utilizamos técnicas seguras y clínicamente respaldadas que ofrecen resultados visibles, naturales y duraderos para una sonrisa más brillante.",
    },

    {
      title: "Prótesis Totales y Parciales",
      img: "/imagenes/Imagen-2.jpeg",
      desc:
        "Elaboramos prótesis dentales totales y parciales de forma personalizada, orientadas a restaurar la funcionalidad masticatoria y la estética oral. Cada rehabilitación se diseña a la medida del paciente, priorizando comodidad, estabilidad y una apariencia natural.",
    },

    {
      title: "Puentes Fijos",
      img: "/imagenes/Imagen-3.jpeg",
      desc:
        "Reemplazamos piezas dentales ausentes mediante puentes fijos diseñados para recuperar una mordida funcional y una apariencia natural. Utilizamos materiales resistentes y duraderos que mejoran tanto la estética dental como la calidad de vida del paciente.",
    },

    {
      title: "Tratamiento de Ortodoncia",
      img: "/imagenes/Imagen-4.jpeg",
      desc:
        "Ofrecemos tratamientos de ortodoncia orientados a corregir la posición dental y optimizar la mordida mediante planes de tratamiento personalizados. Empleamos técnicas modernas que permiten lograr una sonrisa alineada, funcional y estéticamente armónica.",
    },

    {
      title: "Endodoncia",
      img: "/imagenes/Imagen-5.jpeg",
      desc:
        "Realizamos tratamientos de endodoncia especializados para preservar piezas dentales afectadas por infecciones o daños profundos. Cada procedimiento se ejecuta con precisión clínica, eliminando el dolor y restaurando la salud bucal sin necesidad de extracción.",
    },

    {
      title: "Cirugía de Frenillo Labial y Lingual",
      img: "/imagenes/Imagen-6.jpeg",
      desc:
        "Realizamos cirugía de frenillo labial y lingual mediante procedimientos seguros y especializados, orientados a mejorar funciones como el habla, la alimentación y la movilidad oral. Nuestro enfoque prioriza el bienestar funcional y una recuperación adecuada en cada caso.",
    },

    {
      title: "Consulta General",
      img: "/imagenes/Imagen-1.jpeg",
      desc:
        "Ideal si aún no sabes qué tratamiento necesitas. Realizamos una valoración odontológica completa para identificar el estado de tu salud bucal y recomendarte el plan de tratamiento más adecuado, con la orientación de nuestro equipo de especialistas.",
    },

  ];

  return (

    <main

      className="

        min-h-screen

        overflow-x-hidden

        bg-gradient-to-b

        from-slate-200

        via-slate-100

        to-sky-200
      "
    >

      {/* NAVBAR */}
      <Navbar />


      {/* HERO */}
      <section

        className="

          relative

          h-[45vh]

          md:h-[60vh]

          overflow-hidden
        "
      >

        <img
          src="/imagenes/Servicios.jpeg"
          alt="Servicios"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/45" />

        <div

          className="

            absolute

            inset-0

            flex

            flex-col

            items-center

            justify-center

            text-center

            px-6

            z-10
          "
        >

          <p

            className="

              text-cyan-300

              tracking-[4px]

              text-sm

              md:text-base

              mb-4

              font-semibold
            "
          >
            TECNOLOGÍA • ESTÉTICA • PRECISIÓN
          </p>

          <h1

            className="

              text-4xl

              md:text-6xl

              font-bold

              text-white
            "
          >
            Servicios Odontológicos
          </h1>

        </div>

      </section>


      {/* TEXTO */}
      <section className="text-center px-6 mt-14">

        <p

          className="

            text-slate-700

            text-lg

            md:text-2xl

            max-w-4xl

            mx-auto

            leading-relaxed
          "
        >
          Descubre nuestros tratamientos modernos diseñados para
          brindar estética, salud y tecnología avanzada en cada sonrisa.
        </p>

      </section>


      {/* GRID */}
      <section className="max-w-7xl mx-auto px-6 py-16">

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">

          {servicios.map((s, index) => {

            const isOpen = open === index;

            return (

              <div

                key={index}

                className="

                  bg-white/90

                  backdrop-blur-xl

                  rounded-3xl

                  overflow-hidden

                  border

                  border-white/40

                  shadow-xl

                  transition-all

                  duration-300

                  hover:-translate-y-1
                "
              >

                {/* IMAGEN */}
                <img
                  src={s.img}
                  alt={s.title}
                  className="w-full h-64 object-cover"
                />


                {/* BOTON */}
                <button

                  onClick={() =>
                    setOpen(isOpen ? null : index)
                  }

                  className="

                    w-full

                    p-6

                    flex

                    items-center

                    justify-between

                    gap-4

                    text-left
                  "
                >

                  <h2

                    className="

                      text-xl

                      font-bold

                      text-slate-800

                      leading-snug
                    "
                  >
                    {s.title}
                  </h2>


                  {/* ICONO */}
                  <div

                    className={`

                      w-12
                      h-12

                      rounded-full

                      flex

                      items-center

                      justify-center

                      text-3xl

                      text-white

                      shrink-0

                      transition-all

                      duration-300

                      ${isOpen
                        ? "bg-cyan-600 rotate-45"
                        : "bg-cyan-400"}
                    `}
                  >
                    +
                  </div>

                </button>


                {/* DESCRIPCION */}
                <div

                  className={`

                    overflow-hidden

                    transition-all

                    duration-500

                    ease-in-out

                    ${isOpen
                      ? "max-h-96 opacity-100"
                      : "max-h-0 opacity-0"}
                  `}
                >

                  <div

                    className="

                      px-6

                      pb-6
                    "
                  >

                    <div

                      className="

                        border-t

                        border-slate-200

                        pt-5
                      "
                    >

                      <p

                        className="

                          text-slate-600

                          leading-relaxed

                          text-[15px]

                          md:text-base
                        "
                      >
                        {s.desc}
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            );

          })}

        </div>

      </section>

    </main>
  );
}
