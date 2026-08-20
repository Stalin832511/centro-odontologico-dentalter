"use client";

// Navbar
import Navbar from "@/components/Navbar";

// Iconos Lucide
import {
  MapPin,
  Phone,
  Mail,
  Clock3,
} from "lucide-react";

// Redes Sociales
import {
  FaFacebookF,
  FaInstagram,
  FaTelegramPlane,
  FaWhatsapp,
} from "react-icons/fa";


// Página Contacto
export default function Contacto() {

  return (

    <main
      className="
        min-h-screen
        bg-gradient-to-b
        from-slate-200
        via-slate-100
        to-cyan-100
        overflow-x-hidden
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

        {/* Imagen principal */}
        <img
          src="/imagenes/Contactos.jpeg"
          alt="Contacto"
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
            bg-black/45
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
            z-10
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
            CONTACTO PROFESIONAL
          </p>

          <h1
            className="
              text-4xl
              md:text-6xl
              font-bold
              text-white
            "
          >
            Agenda tu cita hoy
          </h1>

        </div>

      </section>


      {/* CONTENIDO */}

      <section
        className="
          max-w-7xl
          mx-auto
          px-6
          py-20
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-10
        "
      >

        {/* INFORMACIÓN */}

        <div
          className="
            bg-white/80
            backdrop-blur-xl
            rounded-3xl
            p-8
            shadow-2xl
            border
            border-white/40
          "
        >

          <h2
            className="
              text-3xl
              font-bold
              text-slate-800
              mb-8
            "
          >
            Información de contacto
          </h2>


          {/* Datos */}

          <div className="space-y-8">

            {/* Dirección */}

            <div className="flex gap-5">

              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-[#02D3F1]
                  flex
                  items-center
                  justify-center
                  text-white
                "
              >
                <MapPin size={26} />
              </div>

              <div>

                <h3 className="font-bold text-lg">
                  Dirección
                </h3>

                <p className="text-slate-600">
                  Av. Principal #245 y Calle Central
                </p>

              </div>

            </div>


            {/* Teléfono */}

            <div className="flex gap-5">

              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-[#02D3F1]
                  flex
                  items-center
                  justify-center
                  text-white
                "
              >
                <Phone size={26} />
              </div>

              <div>

                <h3 className="font-bold text-lg">
                  Teléfono
                </h3>

                <p className="text-slate-600">
                  +593 99 999 9999
                </p>

              </div>

            </div>


            {/* Email */}

            <div className="flex gap-5">

              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-[#02D3F1]
                  flex
                  items-center
                  justify-center
                  text-white
                "
              >
                <Mail size={26} />
              </div>

              <div>

                <h3 className="font-bold text-lg">
                  Correo electrónico
                </h3>

                <p className="text-slate-600">
                  contacto@dentalcare.com
                </p>

              </div>

            </div>


            {/* Horarios */}

            <div className="flex gap-5">

              <div
                className="
                  w-14
                  h-14
                  rounded-2xl
                  bg-[#02D3F1]
                  flex
                  items-center
                  justify-center
                  text-white
                "
              >
                <Clock3 size={26} />
              </div>

              <div>

                <h3 className="font-bold text-lg">
                  Horarios
                </h3>

                <p className="text-slate-600">
                  Lunes a Viernes
                </p>

                <p className="text-slate-600">
                  08:00 AM - 18:00 PM
                </p>

              </div>

            </div>

          </div>


          {/* Redes Sociales */}

          <div className="mt-12">

            <h3
              className="
                text-2xl
                font-bold
                text-slate-800
                mb-6
              "
            >
              Redes Sociales
            </h3>


            <div className="flex gap-5">

              {/* Facebook */}

              <a
                href="#"
                className="
                  w-14
                  h-14
                  rounded-full
                  bg-[#1877F2]
                  flex
                  items-center
                  justify-center
                  text-white
                  hover:scale-110
                  transition-all
                  shadow-xl
                "
              >
                <FaFacebookF size={20} />
              </a>


              {/* Instagram */}

              <a
                href="#"
                className="
                  w-14
                  h-14
                  rounded-full
                  bg-gradient-to-tr
                  from-yellow-400
                  via-pink-500
                  to-purple-600
                  flex
                  items-center
                  justify-center
                  text-white
                  hover:scale-110
                  transition-all
                  shadow-xl
                "
              >
                <FaInstagram size={20} />
              </a>


              {/* Telegram */}

              <a
                href="#"
                className="
                  w-14
                  h-14
                  rounded-full
                  bg-[#229ED9]
                  flex
                  items-center
                  justify-center
                  text-white
                  hover:scale-110
                  transition-all
                  shadow-xl
                "
              >
                <FaTelegramPlane size={20} />
              </a>


              {/* WhatsApp */}

              <a
                href="#"
                className="
                  w-14
                  h-14
                  rounded-full
                  bg-[#25D366]
                  flex
                  items-center
                  justify-center
                  text-white
                  hover:scale-110
                  transition-all
                  shadow-xl
                "
              >
                <FaWhatsapp size={20} />
              </a>

            </div>

          </div>

        </div>


        {/* FORMULARIO */}

        <div
          className="
            bg-white/80
            backdrop-blur-xl
            rounded-3xl
            p-8
            shadow-2xl
            border
            border-white/40
          "
        >

          <h2
            className="
              text-3xl
              font-bold
              text-slate-800
              mb-8
            "
          >
            Solicita información
          </h2>


          <form className="space-y-6">

            {/* Nombre */}

            <input
              type="text"
              placeholder="Nombre completo"
              className="
                w-full
                p-4
                rounded-2xl
                border
                border-slate-200
                outline-none
                focus:border-cyan-400
              "
            />


            {/* Correo */}

            <input
              type="email"
              placeholder="Correo electrónico"
              className="
                w-full
                p-4
                rounded-2xl
                border
                border-slate-200
                outline-none
                focus:border-cyan-400
              "
            />


            {/* Teléfono */}

            <input
              type="text"
              placeholder="Número telefónico"
              className="
                w-full
                p-4
                rounded-2xl
                border
                border-slate-200
                outline-none
                focus:border-cyan-400
              "
            />


            {/* Mensaje */}

            <textarea
              rows={6}
              placeholder="Escribe tu mensaje..."
              className="
                w-full
                p-4
                rounded-2xl
                border
                border-slate-200
                outline-none
                resize-none
                focus:border-cyan-400
              "
            />


            {/* Botón */}

            <button
              className="
                w-full
                bg-[#02D3F1]
                hover:bg-cyan-400
                transition-all
                text-white
                py-5
                rounded-2xl
                font-semibold
                text-lg
                shadow-xl
              "
            >
              Enviar Mensaje
            </button>

          </form>

        </div>

      </section>

    </main>
  );
}