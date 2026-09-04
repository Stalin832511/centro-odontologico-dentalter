"use client";

// Navbar
import Navbar from "@/components/Navbar";

// Iconos
import { Star } from "lucide-react";

// Página Testimonios
export default function TestimoniosPage() {

  // Lista testimonios
  const testimonios = [

    {
      nombre: "María Fernanda López",
      ciudad: "Guayaquil, Ecuador",
      imagen: "/imagenes/Testimonio-1.jpg",
      comentario:
        "La atención fue excelente desde el primer momento. La Dra. Tatina Fajardo me devolvió la confianza en mi sonrisa con un tratamiento moderno y totalmente profesional.",
    },

    {
      nombre: "Stalin Guachizaca",
      ciudad: "Guayas, Ecuador",
      imagen: "/imagenes/Testimonio-2.jpeg",
      comentario:
        "El consultorio cuenta con tecnología avanzada y un ambiente muy elegante. Todo el proceso fue rápido, cómodo y con resultados increíbles.",
    },

    {
      nombre: "Nathalia Girón",
      ciudad: "Guayas, Ecuador",
      imagen: "/imagenes/Testimonio-3.jpeg",
      comentario:
        "Me realizaron un diseño de sonrisa digital y quedé impresionada con la precisión del trabajo. Recomiendo totalmente esta clínica odontológica.",
    },

    {
      nombre: "Javier Zambrano",
      ciudad: "Manta, Ecuador",
      imagen: "/imagenes/Testimonio-4.jpeg",
      comentario:
        "La experiencia fue premium. Excelente atención, instalaciones modernas y un trato humano excepcional durante todo el tratamiento.",
    },

    {
      nombre: "Valentina Rojas",
      ciudad: "Ambato, Ecuador",
      imagen: "/imagenes/Testimonio-5.jpeg",
      comentario:
        "La mejor clínica dental que he visitado. El equipo profesional transmite mucha confianza y seguridad en cada procedimiento.",
    },

    {
      nombre: "Luis Fernando Paredes",
      ciudad: "Loja, Ecuador",
      imagen: "/imagenes/Testimonio-6.jpeg",
      comentario:
        "Estoy muy satisfecho con los resultados obtenidos. La atención personalizada y la calidad del servicio son realmente de alto nivel.",
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

        to-cyan-100

        text-slate-800
      "
    >

      {/* Navbar */}

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

        {/* Imagen */}

        <img

          src="/imagenes/Testimonios.jpeg"

          alt="Testimonios"

          className="

            absolute

            inset-0

            w-full

            h-full

            object-cover
          "
        />


        {/* Overlay */}

        <div

          className="

            absolute

            inset-0

            bg-black/35
          "
        />


        {/* Texto */}

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
          "
        >

          <p

            className="

              text-[#02D3F1]

              tracking-[5px]

              font-semibold

              mb-4
            "
          >
            EXPERIENCIAS REALES
          </p>


          <h1

            className="

              text-4xl

              md:text-6xl

              font-bold

              text-white

              drop-shadow-2xl
            "
          >
            Testimonios
          </h1>

        </div>

      </section>



      {/* INTRO */}

      <section

        className="

          max-w-4xl

          mx-auto

          px-6

          pt-16

          text-center
        "
      >

        <h2

          className="

            text-3xl

            md:text-5xl

            font-bold

            mb-6
          "
        >
          Nuestros pacientes hablan por nosotros
        </h2>


        <p

          className="

            text-slate-600

            text-lg

            md:text-xl

            leading-relaxed
          "
        >
          Cada sonrisa refleja nuestro compromiso
          con la excelencia odontológica, la innovación
          tecnológica y la atención personalizada.
        </p>

      </section>



      {/* GRID TESTIMONIOS */}

      <section

        className="

          max-w-7xl

          mx-auto

          px-6

          py-20
        "
      >

        <div

          className="

            grid

            grid-cols-1

            md:grid-cols-2

            xl:grid-cols-3

            gap-8
          "
        >

          {testimonios.map((item, i) => (

            <div

              key={i}

              className="

                group

                relative

                bg-white/80

                backdrop-blur-xl

                border

                border-white/50

                rounded-[30px]

                overflow-hidden

                shadow-[0_15px_40px_rgba(0,0,0,0.08)]

                hover:-translate-y-2

                hover:shadow-[0_20px_60px_rgba(2,211,241,0.25)]

                transition-all

                duration-500
              "
            >

              {/* Brillo superior */}

              <div

                className="

                  absolute

                  top-0

                  left-0

                  w-full

                  h-1

                  bg-gradient-to-r

                  from-cyan-400

                  via-sky-300

                  to-cyan-500
                "
              />


              {/* Imagen */}

              <div className="p-6 pb-0">

                <img

                  src={item.imagen}

                  alt={item.nombre}

                  className="

                    w-24

                    h-24

                    rounded-full

                    object-cover

                    border-4

                    border-cyan-200

                    shadow-xl

                    mx-auto
                  "
                />

              </div>


              {/* Contenido */}

              <div className="p-8 text-center">

                {/* Estrellas */}

                <div

                  className="

                    flex

                    justify-center

                    gap-1

                    mb-5
                  "
                >

                  {[...Array(5)].map((_, index) => (

                    <Star

                      key={index}

                      size={20}

                      className="

                        fill-yellow-400

                        text-yellow-400
                      "
                    />

                  ))}

                </div>


                {/* Comentario */}

                <p

                  className="

                    text-slate-600

                    leading-relaxed

                    mb-8

                    text-[15px]
                  "
                >
                  “{item.comentario}”
                </p>


                {/* Línea */}

                <div

                  className="

                    w-16

                    h-[3px]

                    bg-cyan-400

                    mx-auto

                    rounded-full

                    mb-5
                  "
                />


                {/* Nombre */}

                <h3

                  className="

                    text-xl

                    font-bold

                    text-slate-800
                  "
                >
                  {item.nombre}
                </h3>


                {/* Ciudad */}

                <p

                  className="

                    text-cyan-600

                    mt-2

                    font-medium
                  "
                >
                  {item.ciudad}
                </p>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>
  );
}