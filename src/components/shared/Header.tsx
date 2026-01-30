"use client";

import { useEffect, useState } from "react";
import { useTheme } from "@/src/context/ThemeContext";
import { createClient } from "@/src/lib/supabase/client"; // Usamos el cliente (no server)

export default function Header() {
  const { theme } = useTheme();
  const supabase = createClient();

  // Estado local para los datos
  const [empleado, setEmpleado] = useState<any>(null);
  const [rolNombre, setRolNombre] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // 1. Quién está logueado?
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // 2. Buscar datos del empleado
          const { data, error } = await supabase
            .from("empleados")
            .select("nombre, apellidos, roles(nombre)")
            .eq("usuario_id", user.id)
            .single();

          if (data) {
            setEmpleado({ ...data, email: user.email }); // Combinamos con el email

            // Extraer nombre del rol de forma segura
            const rolData = data.roles as any;
            const nombreRol = Array.isArray(rolData)
              ? rolData[0]?.nombre
              : rolData?.nombre;
            setRolNombre(nombreRol || "Sin Rol");
          }
        }
      } catch (error) {
        console.error("Error cargando header:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header
      className={`
      h-[72px] shrink-0 flex items-center mx-4 mt-4 mb-2
      rounded-xl z-40 transition-all duration-300
      pl-16 md:pl-6
      ${
        theme === "dark"
          ? "bg-[#1a1d29] shadow-lg shadow-gray-950/50"
          : "bg-white shadow-lg shadow-gray-200/50"
      }
    `}
    >
      <div className="w-full flex items-center justify-between px-6">
        {/* BUSCADOR */}
        <div className="flex-1 flex justify-center md:justify-start">
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Buscar..."
              className={`
                w-full h-10 pl-4 pr-4 rounded-lg text-sm transition-colors
                ${
                  theme === "dark"
                    ? "bg-gray-950/50 text-white placeholder:text-gray-500 border border-gray-800 focus:border-gray-700"
                    : "bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:border-gray-300"
                }
                focus:outline-none
              `}
            />
          </div>
        </div>

        {/* PERFIL */}
        <div className="flex items-center gap-3 ml-6">
          <div
            className={`w-px h-8 hidden sm:block ${theme === "dark" ? "bg-gray-800" : "bg-gray-200"}`}
          ></div>

          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className={`
              w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 
              flex items-center justify-center text-white font-semibold text-sm shadow-md shrink-0
              ${loading ? "animate-pulse" : ""}
            `}
            >
              {loading ? "" : getInitials(empleado?.nombre || "U")}
            </div>

            {/* Texto */}
            <div className="hidden md:block text-right">
              {loading ? (
                // Skeleton loader mientras carga
                <div className="flex flex-col items-end gap-1">
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-2 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <p
                    className={`text-sm font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"}`}
                  >
                    {empleado?.nombre || "Usuario"}
                  </p>
                  <p
                    className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}
                  >
                    {rolNombre || empleado?.email || "Cargando..."}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
