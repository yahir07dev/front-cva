//src/app/(dashboard)/dashboard/documentos/empleados/page.tsx
import { Metadata } from "next";
import { createClient } from "@/src/lib/supabase/server";
import EmpleadoGrid from "@/src/components/documents/EmployeesGrid";
import AccessDenied from "@/src/components/shared/AccessDenied";

export const metadata: Metadata = {
  title: "Documentos",
  description: "Expedientes digitales de colaboradores",
};

export default async function DocumentosPage() {
  const supabase = await createClient();

  // 1. Validar Permisos explícitamente desde la base de datos
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs');
  const permisos = perms || [];

  // 2. Verificamos si tiene "acceso_total" (Superadmin) o el permiso específico
  const tieneAcceso = permisos.includes('acceso_total') || permisos.includes('documentos.update');

  // 3. Si no tiene ninguno de los dos, mostramos la pantalla de bloqueo
  if (!tieneAcceso) {
    return <AccessDenied message="No tienes permisos para ver o gestionar los expedientes digitales." />;
  }

  // 4. Si pasa la seguridad, cargamos los datos
  const { data: empleados, error } = await supabase
    .from("empleados")
    .select("id, nombre, apellidos, foto_perfil_url")
    .eq("estado", "activo")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error al obtener empleados:", error.message);
  }

  return (
    <div className="h-full flex flex-col min-h-0 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500">
      
      <div className="h-full flex flex-col min-h-0 w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
        
        <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              Expedientes Digitales
            </h1>
            <p className="mt-1.5 text-sm md:text-base text-neutral-500 dark:text-neutral-400">
              Gestión de documentos oficiales por colaborador
            </p>
          </div>

          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800 rounded-xl shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {empleados?.length || 0} activos
            </span>
          </div>
        </header>

        <EmpleadoGrid empleados={empleados || []} />
      </div>
    </div>
  );
}