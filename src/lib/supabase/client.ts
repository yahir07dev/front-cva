import { createBrowserClient } from "@supabase/ssr";
import { Database } from "@/types/types_db"; // Importa los tipos generados

export function createClient() {
  // Pasamos <Database> como un tipo genérico a createBrowserClient
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}