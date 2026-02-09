import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server"; // Asegúrate de que esta ruta sea correcta
import { ThemeProvider } from "@/src/context/ThemeContext";
import { AuthProvider } from "@/src/context/AuthContext";
import Sidebar from "@/src/components/shared/Sidebar";
import Header from "@/src/components/shared/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Iniciamos Supabase en el servidor
  const supabase = await createClient();

  // 2. Verificamos la sesión del usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si no hay usuario, lo mandamos al login inmediatamente
  if (!user) {
    redirect("/login");
  }

  // 3. Obtenemos los permisos usando la función RPC que creamos en Supabase
  // La función 'get_my_permissions_slugs' debe existir en tu base de datos
  const { data: permissionsData } = await supabase.rpc(
    "get_my_permissions_slugs",
  );

  // Si devuelve null (por error o sin permisos), usamos un array vacío
  const permissions = permissionsData || [];

  return (
    <ThemeProvider>
      {/* 4. Pasamos los permisos iniciales al AuthProvider */}
      <AuthProvider initialPermissions={permissions}>
        <div className="flex h-screen w-full bg-gray-50 dark:bg-[#0f1117] text-gray-900 dark:text-white overflow-hidden transition-colors duration-300">
          <div className="flex-none z-50">
            {/* NOTA: Aquí TypeScript puede quejarte si tu componente Sidebar 
               aún no acepta la prop 'permissions'. 
               Lo arreglaremos en el siguiente paso cuando me pases el Sidebar.
            */}
            {/* @ts-ignore */}
            <Sidebar permissions={permissions} />
          </div>

          <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
            {/* El Header también tiene acceso al contexto si lo necesita */}
            <Header />

            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 p-4 sm:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </AuthProvider>
    </ThemeProvider>
  );
}
