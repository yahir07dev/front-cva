import { createClient } from "@/src/lib/supabase/server";
import SidebarClient from "./SidebarClient";

export default async function SidebarServer() {
  const supabase = await createClient();
  
  // 1. Obtener el usuario actual
  const { data: { user } } = await supabase.auth.getUser();

  let permisos: string[] = [];

  if (user) {
    // 2. Solo traemos los permisos, ya no necesitamos consultar la tabla de cursos
    const { data } = await supabase.rpc('get_my_permissions_slugs');
    permisos = data || [];
  }

  // 3. Renderizamos el cliente pasando solo los permisos
  return (
    <SidebarClient permissions={permisos} />
  );
}