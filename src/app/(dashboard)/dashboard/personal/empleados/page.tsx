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
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Empleados
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Resumen general y administración de personal.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1d29] border border-gray-100 dark:border-[#2d3142] px-4 py-2 rounded-xl shadow-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {count || 0} Activos
          </span>
        </div>
      </header>

      {/* Tabla */}
      <EmpleadosTable />
    </div>
  );
}
