"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const hasRun = useRef(false); // evita doble ejecución en dev

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const checkAuth = async () => {
      // 1️⃣ Verificar sesión
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setIsLoading(false);
        router.replace("/login");
        return;
      }

      // 2️⃣ Verificar perfil
      const { data: empleado } = await supabase
        .from("empleados")
        .select("id")
        .eq("usuario_id", session.user.id)
        .single();

      const isOnCompleteProfile = pathname === "/complete-profile";

      if (!empleado && !isOnCompleteProfile) {
        setIsLoading(false);
        router.replace("/complete-profile");
        return;
      }

      if (empleado && isOnCompleteProfile) {
        setIsLoading(false);
        router.replace("/");
        return;
      }

      // ✅ Todo OK
      setIsLoading(false);
    };

    checkAuth();
  }, [router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return <>{children}</>;
}
