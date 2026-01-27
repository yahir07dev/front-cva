"use client"; // indica que este archivo es un componente del lado del cliente
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { Session } from "@supabase/supabase-js";
export function useSession() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      // funcion asincrona para checar la sesion
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        // si no hay una session, debe de dirigir al login
        router.push("/login");
      } else {
        setSession(data.session); // si hay una sesion lo guarda en el estado de la sesion
      }
      setLoading(false); // ya no esta cargando
    };
    checkSession(); // llamamos la funcion para checar la sesion
  }, [router]); // el efecto se vuelve a ejecutar si el router cambia, es decir que la ruta cambia

  return { session, loading }; // devuelve la sesion y si esta cargando o no
}
