import { Metadata } from "next";
import { requirePermission } from "@/src/lib/auth/guard";
import { createClient } from "@/src/lib/supabase/server";
import EmpleadoGrid from "@/src/components/documents/EmployeesGrid"; // Importa el componente que creamos arriba

export const metadata: Metadata = {
  title: "Documentos",
  description: "Expedientes digitales de colaboradores",
};

export default async function DocumentosPage() {
  await requirePermission("documentos.update");

  const supabase = await createClient();
  const { data: empleados, error } = await supabase
    .from("empleados")
    .select("id, nombre, apellidos, foto_perfil_url")
    .eq("estado", "activo") // Mantenemos el filtro de activos
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error al obtener empleados:", error.message);
  }

  return (
    <div className="w-full min-h-screen bg-transparent transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
            Expedientes Digitales
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Gestión de documentos oficiales por colaborador.
          </p>
        </div>

        <div className="bg-white dark:bg-[#1a1d29] border border-gray-100 dark:border-[#2d3142] px-4 py-2 rounded-xl shadow-sm flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
            {empleados?.length || 0} Activos
          </span>
        </div>
      </header>

      {/* Renderizamos el componente cliente con la data del servidor */}
      <EmpleadoGrid empleados={empleados || []} />
    </div>
  );
}
