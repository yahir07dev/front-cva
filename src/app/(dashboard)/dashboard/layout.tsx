import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server"; 
import { ThemeProvider } from "@/src/context/ThemeContext";
import { AuthProvider } from "@/src/context/AuthContext";

// 🚀 IMPORTAMOS EL SIDEBAR CLIENTE (El que optimizamos sin el useEffect)
import SidebarClient from "@/src/components/sidebar/SidebarClient";
import Header from "@/src/components/shared/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  // 1. Verificación de usuario (Bloqueante, debe ir primero)
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 2. FETCH EN PARALELO: Permisos y Perfil del Empleado (Destruyendo la cascada)
  const [permissionsRes, empRes] = await Promise.all([
    supabase.rpc("get_my_permissions_slugs"),
    supabase.from("empleados").select("id").eq("usuario_id", user.id).single()
  ]);

  const permissions = permissionsRes.data || [];
  
  // 3. Lógica calculada en el Servidor para el Sidebar
  const canManageCourses = 
    permissions.includes("acceso_total") || 
    permissions.includes("cursos.create") || 
    permissions.includes("cursos.update");

  let hasAssignedCourses = false;

  // Si el usuario no es admin de cursos, verificamos rápidamente si tiene cursos pendientes
  // Esto evita que el Sidebar muestre la pestaña de "Capacitación" vacía.
  if (empRes.data && !canManageCourses) {
    const { count } = await supabase
      .from("asignacion_cursos")
      .select("*", { count: "exact", head: true })
      .eq("empleado_id", empRes.data.id)
      .neq("estado", "completado"); // Solo contamos los cursos que aún no termina
      
    hasAssignedCourses = (count ?? 0) > 0;
  }

  return (
    <ThemeProvider>
      <AuthProvider initialPermissions={permissions}>
        {/* H-SCREEN + OVERFLOW-HIDDEN: Bloquea el scroll en el body/contenedor raíz */}
        <div 
          className="
            flex h-screen w-full 
            bg-neutral-50 dark:bg-neutral-950 
            text-neutral-900 dark:text-neutral-100 
            overflow-hidden transition-colors duration-300
          "
        >
          <div className="flex-none z-50">
            {/* 👇 El Sidebar ahora es puramente visual y renderiza instantáneamente */}
            <SidebarClient 
              permissions={permissions} 
              hasAssignedCourses={hasAssignedCourses}
            />
          </div>

          {/* MAIN: flex-1 asegura que tome el resto del ancho, h-full el alto total */}
          <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
            <Header />

            {/* CONTENEDOR DE CONTENIDO: 
                - overflow-hidden: Garantiza que si el contenido es más grande, se corte.
                - flex-1: Se expande para llenar el espacio vertical restante.
            */}
            <div 
              className="
                flex-1 p-4 sm:p-6 lg:p-8
                overflow-hidden 
                min-h-0
              "
            >
              {children}
            </div>
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}