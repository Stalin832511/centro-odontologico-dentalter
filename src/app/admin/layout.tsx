"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import ProtegerRuta from "@/components/auth/ProtegerRuta";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();

  /*
   * El login está dentro de /admin.
   *
   * Por eso NO debemos proteger /admin/login,
   * de lo contrario se produciría un ciclo de redirección.
   */
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <ProtegerRuta
      rolRequerido="administrador"
      rutaLogin="/admin/login"
    >
      {children}
    </ProtegerRuta>
  );
}