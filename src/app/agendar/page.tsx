"use client";

import { useState, useEffect } from "react";

// Navbar
import Navbar from "@/components/Navbar";

// Cliente de Supabase — ajusta la ruta si es distinta en tu proyecto
import { supabase } from "@/lib/supabase";

// Iconos premium
import {
  CalendarDays,
  Clock3,
  UserRound,
  Phone,
  Mail,
  ClipboardList,
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  IdCard,
  Sparkles,
  Mail as MailIcon,
  PhoneCall,
} from "lucide-react";

// Funciones reales de conexión a Supabase
import {
  buscarOCrearPaciente,
  crearCita,
  enviarLinkActivacion,
} from "@/services/pacientes";

// Disponibilidad real (mismo motor que usan el panel admin y el
// dashboard del paciente logueado)
import {
  obtenerHorariosDisponibles,
  SlotDisponibilidad,
} from "@/services/disponibilidad";

// ============================================================
// Tipos de los catálogos reales (ya no hardcodeados)
// ============================================================
interface Doctor {
  id: number;
  nombres: string;
  apellidos: string;
  especialidad: string | null;
}

interface Servicio {
  id: number;
  nombre: string;
}

export default function AgendarConsulta() {
  // ===============================
  // ESTADOS
  // ===============================

  const [form, setForm] = useState({
    nombres: "",
    apellidos: "",
    cedula: "",
    telefono: "",
    email: "",
    servicio_id: "",
    doctor_id: "",
    fecha: "",
    hora: "",
    observaciones: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [resultado, setResultado] = useState<{
    esNuevo: boolean;
    tieneCorreo: boolean;
  } | null>(null);

  // Catálogos reales, traídos de Supabase en vez de hardcodeados.
  const [doctores, setDoctores] = useState<Doctor[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [cargandoCatalogos, setCargandoCatalogos] = useState(true);
  const [errorCatalogos, setErrorCatalogos] = useState<string | null>(null);

  // Disponibilidad real: se recalcula cada vez que cambia el
  // doctor o la fecha elegidos.
  const [slots, setSlots] = useState<SlotDisponibilidad[]>([]);
  const [cargandoSlots, setCargandoSlots] = useState(false);

  // 🐛 Estado temporal de diagnóstico — muestra el error real en pantalla,
  // útil para depurar en celular donde no hay acceso fácil a la consola.
  // Quitar una vez confirmemos que todo funciona bien.
  const [errorDebug, setErrorDebug] = useState<string>("");

  // ===============================
  // CARGAR DOCTORES Y SERVICIOS REALES
  // ===============================
  useEffect(() => {
    let activo = true;

    async function cargarCatalogos() {
      setCargandoCatalogos(true);
      setErrorCatalogos(null);

      const [
        { data: doctoresData, error: doctoresError },
        { data: serviciosData, error: serviciosError },
      ] = await Promise.all([
        supabase
          .from("doctores")
          .select("id, nombres, apellidos, especialidad")
          .eq("estado", true)
          .order("nombres", { ascending: true }),
        supabase
          .from("servicios")
          .select("id, nombre")
          .eq("activo", true)
          .order("nombre", { ascending: true }),
      ]);

      if (!activo) return;

      if (doctoresError || serviciosError) {
        setErrorCatalogos(
          "No pudimos cargar los doctores y servicios disponibles. Recarga la página."
        );
        setCargandoCatalogos(false);
        return;
      }

      setDoctores(doctoresData ?? []);
      setServicios(serviciosData ?? []);

      // Preseleccionamos el primero de cada lista, si existe.
      setForm((prev) => ({
        ...prev,
        doctor_id: doctoresData?.[0]?.id ? String(doctoresData[0].id) : "",
        servicio_id: serviciosData?.[0]?.id ? String(serviciosData[0].id) : "",
      }));

      setCargandoCatalogos(false);
    }

    cargarCatalogos();
    return () => {
      activo = false;
    };
  }, []);

  // ===============================
  // DISPONIBILIDAD REAL — se recalcula al cambiar doctor o fecha
  // ===============================
  useEffect(() => {
    if (!form.doctor_id || !form.fecha) {
      setSlots([]);
      return;
    }
    let activo = true;
    setCargandoSlots(true);
    obtenerHorariosDisponibles(Number(form.doctor_id), form.fecha)
      .then((data) => {
        if (activo) setSlots(data);
      })
      .finally(() => {
        if (activo) setCargandoSlots(false);
      });
    return () => {
      activo = false;
    };
  }, [form.doctor_id, form.fecha]);

  // ===============================
  // VALIDAR CÉDULA ECUADOR
  // ===============================

  const validarCedula = (cedula: string) => {
    if (!/^\d{10}$/.test(cedula)) {
      return false;
    }

    const digitos = cedula.split("").map(Number);
    const provincia = Number(cedula.substring(0, 2));

    if (provincia < 1 || provincia > 24) {
      return false;
    }

    const coeficientes = [2, 1, 2, 1, 2, 1, 2, 1, 2];
    let suma = 0;

    for (let i = 0; i < 9; i++) {
      let valor = digitos[i] * coeficientes[i];
      if (valor >= 10) {
        valor -= 9;
      }
      suma += valor;
    }

    const digitoVerificador = suma % 10 === 0 ? 0 : 10 - (suma % 10);

    return digitoVerificador === digitos[9];
  };

  // ===============================
  // ENVIAR FORMULARIO — CONECTADO A SUPABASE
  // ===============================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Limpiamos cualquier error de diagnóstico previo
    setErrorDebug("");

    // VALIDAR CÉDULA
    if (!validarCedula(form.cedula)) {
      alert("❌ La cédula ingresada no es válida");
      return;
    }

    // VALIDAR QUE HAYA UN DOCTOR Y SERVICIO SELECCIONADOS
    if (!form.doctor_id || !form.servicio_id) {
      alert("❌ Selecciona un servicio y un especialista válidos.");
      return;
    }

    // VALIDAR QUE HAYA UNA HORA DISPONIBLE ELEGIDA
    if (!form.hora) {
      alert("❌ Elige un horario disponible antes de continuar.");
      return;
    }

    const correoIngresado = form.email.trim();
    const tieneCorreo = correoIngresado.length > 0;

    try {
      setLoading(true);

      // 1) Busca al paciente por cédula, o lo crea si no existe.
      //    El correo es opcional: pacientes de la tercera edad o sin
      //    acceso a tecnología pueden agendar sin dar un email.
      const { paciente, esNuevo } = await buscarOCrearPaciente({
        nombres: form.nombres,
        apellidos: form.apellidos,
        cedula: form.cedula,
        telefono: form.telefono,
        email: tieneCorreo ? correoIngresado : undefined,
      });

      // 2) Solo enviamos el correo de activación si es paciente nuevo
      //    Y además dio un correo real. Sin correo, no hay a dónde enviarlo.
      if (esNuevo && tieneCorreo) {
        await enviarLinkActivacion(correoIngresado, form.cedula);
      }

      // 3) Creamos la cita, vinculada al paciente (nuevo o existente)
      await crearCita({
        id_paciente: paciente.id,
        id_doctor: Number(form.doctor_id),
        id_servicio: Number(form.servicio_id),
        fecha: form.fecha,
        hora: form.hora,
        observacion: form.observaciones,
      });

      // MENSAJE ÉXITO
      setResultado({ esNuevo, tieneCorreo });
      setSuccess(true);

      // LIMPIAR FORMULARIO (conservamos el doctor/servicio por defecto)
      setForm({
        nombres: "",
        apellidos: "",
        cedula: "",
        telefono: "",
        email: "",
        servicio_id: servicios[0]?.id ? String(servicios[0].id) : "",
        doctor_id: doctores[0]?.id ? String(doctores[0].id) : "",
        fecha: "",
        hora: "",
        observaciones: "",
      });
      setSlots([]);
    } catch (error) {
      console.error(error);
      // 🐛 Mostramos el error real en pantalla (temporal)
      const mensaje =
        error instanceof Error
          ? error.message
          : JSON.stringify(error, null, 2);
      setErrorDebug(mensaje);
      alert("❌ Ocurrió un error al agendar tu consulta. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-100 via-cyan-50 to-sky-100 text-slate-800">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <section className="relative h-[50vh] md:h-[70vh] overflow-hidden">
        <img
          src="/imagenes/Agendas.jpeg"
          alt="Agendar Consulta"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <div className="mb-6 bg-white/10 backdrop-blur-xl border border-white/20 px-6 py-3 rounded-full flex items-center gap-3">
            <Sparkles className="text-cyan-300" size={20} />
            <p className="text-cyan-200 tracking-[4px] font-semibold text-sm md:text-base">
              CONSULTAS · TECNOLOGÍA · DISPONIBILIDAD
            </p>
          </div>

          <h1 className="text-4xl md:text-7xl font-bold text-white mb-6 drop-shadow-2xl">
            Agenda tu Consulta
          </h1>

          <p className="text-white/90 text-lg md:text-2xl max-w-3xl leading-relaxed">
            Reserva tu cita odontológica de forma rápida, moderna y segura con
            nuestro sistema premium.
          </p>
        </div>
      </section>

      {/* FORMULARIO */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid lg:grid-cols-2 gap-14 items-start">
          {/* INFORMACIÓN */}
          <div>
            <p className="text-[#02D3F1] font-semibold tracking-[4px] mb-5">
              ATENCIÓN PERSONALIZADA
            </p>

            <h2 className="text-4xl md:text-6xl font-bold leading-tight text-slate-900 mb-8">
              Reserva tu cita en minutos
            </h2>

            <p className="text-slate-600 text-lg leading-relaxed mb-10">
              Nuestro sistema de agendamiento online permite seleccionar
              servicios, horarios y especialistas disponibles de forma rápida
              y organizada.
            </p>

            {/* BENEFICIOS */}
            <div className="space-y-7">
              <div className="flex items-start gap-4 bg-white/50 backdrop-blur-xl p-5 rounded-3xl border border-white/40 shadow-lg">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center text-white shrink-0 shadow-xl">
                  <CalendarDays size={30} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Disponibilidad en tiempo real
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Consulta horarios disponibles y organiza tu atención
                    fácilmente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/50 backdrop-blur-xl p-5 rounded-3xl border border-white/40 shadow-lg">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center text-white shrink-0 shadow-xl">
                  <ShieldCheck size={30} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Atención segura y privada
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Tus datos y consultas son gestionados de forma segura.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white/50 backdrop-blur-xl p-5 rounded-3xl border border-white/40 shadow-lg">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center text-white shrink-0 shadow-xl">
                  <Stethoscope size={30} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    Especialistas modernos
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Agenda con doctores especializados en cada tratamiento.
                  </p>
                </div>
              </div>

              {/* NUEVO: aviso pensado para pacientes de la tercera edad
                  o sin acceso a tecnología */}
              <div className="flex items-start gap-4 bg-white/50 backdrop-blur-xl p-5 rounded-3xl border border-white/40 shadow-lg">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center text-white shrink-0 shadow-xl">
                  <PhoneCall size={30} />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">
                    ¿No tienes correo electrónico?
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    No hay problema. Puedes agendar tu cita solo con tu
                    cédula y teléfono — te contactaremos directamente.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FORMULARIO PREMIUM */}
          <div className="bg-white/60 backdrop-blur-3xl border border-white/60 rounded-[40px] p-8 md:p-10 shadow-[0_20px_80px_rgba(0,0,0,0.12)]">
            <div className="mb-10">
              <p className="text-[#02D3F1] font-semibold tracking-[4px] mb-4">
                FORMULARIO ONLINE
              </p>
              <h3 className="text-3xl md:text-4xl font-bold text-slate-900">
                Completa tu reserva
              </h3>
            </div>

            {/* ERROR AL CARGAR CATÁLOGOS */}
            {errorCatalogos && (
              <div className="mb-8 bg-amber-50 border border-amber-300 rounded-2xl p-4">
                <p className="text-sm font-semibold text-amber-800">
                  {errorCatalogos}
                </p>
              </div>
            )}

            {/* 🐛 CAJA DE ERROR DE DIAGNÓSTICO (temporal) */}
            {errorDebug && (
              <div className="mb-8 bg-red-50 border border-red-300 rounded-2xl p-4">
                <p className="text-sm font-bold text-red-700 mb-1">
                  🐛 Error de diagnóstico (temporal):
                </p>
                <p className="text-xs text-red-600 break-words whitespace-pre-wrap">
                  {errorDebug}
                </p>
              </div>
            )}

            {/* MENSAJE ÉXITO — ahora con 3 variantes distintas */}
            {success && resultado && (
              <div className="mb-8 bg-emerald-500/10 border border-emerald-400/30 rounded-3xl p-6 flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white shrink-0">
                  <CheckCircle2 size={30} />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-bold text-emerald-700 mb-2">
                    Consulta agendada correctamente
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    Tu reserva fue registrada exitosamente. Nuestro equipo
                    confirmará la cita muy pronto.
                  </p>

                  {/* Caso 1: paciente nuevo CON correo */}
                  {resultado.esNuevo && resultado.tieneCorreo && (
                    <div className="mt-5 pt-5 border-t border-emerald-400/20 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                        <MailIcon size={16} className="text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">
                          🎉 También creamos tu cuenta de paciente
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Te enviamos un correo con un enlace para que
                          actives tu cuenta y accedas a tu receta médica,
                          historial y próximas citas.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Caso 2: paciente nuevo SIN correo (tercera edad / sin tecnología) */}
                  {resultado.esNuevo && !resultado.tieneCorreo && (
                    <div className="mt-5 pt-5 border-t border-emerald-400/20 flex items-start gap-3">
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                        <PhoneCall size={16} className="text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700 mb-1">
                          Te contactaremos por teléfono
                        </p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Como no dejaste un correo, no creamos un portal en
                          línea — pero tu cita y tus datos ya quedaron
                          registrados. Nuestro equipo te llamará al número
                          que nos diste para confirmar tu cita.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Caso 3: paciente ya existente */}
                  {!resultado.esNuevo && (
                    <p className="mt-4 pt-4 border-t border-emerald-400/20 text-xs text-slate-500">
                      Ya tenías una cuenta con nosotros — esta cita se agregó
                      directamente a tu historial.
                    </p>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* NOMBRES */}
              <div>
                <label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                  <UserRound size={18} />
                  Nombres
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ingresa tus nombres"
                  value={form.nombres}
                  onChange={(e) =>
                    setForm({ ...form, nombres: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200 transition-all"
                />
              </div>

              {/* APELLIDOS */}
              <div>
                <label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                  <UserRound size={18} />
                  Apellidos
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ingresa tus apellidos"
                  value={form.apellidos}
                  onChange={(e) =>
                    setForm({ ...form, apellidos: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200 transition-all"
                />
              </div>

              {/* CÉDULA */}
              <div>
                <label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                  <IdCard size={18} />
                  Cédula / DNI
                </label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="Ej: 0912345678"
                  value={form.cedula}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      cedula: e.target.value.replace(/\D/g, ""),
                    })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200 transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Usamos tu cédula para identificarte si ya eres paciente
                  nuestro, o para crear tu cuenta si es tu primera vez. Este
                  dato sí es obligatorio: es la forma en que te identificamos
                  de manera única en la clínica.
                </p>
              </div>

              {/* TELÉFONO */}
              <div>
                <label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                  <Phone size={18} />
                  Teléfono
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0999999999"
                  value={form.telefono}
                  onChange={(e) =>
                    setForm({ ...form, telefono: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200 transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Te contactaremos aquí para confirmar tu cita, sobre todo si
                  no dejas un correo electrónico.
                </p>
              </div>

              {/* EMAIL — ahora OPCIONAL */}
              <div>
                <label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                  <Mail size={18} />
                  Correo Electrónico{" "}
                  <span className="text-slate-400 font-normal text-sm">
                    (opcional)
                  </span>
                </label>
                <input
                  type="email"
                  placeholder="correo@gmail.com — déjalo en blanco si no tienes"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200 transition-all"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Solo lo necesitamos si quieres acceder a tu portal de
                  paciente en línea (recetas, historial y citas). Si no
                  tienes correo o prefieres no darlo, puedes dejarlo vacío
                  — tu cita se agenda igual.
                </p>
              </div>

              {/* SERVICIO — cargado desde Supabase */}
              <div>
                <label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                  <ClipboardList size={18} />
                  Tipo de Servicio
                </label>
                <select
                  required
                  disabled={cargandoCatalogos || servicios.length === 0}
                  value={form.servicio_id}
                  onChange={(e) =>
                    setForm({ ...form, servicio_id: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200 transition-all disabled:opacity-60"
                >
                  {cargandoCatalogos ? (
                    <option value="">Cargando servicios…</option>
                  ) : servicios.length === 0 ? (
                    <option value="">No hay servicios disponibles</option>
                  ) : (
                    servicios.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre}
                      </option>
                    ))
                  )}
                </select>
                <p className="text-xs text-slate-500 mt-2">
                  ¿No sabes qué necesitas? Elige{" "}
                  <span className="font-semibold text-slate-600">
                    Consulta General
                  </span>{" "}
                  y nuestro equipo te orienta.
                </p>
              </div>

              {/* DOCTOR — cargado desde Supabase */}
              <div>
                <label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                  <UserRound size={18} />
                  Especialista
                </label>
                <select
                  required
                  disabled={cargandoCatalogos || doctores.length === 0}
                  value={form.doctor_id}
                  onChange={(e) =>
                    setForm({ ...form, doctor_id: e.target.value, hora: "" })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200 transition-all disabled:opacity-60"
                >
                  {cargandoCatalogos ? (
                    <option value="">Cargando especialistas…</option>
                  ) : doctores.length === 0 ? (
                    <option value="">No hay especialistas disponibles</option>
                  ) : (
                    doctores.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nombres} {d.apellidos}
                        {d.especialidad ? ` · ${d.especialidad}` : ""}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* FECHA */}
              <div>
                <label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                  <CalendarDays size={18} />
                  Fecha
                </label>
                <input
                  type="date"
                  required
                  value={form.fecha}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) =>
                    setForm({ ...form, fecha: e.target.value, hora: "" })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200 transition-all"
                />
              </div>

              {/* HORA — ahora con disponibilidad real, no lista fija */}
              <div>
                <label className="flex items-center gap-2 text-slate-700 font-semibold mb-3">
                  <Clock3 size={18} />
                  Hora Disponible
                </label>

                {!form.doctor_id || !form.fecha ? (
                  <p className="text-sm text-slate-500 bg-white/60 rounded-2xl px-5 py-4 border border-slate-200">
                    Elige especialista y fecha para ver los horarios
                    disponibles ese día.
                  </p>
                ) : cargandoSlots ? (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <div
                        key={i}
                        className="h-12 rounded-xl bg-slate-200/60 animate-pulse"
                      />
                    ))}
                  </div>
                ) : slots.length === 0 ? (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
                    Este especialista no atiende ese día, o ya no quedan
                    horarios disponibles. Prueba con otra fecha.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {slots.map((s) => (
                      <button
                        key={s.hora}
                        type="button"
                        disabled={!s.disponible}
                        onClick={() => setForm({ ...form, hora: s.hora })}
                        className={`py-3 rounded-xl text-sm font-semibold transition-all ${
                          form.hora === s.hora
                            ? "bg-gradient-to-r from-cyan-400 to-sky-500 text-white shadow-lg"
                            : s.disponible
                            ? "bg-white/80 border border-slate-200 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50"
                            : "bg-slate-100 border border-slate-100 text-slate-300 line-through cursor-not-allowed"
                        }`}
                      >
                        {s.hora}
                      </button>
                    ))}
                  </div>
                )}

                <p className="text-xs text-slate-500 mt-2">
                  Estos horarios ya reflejan lo que hay ocupado — si ves una
                  hora disponible aquí, es porque de verdad está libre.
                </p>
              </div>

              {/* OBSERVACIONES */}
              <div>
                <label className="text-slate-700 font-semibold mb-3 block">
                  Motivo de consulta
                </label>
                <textarea
                  rows={5}
                  placeholder="Describe brevemente tu consulta..."
                  value={form.observaciones}
                  onChange={(e) =>
                    setForm({ ...form, observaciones: e.target.value })
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white/80 px-5 py-4 outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-200 transition-all resize-none"
                />
              </div>

              {/* BOTÓN */}
              <button
                type="submit"
                disabled={loading || cargandoCatalogos || !form.hora}
                className="
                  w-full
                  py-5
                  rounded-2xl
                  bg-gradient-to-r
                  from-cyan-400
                  to-sky-500
                  text-white
                  text-lg
                  font-semibold
                  shadow-[0_10px_40px_rgba(0,211,241,0.35)]
                  hover:scale-[1.02]
                  hover:shadow-[0_15px_50px_rgba(0,211,241,0.45)]
                  disabled:opacity-70
                  disabled:cursor-not-allowed
                  disabled:hover:scale-100
                  transition-all
                  duration-300
                "
              >
                {loading
                  ? "Agendando..."
                  : cargandoCatalogos
                  ? "Cargando disponibilidad..."
                  : "Agendar Consulta"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}