// import { createClient } from "@supabase/supabase-js";

// const supabaseURL = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// // crea el cliente de supabase y lo exporta
// export const supabase = createClient(supabaseURL!, supabaseAnonKey!);
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);
