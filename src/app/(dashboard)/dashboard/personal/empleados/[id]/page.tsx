import { Metadata } from "next";
import { createClient } from "@/src/lib/supabase/server";
import EditEmpleadoPage from "@/src/components/employees/EditEmployees";
import AccessDenied from "@/src/components/shared/AccessDenied";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Editar empleado",
  description: "Información del empleado",
};

export const dynamic = "force-dynamic";

export default async function FormEmpleadosPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  
  // 1. Resolvemos el ID
  const { id } = await params;

  // 2. Validar Permisos
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs');
  const permisos = perms || [];
  const tieneAcceso = permisos.includes('acceso_total') || permisos.includes('empleados.update');

  if (!tieneAcceso) {
    return <AccessDenied message="No tienes permisos para editar la información de los empleados." />;
  }

  // 3. Cargar Todo en Paralelo
  const [empleadoRes, rolesRes, areasRes] = await Promise.all([
    supabase
      .from("empleados")
      .select("id, nombre, apellidos, estado, fecha_ingreso, rol_id, area_id, sueldo_base, fecha_baja")
      .eq("id", id)
      .single(),
    supabase.from("roles").select("id, nombre").order("nombre"),
    supabase.from("areas").select("id, nombre").order("nombre"),
  ]);

  // 4. Si la consulta falla (ID no existe), redireccionamos
  if (empleadoRes.error || !empleadoRes.data) {
    redirect('/dashboard/personal/empleados');
  }

  return (
    <EditEmpleadoPage 
      empleadoId={id}
      initialData={empleadoRes.data}
      rolesList={rolesRes.data || []}
      areasList={areasRes.data || []}
    />
  );
}