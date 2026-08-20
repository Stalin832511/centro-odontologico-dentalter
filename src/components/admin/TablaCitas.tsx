"use client";

import {
  Eye,
  Pencil,
  Trash2,
  Search,
  Plus,
  FileDown,
} from "lucide-react";

export default function TablaCitas() {

  const citas = [

    {
      paciente: "Carlos Mendoza",
      doctor: "Dra. Tatiana",
      servicio: "Ortodoncia",
      fecha: "12/06/2026",
      hora: "09:00",
      estado: "Confirmada",
    },

    {
      paciente: "Andrea Flores",
      doctor: "Dr. Jackson",
      servicio: "Implantes",
      fecha: "12/06/2026",
      hora: "10:30",
      estado: "Pendiente",
    },

    {
      paciente: "Luis Ramírez",
      doctor: "Dra. Deborah",
      servicio: "Blanqueamiento",
      fecha: "12/06/2026",
      hora: "14:00",
      estado: "Confirmada",
    },

    {
      paciente: "María Zambrano",
      doctor: "Dra. Tatiana",
      servicio: "Diseño Sonrisa",
      fecha: "13/06/2026",
      hora: "11:00",
      estado: "Pendiente",
    },

  ];

  return (

    <div
      className="
        bg-white

        rounded-[32px]

        shadow-xl

        p-6
      "
    >

      {/* HEADER */}

      <div
        className="
          flex
          flex-col
          lg:flex-row

          gap-5

          justify-between

          mb-8
        "
      >

        <div>

          <h2
            className="
              text-3xl

              font-black

              text-slate-800
            "
          >
            Gestión de Citas
          </h2>

          <p className="text-slate-500">
            Administración completa de reservas
          </p>

        </div>

        <div className="flex flex-wrap gap-3">

          <button
            className="
              px-5
              py-3

              rounded-2xl

              bg-slate-100

              flex
              items-center

              gap-2
            "
          >
            <FileDown size={18} />
            PDF
          </button>

          <button
            className="
              px-5
              py-3

              rounded-2xl

              bg-gradient-to-r
              from-cyan-500
              to-sky-600

              text-white

              flex
              items-center

              gap-2
            "
          >
            <Plus size={18} />
            Nueva Cita
          </button>

        </div>

      </div>

      {/* BUSCADOR */}

      <div className="relative mb-6">

        <Search
          size={18}
          className="
            absolute

            left-4
            top-1/2

            -translate-y-1/2

            text-slate-400
          "
        />

        <input
          type="text"
          placeholder="Buscar cita..."
          className="
            w-full

            bg-slate-100

            rounded-2xl

            py-3
            pl-12
            pr-4

            outline-none
          "
        />

      </div>

      {/* TABLA */}

      <div className="overflow-x-auto">

        <table className="w-full">

          <thead>

            <tr
              className="
                border-b
                border-slate-200
              "
            >

              <th className="text-left py-4">
                Paciente
              </th>

              <th className="text-left py-4">
                Doctor
              </th>

              <th className="text-left py-4">
                Servicio
              </th>

              <th className="text-left py-4">
                Fecha
              </th>

              <th className="text-left py-4">
                Hora
              </th>

              <th className="text-left py-4">
                Estado
              </th>

              <th className="text-center py-4">
                Acciones
              </th>

            </tr>

          </thead>

          <tbody>

            {citas.map((cita, index) => (

              <tr
                key={index}
                className="
                  border-b
                  border-slate-100

                  hover:bg-slate-50
                "
              >

                <td className="py-5 font-semibold">
                  {cita.paciente}
                </td>

                <td>{cita.doctor}</td>

                <td>{cita.servicio}</td>

                <td>{cita.fecha}</td>

                <td>{cita.hora}</td>

                <td>

                  <span
                    className={`
                      px-4
                      py-2

                      rounded-full

                      text-sm

                      ${
                        cita.estado === "Confirmada"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }
                    `}
                  >
                    {cita.estado}
                  </span>

                </td>

                <td>

                  <div
                    className="
                      flex
                      justify-center

                      gap-2
                    "
                  >

                    <button
                      className="
                        w-10
                        h-10

                        rounded-xl

                        bg-cyan-100

                        text-cyan-600
                      "
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      className="
                        w-10
                        h-10

                        rounded-xl

                        bg-blue-100

                        text-blue-600
                      "
                    >
                      <Pencil size={18} />
                    </button>

                    <button
                      className="
                        w-10
                        h-10

                        rounded-xl

                        bg-red-100

                        text-red-600
                      "
                    >
                      <Trash2 size={18} />
                    </button>

                  </div>

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

}