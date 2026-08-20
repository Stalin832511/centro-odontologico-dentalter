"use client";

import {
  CalendarDays,
  UserPlus,
  ArrowRight,
  Activity,
} from "lucide-react";

export default function HeroDashboard() {
  return (
    <section
      className="
        relative
        overflow-hidden

        rounded-[35px]

        min-h-[420px]

        mb-8

        shadow-2xl
      "
    >
      {/* Fondo */}

      <img
        src="/imagenes/Agendas.jpeg"
        alt="Dashboard"
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

          bg-gradient-to-r
          from-[#0f172a]/95
          via-[#0369a1]/90
          to-[#06b6d4]/75
        "
      />

      {/* Contenido */}

      <div
        className="
          relative
          z-10

          h-full

          flex
          flex-col
          justify-center

          px-8
          md:px-14

          py-12
        "
      >
        <div
          className="
            inline-flex
            items-center
            gap-3

            px-5
            py-2

            rounded-full

            bg-white/10

            border
            border-white/20

            backdrop-blur-xl

            text-cyan-100

            w-fit

            mb-6
          "
        >
          <Activity size={18} />
          Sistema Administrativo Premium
        </div>

        <h1
          className="
            text-white

            text-4xl
            md:text-6xl

            font-black

            leading-tight

            max-w-4xl
          "
        >
          Bienvenida Dra. Tatiana
          <br />
          Centro de Control Clínico
        </h1>

        <p
          className="
            mt-6

            text-cyan-50

            text-lg
            md:text-xl

            max-w-3xl
          "
        >
          Administra pacientes, citas, doctores,
          tratamientos, finanzas y reportes desde una
          plataforma moderna diseñada para clínicas
          odontológicas de alto nivel.
        </p>

        {/* Botones */}

        <div
          className="
            mt-10

            flex
            flex-wrap

            gap-4
          "
        >
          <button
            className="
              px-7
              py-4

              rounded-2xl

              bg-white

              text-sky-700

              font-bold

              flex
              items-center
              gap-3

              hover:scale-105

              transition-all
            "
          >
            <UserPlus size={20} />
            Nuevo Paciente
          </button>

          <button
            className="
              px-7
              py-4

              rounded-2xl

              bg-cyan-500

              text-white

              font-bold

              flex
              items-center
              gap-3

              hover:scale-105

              transition-all
            "
          >
            <CalendarDays size={20} />
            Ver Agenda
          </button>
        </div>

        {/* Indicadores rápidos */}

        <div
          className="
            mt-10

            grid
            grid-cols-2
            md:grid-cols-4

            gap-4

            max-w-5xl
          "
        >
          {[
            {
              label: "Reservas Hoy",
              value: "68",
            },
            {
              label: "Pacientes",
              value: "1,284",
            },
            {
              label: "Doctores",
              value: "12",
            },
            {
              label: "Servicios",
              value: "24",
            },
          ].map((item, index) => (
            <div
              key={index}
              className="
                bg-white/10

                backdrop-blur-xl

                border
                border-white/20

                rounded-3xl

                p-5
              "
            >
              <p className="text-cyan-100 text-sm">
                {item.label}
              </p>

              <h3 className="text-white text-3xl font-black mt-2">
                {item.value}
              </h3>
            </div>
          ))}
        </div>
      </div>

      {/* Decoración */}

      <div
        className="
          hidden
          xl:flex

          absolute
          right-10
          bottom-10

          w-20
          h-20

          rounded-full

          bg-white/10

          backdrop-blur-xl

          items-center
          justify-center
        "
      >
        <ArrowRight
          size={40}
          className="text-white"
        />
      </div>
    </section>
  );
}