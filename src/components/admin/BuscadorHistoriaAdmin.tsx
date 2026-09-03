"use client";

// ============================================================
// BuscadorHistoriaAdmin
// Caja de búsqueda por código de historia clínica para el panel
// ADMIN. A diferencia de la versión del médico (que va directo
// al expediente de un paciente), esta redirige a la página
// "Historias Clínicas" con ?codigo=HC-..., y esa página se
// encarga de encontrarla y abrirla automáticamente.
// ============================================================

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function BuscadorHistoriaAdmin() {
  const router = useRouter();
  const [codigo, setCodigo] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!codigo.trim()) return;
    router.push(`/admin/historias?codigo=${encodeURIComponent(codigo.trim())}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="text"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        placeholder="Buscar por N° de historia (HC-...)"
        className="pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm w-56 sm:w-72 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400"
      />
    </form>
  );
}