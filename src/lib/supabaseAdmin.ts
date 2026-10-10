// ============================================================
// CLIENTE SUPABASE CON SERVICE ROLE
// ⚠️ SOLO importar desde archivos de servidor (app/api/**/route.ts).
// Nunca importar esto en un componente "use client" — la
// service_role key se saltaría todas tus políticas RLS si
// terminara expuesta al navegador.
// ============================================================

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!serviceRoleKey) {
  throw new Error(
    "Falta la variable de entorno SUPABASE_SERVICE_ROLE_KEY (agrégala en .env.local y en Vercel, como variable SOLO de servidor, sin prefijo NEXT_PUBLIC_)."
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});