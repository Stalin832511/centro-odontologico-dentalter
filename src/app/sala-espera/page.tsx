"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Expand,
  HeartPulse,
  LoaderCircle,
  MapPin,
  Radio,
  RefreshCw,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import PublicidadSala from "@/components/sala-espera/PublicidadSala";

interface Turno {
  id: number;
  hora: string;
  estado: string;
  paciente: string;
}

const ESTADOS_OCULTOS = new Set(["CANCELADA", "CANCELADO", "ATENDIDA", "ATENDIDO"]);

function fechaLocal() {
  const ahora = new Date();
  const offset = ahora.getTimezoneOffset() * 60000;
  return new Date(ahora.getTime() - offset).toISOString().slice(0, 10);
}

function minutos(hora: string) {
  const [horas, minutosHora] = hora.split(":").map(Number);
  return horas * 60 + minutosHora;
}

function formatearHora(hora: string) {
  const [horas, minutosHora] = hora.split(":").map(Number);
  const periodo = horas >= 12 ? "PM" : "AM";
  return `${horas % 12 || 12}:${String(minutosHora).padStart(2, "0")} ${periodo}`;
}

function nombreVisible(nombre: string) {
  const partes = nombre.trim().split(/\s+/);
  return partes.length > 1 ? `${partes[0]} ${partes[1].charAt(0)}.` : partes[0];
}

export default function SalaEsperaPage() {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizado, setActualizado] = useState(new Date());
  const [hora, setHora] = useState(new Date());

  const cargarTurnos = useCallback(async () => {
    const { data, error } = await supabase
      .from("citas")
      .select("id, hora, estado, pacientes ( nombres, apellidos )")
      .eq("fecha", fechaLocal())
      .order("hora", { ascending: true });

    if (error) {
      console.error("No se pudieron cargar los turnos de sala de espera:", error);
      setTurnos([]);
    } else {
      setTurnos(
        (data ?? []).map((cita) => {
          const paciente = Array.isArray(cita.pacientes) ? cita.pacientes[0] : cita.pacientes;
          return {
            id: cita.id,
            hora: cita.hora,
            estado: String(cita.estado ?? "").toUpperCase(),
            paciente: paciente ? `${paciente.nombres} ${paciente.apellidos}` : "Paciente",
          };
        }),
      );
    }
    setActualizado(new Date());
    setCargando(false);
  }, []);

  useEffect(() => {
    cargarTurnos();
    const intervalo = window.setInterval(cargarTurnos, 20000);
    const reloj = window.setInterval(() => setHora(new Date()), 1000);
    return () => {
      window.clearInterval(intervalo);
      window.clearInterval(reloj);
    };
  }, [cargarTurnos]);

  const visibles = useMemo(() => turnos.filter((turno) => !ESTADOS_OCULTOS.has(turno.estado)), [turnos]);
  const turnoActual = useMemo(() => {
    const ahora = hora.getHours() * 60 + hora.getMinutes();
    return visibles.find((turno) => turno.estado === "EN_ESPERA" || turno.estado === "LLAMANDO") ??
      visibles.find((turno) => minutos(turno.hora) <= ahora) ??
      visibles[0];
  }, [hora, visibles]);

  const fechaTexto = hora.toLocaleDateString("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const turnoActualIndex = turnoActual ? visibles.findIndex((turno) => turno.id === turnoActual.id) : -1;

  async function pantallaCompleta() {
    if (!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f7f9] text-[#122033]">
      <header className="flex items-center justify-between px-6 py-5 sm:px-10">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#10243c] text-[#84e4d5] shadow-lg shadow-slate-300/30">
            <HeartPulse size={21} />
          </div>
          <div>
            <p className="text-lg font-black tracking-tight">Dental<span className="text-[#27b9ab]">TER</span></p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Clínica odontológica</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-2xl font-semibold tracking-tight text-[#10243c]">{hora.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</p>
            <p className="text-[11px] capitalize text-slate-500">{fechaTexto}</p>
          </div>
          <button type="button" onClick={pantallaCompleta} aria-label="Activar pantalla completa" className="rounded-xl border border-slate-200 bg-white p-3 text-slate-500 shadow-sm transition hover:border-teal-200 hover:text-teal-600">
            <Expand size={18} />
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1800px] gap-5 px-5 pb-6 sm:px-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(380px,.9fr)]">
        <section className="relative overflow-hidden rounded-[30px] bg-[#10243c] p-7 text-white shadow-[0_24px_70px_-30px_rgba(16,36,60,.6)] sm:p-10">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-[#42cbbc]/10 blur-3xl" />
          <div className="relative z-10 flex h-full min-h-[530px] flex-col">
            <div className="flex items-center justify-between">
              <div>
                <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#83e5d6]">
                  <Radio size={15} className="animate-pulse" /> Sala de espera
                </p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">Estamos atendiendo</h1>
              </div>
              <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-300">
                <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-[#6ee2d3] shadow-[0_0_10px_#6ee2d3]" />
                En vivo
              </div>
            </div>

            {cargando ? (
              <div className="flex flex-1 items-center justify-center"><LoaderCircle className="animate-spin text-[#83e5d6]" size={38} /></div>
            ) : turnoActual ? (
              <div className="flex flex-1 flex-col justify-center py-8">
                <p className="text-sm text-slate-400">Siguiente turno</p>
                <div className="mt-3 flex items-end gap-4">
                  <span className="turno-pulse text-[clamp(5rem,14vw,10rem)] font-black leading-none tracking-[-0.08em] text-[#83e5d6]">
                    A-{String(turnoActualIndex + 1).padStart(2, "0")}
                  </span>
                  <span className="mb-3 rounded-full bg-[#83e5d6]/10 px-3 py-1 text-xs font-semibold text-[#a9eee5]">
                    {turnoActual.estado === "LLAMANDO" ? "Pasar a consultorio" : "Preparándose"}
                  </span>
                </div>
                <p className="mt-4 text-xl font-medium text-white sm:text-2xl">{nombreVisible(turnoActual.paciente)}</p>
                <p className="mt-1 flex items-center gap-2 text-sm text-slate-400"><Clock3 size={15} /> Cita de las {formatearHora(turnoActual.hora)}</p>
              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <CheckCircle2 size={46} className="text-[#83e5d6]" />
                <p className="mt-5 text-2xl font-semibold">Agenda al día</p>
                <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-400">En este momento no hay turnos pendientes. Pronto te atenderemos.</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-xs text-slate-400">
              <span className="flex items-center gap-2"><ShieldCheck size={15} className="text-[#83e5d6]" /> Tu privacidad es importante</span>
              <span className="flex items-center gap-2"><RefreshCw size={13} /> Actualizado {actualizado.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}</span>
            </div>
          </div>
        </section>

        <PublicidadSala />

        <section className="rounded-[30px] border border-slate-200/80 bg-white p-6 shadow-[0_18px_60px_-35px_rgba(16,36,60,.4)] sm:p-8 lg:col-span-2">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#27b9ab]">Agenda de hoy</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-[#10243c]">Turnos en espera</h2>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><UsersRound size={15} /> {visibles.length} turnos</span>
              <span className="hidden items-center gap-1.5 sm:flex"><MapPin size={15} /> Sede principal</span>
            </div>
          </div>
          {visibles.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {visibles.slice(0, 8).map((turno, index) => (
                <div key={turno.id} className={`flex items-center justify-between rounded-2xl border p-4 transition ${turno.id === turnoActual?.id ? "border-[#8ee9df] bg-[#effcf9] shadow-sm" : "border-slate-100 bg-slate-50/70"}`}>
                  <div className="flex items-center gap-3">
                    <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-xs font-black ${turno.id === turnoActual?.id ? "bg-[#10243c] text-[#83e5d6]" : "bg-white text-slate-500"}`}>A-{String(index + 1).padStart(2, "0")}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">{nombreVisible(turno.paciente)}</p>
                      <p className="mt-0.5 text-xs text-slate-400">{formatearHora(turno.hora)}</p>
                    </div>
                  </div>
                  {turno.id === turnoActual?.id && <span className="h-2 w-2 rounded-full bg-[#27b9ab] shadow-[0_0_0_4px_#d7f8f3]" />}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-slate-50 py-8 text-center text-sm text-slate-500">No hay turnos pendientes para mostrar.</div>
          )}
          <p className="mt-5 flex items-center gap-2 text-[11px] leading-relaxed text-slate-400"><CalendarDays size={14} /> Los turnos se actualizan automáticamente. Por favor permanece atento a la pantalla.</p>
        </section>
      </div>
    </main>
  );
}
