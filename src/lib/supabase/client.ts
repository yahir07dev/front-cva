import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  //Cliente de Supabase en el Navegador con las credenciales del Proyecto
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
