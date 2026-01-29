import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  // 1. Configuración inicial de respuesta y Supabase
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  // 2. Obtener usuario
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  // 3. Validar perfil (Solo si hay usuario)
  let hasProfile = false;
  if (user) {
    const { data } = await supabase
      .from("empleados")
      .select("id")
      .eq("usuario_id", user.id)
      .single();
    hasProfile = !!data;
  }

  // --- REGLAS DE REDIRECCIÓN (Lógica Corregida) ---

  // A. Si NO está logueado y quiere entrar a Dashboard o Completar Perfil -> Login
  if (!user && (path.startsWith("/dashboard") || path.startsWith("/complete-profile"))) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // B. Si ESTÁ logueado
  if (user) {
    // Caso 1: NO tiene perfil
    if (!hasProfile) {
      // Si no tiene perfil y NO está en /complete-profile, mandarlo ahí
      if (!path.startsWith("/complete-profile")) {
        return NextResponse.redirect(new URL("/complete-profile", request.url));
      }
      // Si ya está en /complete-profile, dejarlo pasar (evita el bucle)
      return response; 
    }

    // Caso 2: SÍ tiene perfil
    if (hasProfile) {
      // Si intenta ir a Login, Raíz o Completar Perfil -> Dashboard
      if (path === "/" || path.startsWith("/login") || path.startsWith("/complete-profile")) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  // C. Manejo de la raíz "/" para no logueados
  if (path === "/" && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}