import { redirect } from "next/navigation";

// Ya no necesitamos "use client" ni AuthGuard aquí
// El proxy ya debió haber interceptado esto.
// Esto es solo una red de seguridad.

export default function Home() {
  // Redirección del lado del servidor (instantánea, sin parpadeos)
  redirect("/dashboard");
}
