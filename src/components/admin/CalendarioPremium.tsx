"use client";

import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function CalendarioPremium() {

  const dias = [
    "L", "M", "M", "J", "V", "S", "D"
  ];

  const numeros = [
    1,2,3,4,5,6,7,
    8,9,10,11,12,13,14,
    15,16,17,18,19,20,21,
    22,23,24,25,26,27,28,
    29,30
  ];

  const citas = [8, 10, 15, 22, 27];

  return (

    <div
      className="
        bg-white

        rounded-[32px]

        shadow-lg

        p-7

        h-full
      "
    >

      {/* Header */}

      <div className="flex items-center justify-between mb-8">

        <div>

          <h2 className="text-2xl font-black text-slate-800">
            Calendario
          </h2>

          <p className="text-slate-500 mt-1">
            Gestión de citas mensuales
          </p>

        </div>

        <div
          className="
            w-14
            h-14

            rounded-2xl

            bg-cyan-100

            flex
            items-center
            justify-center
          "
        >
          <CalendarDays
            size={28}
            className="text-cyan-600"
          />
        </div>

      </div>

      {/* Mes */}

      <div className="flex items-center justify-between mb-6">

        <button
          className="
            w-10
            h-10

            rounded-xl

            bg-slate-100

            flex
            items-center
            justify-center
          "
        >
          <ChevronLeft size={18} />
        </button>

        <h3
          className="
            text-lg
            font-bold
            text-slate-800
          "
        >
          Mayo 2026
        </h3>

        <button
          className="
            w-10
            h-10

            rounded-xl

            bg-slate-100

            flex
            items-center
            justify-center
          "
        >
          <ChevronRight size={18} />
        </button>

      </div>

      {/* Días */}

      <div className="grid grid-cols-7 gap-2 mb-4">

        {dias.map((dia, index) => (

          <div
            key={index}
            className="
              text-center

              text-sm

              font-bold

              text-slate-500
            "
          >
            {dia}
          </div>

        ))}

      </div>

      {/* Calendario */}

      <div className="grid grid-cols-7 gap-2">

        {numeros.map((dia) => (

          <div
            key={dia}
            className={`
              relative

              h-12

              rounded-xl

              flex
              items-center
              justify-center

              font-semibold

              cursor-pointer

              transition-all

              ${
                citas.includes(dia)
                  ? "bg-gradient-to-r from-cyan-500 to-sky-500 text-white shadow-md"
                  : "bg-slate-50 text-slate-700 hover:bg-cyan-50"
              }
            `}
          >

            {dia}

            {citas.includes(dia) && (

              <span
                className="
                  absolute

                  top-1
                  right-1

                  w-2
                  h-2

                  rounded-full

                  bg-white
                "
              />

            )}

          </div>

        ))}

      </div>

      {/* Resumen */}

      <div
        className="
          mt-8

          rounded-3xl

          bg-gradient-to-r
          from-cyan-500
          to-blue-600

          p-5

          text-white
        "
      >

        <h3 className="font-bold text-lg mb-2">
          Resumen del Mes
        </h3>

        <p className="text-cyan-100">
          128 citas registradas
        </p>

        <p className="text-cyan-100">
          94 confirmadas
        </p>

        <p className="text-cyan-100">
          12 pendientes
        </p>

      </div>

    </div>

  );

}