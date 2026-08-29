import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl) {
  throw new Error(
    "Falta NEXT_PUBLIC_SUPABASE_URL en tu .env.local. Revisa que el archivo exista y que hayas reiniciado 'npm run dev' después de editarlo."
  );
}

if (!supabasePublishableKey) {
  throw new Error(
    "Falta NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY en tu .env.local. Revisa que el archivo exista y que hayas reiniciado 'npm run dev' después de editarlo."
  );
}

// Validación de formato: ayuda a detectar de inmediato si por error se
// pegó la Secret Key (nunca debe usarse en el frontend) en vez de la
// Publishable Key.
if (supabasePublishableKey.startsWith("sb_secret_")) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY tiene una Secret Key, no una Publishable Key. " +
    "Nunca uses la Secret Key en el frontend — ve a Supabase → Settings → API y copia la 'Publishable key' (empieza con sb_publishable_)."
  );
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey);