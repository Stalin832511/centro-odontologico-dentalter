"use client";

import { ReactNode } from "react";
import ProtegerRuta from "@/components/auth/ProtegerRuta";

export default function PacienteLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtegerRuta
      rolRequerido="paciente"
      rutaLogin="/admin/login"
    >
      {children}
    </ProtegerRuta>
  );
}