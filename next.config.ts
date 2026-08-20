import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // Permite que el servidor de desarrollo acepte conexiones (incluido el
  // websocket de Hot Reload) desde otros dispositivos de tu red local,
  // como el celular o la tablet, cuando accedes por la IP en vez de localhost.
  // Sin esto, el HMR falla en esos dispositivos y termina forzando recargas
  // completas de la página que borran cualquier formulario a medio llenar.
  allowedDevOrigins: ["192.168.100.104"],
};

export default nextConfig;
