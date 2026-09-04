import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Clínica DentalTER",
  description: "Sistema odontológico moderno",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="antialiased">
      <body className="min-h-screen bg-white text-black">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}