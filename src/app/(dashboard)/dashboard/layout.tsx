import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server"; 
import { ThemeProvider } from "@/src/context/ThemeContext";
import { AuthProvider } from "@/src/context/AuthContext";
import Sidebar from "@/src/components/shared/Sidebar";
import Header from "@/src/components/shared/Header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: permissionsData } = await supabase.rpc(
    "get_my_permissions_slugs",
  );

  const permissions = permissionsData || [];

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
            {/* @ts-ignore */}
            <Sidebar permissions={permissions} />
          </div>

          {/* MAIN: flex-1 asegura que tome el resto del ancho, h-full el alto total */}
          <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
            <Header />

            {/* CONTENEDOR DE CONTENIDO: 
                - overflow-hidden: Garantiza que si el contenido es más grande, se corte en lugar de scrollear.
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