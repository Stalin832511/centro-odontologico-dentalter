"use client";

import {
  Users,
  CalendarDays,
  DollarSign,
  Stethoscope,
  TrendingUp,
} from "lucide-react";

export default function DashboardCards() {

  const cards = [

    {
      titulo: "Pacientes",
      valor: "1,248",
      crecimiento: "+12%",
      icono: <Users size={34} />,
      color:
        "from-cyan-500 via-sky-500 to-blue-600",
    },

    {
      titulo: "Citas Hoy",
      valor: "42",
      crecimiento: "+8%",
      icono: <CalendarDays size={34} />,
      color:
        "from-violet-500 via-fuchsia-500 to-purple-600",
    },

    {
      titulo: "Ingresos",
      valor: "$12,850",
      crecimiento: "+18%",
      icono: <DollarSign size={34} />,
      color:
        "from-emerald-500 via-green-500 to-teal-600",
    },

    {
      titulo: "Doctores",
      valor: "12",
      crecimiento: "+4%",
      icono: <Stethoscope size={34} />,
      color:
        "from-orange-400 via-amber-500 to-yellow-500",
    },

  ];

  return (

    <section
      className="
        grid

        grid-cols-1
        md:grid-cols-2
        xl:grid-cols-4

        gap-6
      "
    >

      {cards.map((card, index) => (

        <div
          key={index}
          className="
            relative

            overflow-hidden

            rounded-[30px]

            bg-white

            shadow-xl

            border
            border-slate-100

            p-6

            hover:-translate-y-2

            transition-all
            duration-300
          "
        >

          <div
            className={`
              w-16
              h-16

              rounded-2xl

              bg-gradient-to-br
              ${card.color}

              flex
              items-center
              justify-center

              text-white

              mb-5
            `}
          >
            {card.icono}
          </div>

          <p
            className="
              text-slate-500

              font-medium
            "
          >
            {card.titulo}
          </p>

          <h2
            className="
              text-4xl

              font-black

              text-slate-800

              mt-2
            "
          >
            {card.valor}
          </h2>

          <div
            className="
              mt-4

              flex
              items-center

              gap-2
            "
          >

            <TrendingUp
              size={18}
              className="text-emerald-500"
            />

            <span
              className="
                text-emerald-500

                font-bold
              "
            >
              {card.crecimiento}
            </span>

          </div>

          <div
            className={`
              absolute

              -top-10
              -right-10

              w-36
              h-36

              rounded-full

              opacity-10

              bg-gradient-to-br
              ${card.color}
            `}
          />

        </div>

      ))}

    </section>

  );

}