"use client";

import {
  Clock3,
  UserRound,
} from "lucide-react";

export default function AgendaDia() {

  const agenda = [

    {
      hora: "09:00",
      paciente: "Carlos Mendoza",
    },

    {
      hora: "10:30",
      paciente: "Andrea Flores",
    },

    {
      hora: "11:45",
      paciente: "Luis Ramírez",
    },

    {
      hora: "14:00",
      paciente: "María Zambrano",
    },

  ];

  return (

    <div
      className="
        bg-white

        rounded-[32px]

        p-6

        shadow-xl
      "
    >

      <h2
        className="
          text-2xl

          font-black

          text-slate-800

          mb-6
        "
      >
        Agenda del Día
      </h2>

      <div className="space-y-4">

        {agenda.map((item, index) => (

          <div
            key={index}
            className="
              flex
              items-center

              justify-between

              bg-slate-50

              rounded-2xl

              p-4
            "
          >

            <div
              className="
                flex
                items-center

                gap-4
              "
            >

              <div
                className="
                  w-12
                  h-12

                  rounded-xl

                  bg-cyan-100

                  flex
                  items-center
                  justify-center

                  text-cyan-600
                "
              >
                <Clock3 size={20} />
              </div>

              <div>

                <p className="font-bold">
                  {item.hora}
                </p>

                <p className="text-slate-500">
                  {item.paciente}
                </p>

              </div>

            </div>

            <UserRound
              className="text-slate-400"
              size={22}
            />

          </div>

        ))}

      </div>

    </div>

  );

}