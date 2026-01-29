import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  // variable vacia para una respuesta
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });
  // realizar la conexion con Supabase
  // se debe de crear un cliente servidor de supabase
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        // le indicamos a supabase como leer las coockies del navegador
        getAll() {
          return request.cookies.getAll();
        },
        // escribir nuevas coockies de ser necesario
        setAll(cookiesToSet) {
          // guardamos las coockies en la peticion actual "request"
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );

          // actualizamos la repsuesta
          response = NextResponse.next({
            request,
          });
          // guardamos las coockies en la respuesta final para el navegador
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  ); // fin de la creacion del cliente servidor de supabase

  // verificamos los datos del usuario dentro de supabase
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;

  if (path.startsWith("/auth/callback")) {
    return response;
  }

  // validar si tiene perfil de empleado usuario
  let hasProfile = false;

  if (user) {
    const { data } = await supabase
      .from("empleados")
      .select("id")
      .eq("usuario_id", user.id) // nmombre_columna, valor_buscado
      .single();

    hasProfile = !!data;
  }

  // validacion de la ruta raiz
  if (path === "/") {
    const url = request.nextUrl.clone();
    if (!user) {
      url.pathname = "/login";
    } else if (!hasProfile) {
      url.pathname = "/complete-profile";
    } else {
      url.pathname = "/dashboard";
    }
    return NextResponse.redirect(url);
  }

  // si alguien no logueado quiere acceder al dashboard
  if (
    !user &&
    (path.startsWith("/dashboard") || path.startsWith("/complete-profile"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // alguien ya logueado sin perfil
  if (
    user &&
    !hasProfile &&
    (path.startsWith("/dashboard") || path.startsWith("/login"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/complete-profile";
    return NextResponse.redirect(url);
  }

  // alguien ya logueado y con perfil
  if (
    user &&
    hasProfile &&
    (path.startsWith("/login") || path.startsWith("/complete-profile"))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // devolvemos la respuesta final
  return response;
}
