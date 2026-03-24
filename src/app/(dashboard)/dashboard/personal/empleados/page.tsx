import { Metadata } from "next";
import { createClient } from "@/src/lib/supabase/server";
import EmpleadosTable from "@/src/components/employees/EmployeesTable";
import AccessDenied from "@/src/components/shared/AccessDenied";

export const metadata: Metadata = {
  title: "Empleados",
  description: "Resumen general",
};

export const dynamic = "force-dynamic";

export default async function EmpleadosPage() {
  const supabase = await createClient();

  // 1. Validar Permisos y Cargar Datos en PARALELO
  const [permsRes, empleadosRes] = await Promise.all([
    supabase.rpc('get_my_permissions_slugs'),
    supabase.from("empleados")
      .select("id, nombre, apellidos, estado, fecha_ingreso, rol:roles!empleados_rol_id_fkey(nombre), area:areas!empleados_area_id_fkey(nombre)")
      .eq("estado", "activo")
      .order("created_at", { ascending: false })
  ]);

  const permisos = permsRes.data || [];
  const empleadosData = empleadosRes.data || [];
  
  // 2. Le damos pase libre si tiene acceso total, lectura de empleados o actualización
  const tieneAcceso = permisos.includes('acceso_total') || 
                      permisos.includes('empleados.read') || 
                      permisos.includes('empleados.update');

  if (!tieneAcceso) {
    return <AccessDenied message="No tienes permisos para ver el módulo de Empleados." />
  }

  // 3. Formateamos los datos para la tabla
  const empleadosNormalizados = empleadosData.map((emp: any) => ({
    ...emp,
    rol: Array.isArray(emp.rol) ? (emp.rol[0] ?? null) : (emp.rol ?? null),
    area: Array.isArray(emp.area) ? (emp.area[0] ?? null) : (emp.area ?? null),
  }));

  const count = empleadosNormalizados.length;

  return (
    <div className="w-full min-h-screen bg-transparent transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
            Empleados
          </h1>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">
            Resumen general y administración de personal.
          </p>
        </div>

        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800 rounded-xl shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {count} Activos
          </span>
        </div>
      </header>

      {/* Tabla (Se le inyectan los datos) */}
      <EmpleadosTable initialEmpleados={empleadosNormalizados} />
    </div>
  );
}