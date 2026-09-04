"use client";

import { ReactNode } from "react";
import ProtegerRuta from "@/components/auth/ProtegerRuta";

export default function MedicoLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ProtegerRuta
      rolRequerido="medico"
      rutaLogin="/admin/login"
    >
      {children}
    </ProtegerRuta>
  );
}
