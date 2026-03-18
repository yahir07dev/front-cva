import { Metadata } from "next";
import { createClient } from "@/src/lib/supabase/server";
import EditEmpleadoPage from "@/src/components/employees/EditEmployees";
import AccessDenied from "@/src/components/shared/AccessDenied";

export const metadata: Metadata = {
  title: "Editar empleados",
  description: "Informacion del empleado",
};

export default async function FormEmpleadosPage() {
  const supabase = await createClient();

  // 1. Validar Permisos explícitamente desde la base de datos
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs');
  const permisos = perms || [];

  // 2. Verificamos si tiene "acceso_total" (Superadmin) o el permiso específico de editar
  const tieneAcceso = permisos.includes('acceso_total') || permisos.includes('empleados.update');

  // 3. Si no tiene ninguno de los dos, le mostramos la pantalla de bloqueo
  if (!tieneAcceso) {
    return <AccessDenied message="No tienes permisos para editar la información de los empleados." />;
  }

  // 4. Si pasa la seguridad, renderizamos el formulario
  return <EditEmpleadoPage />;
}