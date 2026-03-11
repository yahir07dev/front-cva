import { Metadata } from "next";
import { requirePermission } from "@/src/lib/auth/guard";
import { createClient } from "@/src/lib/supabase/server";
import EmpleadosTable from "@/src/components/employees/EmployeesTable";

export const metadata: Metadata = {
  title: "Empleados",
  description: "Resumen general",
};

export default async function EmpleadosPage() {
  await requirePermission("empleados.update");

  // Obtenemos solo el conteo para el indicador del header
  const supabase = await createClient();
  const { count } = await supabase
    .from("empleados")
    .select("*", { count: "exact", head: true })
    .eq("estado", "activo");

  return (
    <div className="w-full min-h-screen bg-transparent transition-colors duration-300">
      {/* Header de la sección */}
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
            Empleados
          </h1>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">
            Resumen general y administración de personal.
          </p>
        </div>

        {/* ETIQUETA CORREGIDA: Cambia de fondo y borde según el tema */}
        <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-white/70 dark:bg-neutral-900/80 backdrop-blur-xl border border-neutral-200/80 dark:border-neutral-800 rounded-xl shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            {count || 0} Activos
          </span>
        </div>
      </header>

      {/* Tabla */}
      <EmpleadosTable />
    </div>
  );
}