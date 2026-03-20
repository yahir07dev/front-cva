import { redirect } from "next/navigation";
import { createClient } from "@/src/lib/supabase/server";

export async function requirePermission(requiredPermission: string | string[]) {
  const supabase = await createClient();

  // 1. Obtenemos los permisos del usuario (Igual que en el Layout)
  // Al ser una función RPC ligera, la llamada es muy rápida.
  const { data: permissionsData } = await supabase.rpc(
    "get_my_permissions_slugs",
  );
  const userPermissions: string[] = permissionsData || [];

  // 2. Normalizamos lo que requerimos a un array
  const required = Array.isArray(requiredPermission)
    ? requiredPermission
    : [requiredPermission];

  // 3. Verificamos si tiene AL MENOS UNO de los permisos requeridos
  const hasAccess = required.some((p) => userPermissions.includes(p));

  // 4. Si NO tiene acceso, lo sacamos de ahí inmediatamente
  if (!hasAccess) {
    // Puedes redirigir al dashboard general o a una página de 403
    redirect("/dashboard");
  }

  // Si pasa, la función termina y deja que la página continúe.
}
