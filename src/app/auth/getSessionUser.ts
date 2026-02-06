import { createClient } from "@/src/lib/supabase/client";

export async function getSessionUserWithPermissions() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: empleado } = await supabase
    .from("empleados")
    .select(
      `
      id,
      rol:roles (
        id,
        nombre,
        permisos:rol_permisos (
          permiso:permisos (
            slug
          )
        )
      )
    `,
    )
    .eq("usuario_id", user.id)
    .single();

  const rol = Array.isArray(empleado?.rol) ? empleado.rol[0] : empleado?.rol;

  const rawPermisos = rol?.permisos ?? [];

  const permissions = rawPermisos
    .flatMap((p) => p.permiso)
    .map((perm) => perm.slug);

  return {
    user,
    empleado,
    permissions,
  };
}
