import { Metadata } from "next";
import { requirePermission } from "@/src/lib/auth/guard";
import { createClient } from "@/src/lib/supabase/server";
import EmpleadoGrid from "@/src/components/documents/EmployeesGrid";

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
    .eq("estado", "activo")
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error al obtener empleados:", error.message);
    // Podrías mostrar un mensaje de error al usuario aquí si lo deseas
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      {/* Contenedor principal con padding y max-width para centrar */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-12 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white">
              Expedientes Digitales
            </h1>
            <p className="mt-1.5 text-sm md:text-base text-neutral-400">
              Gestión de documentos oficiales por colaborador
            </p>
          </div>

          <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-neutral-900/80 border border-neutral-800 rounded-xl shadow-sm">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-sm font-medium text-neutral-300">
              {empleados?.length || 0} activos
            </span>
          </div>
        </header>

        {/* Aquí va tu componente cliente bonito */}
        <EmpleadoGrid empleados={empleados || []} />
      </div>
    </div>
  );
}