"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import Image from "next/image";
import NotificacionesDropdown from "@/src/components/layout/NotificacionesDropdown";

export default function Header() {
  const supabase = createClient();
  const [empleado, setEmpleado] = useState<any>(null);
  const [rolNombre, setRolNombre] = useState<string>("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // 1. Obtenemos datos del empleado, incluyendo su foto guardada en BD
          const { data } = await supabase
            .from("empleados")
            .select("nombre, apellidos, foto_perfil_url, roles(nombre)")
            .eq("usuario_id", user.id)
            .single();

          let finalAvatar = null;

          if (data) {
            setEmpleado({ ...data, email: user.email });
            
            // Lógica de roles
            const rolData = data.roles as any;
            const nombreRol = Array.isArray(rolData)
              ? rolData[0]?.nombre
              : rolData?.nombre;
            setRolNombre(nombreRol || "Sin Rol");

            // PRIORIDAD 1: Foto subida manualmente a la BD
            if (data.foto_perfil_url && data.foto_perfil_url.trim() !== "") {
              finalAvatar = data.foto_perfil_url;
            }
          }

          // PRIORIDAD 2: Si no hay foto en BD, buscamos la de Google
          if (!finalAvatar) {
            const googleAvatar = user.user_metadata?.avatar_url;
            if (googleAvatar) {
              finalAvatar = googleAvatar;
            }
          }

          setAvatarUrl(finalAvatar);
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
      className="
        h-[76px] shrink-0 flex items-center z-40 transition-all duration-300
        pl-16 md:pl-6
        mx-4 mt-0 mb-4             
        rounded-b-2xl
        bg-white dark:bg-neutral-950
        border-b-2 border-neutral-200/80 dark:border-0
        border-x border-neutral-200/40 dark:border-0
        shadow-[0_6px_16px_-6px_rgba(0,0,0,0.10)] dark:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.45)]
      "
    >
      <div className="w-full flex items-center justify-between px-6 md:px-8">
        <div className="flex-1 flex justify-center md:justify-start">
          <div className="relative max-w-md w-full"></div>
        </div>

        {/* SECCIÓN PERFIL Y NOTIFICACIONES */}
        <div className="flex items-center gap-2 sm:gap-4">
          
          {/* CAMPANITA DE NOTIFICACIONES */}
          {!loading && <NotificacionesDropdown variant="header" />}

          {/* Divisor */}
          <div className="w-px h-8 bg-neutral-200 dark:bg-neutral-800 mx-1 hidden sm:block" />

          {/* AVATAR E INFO */}
          <div className="flex items-center gap-3 ml-1 sm:ml-0">
            {/* Avatar Inteligente */}
            <div
              className={`
                relative w-10 h-10 rounded-full 
                overflow-hidden shadow-md
                ${!avatarUrl ? "bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center text-white font-semibold text-base" : ""}
                ${loading ? "animate-pulse bg-neutral-200 dark:bg-neutral-800" : ""}
              `}
            >
              {loading ? (
                "" 
              ) : avatarUrl ? (
                <Image 
                  src={avatarUrl} 
                  alt="Perfil" 
                  fill 
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                getInitials(empleado?.nombre || "U")
              )}
            </div>

            {/* Texto de Usuario */}
            <div className="hidden md:block text-right">
              {loading ? (
                <div className="flex flex-col items-start gap-1.5 ml-1">
                  <div className="h-3.5 w-24 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
                  <div className="h-2.5 w-16 bg-neutral-200 dark:bg-neutral-800 rounded animate-pulse"></div>
                </div>
              ) : (
                <div className="text-left ml-1">
                  <p className="text-sm font-bold text-neutral-900 dark:text-neutral-100 leading-tight">
                    {empleado?.nombre || "Usuario"}
                  </p>
                  <p className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400">
                    {rolNombre || empleado?.email || "Cargando..."}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}