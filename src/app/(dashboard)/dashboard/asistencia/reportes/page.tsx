import { Metadata } from "next";
import { createClient } from "@/src/lib/supabase/server";
import AccessDenied from "@/src/components/shared/AccessDenied";
import ReportesClient from "@/src/components/asistencia/ReportesClient";
import { getEmpleadosAsistenciaAction } from "@/src/actions/asistencia/reportesActions";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Reportes de Asistencia",
  description: "Control de puntualidad y asistencia.",
};

export const dynamic = "force-dynamic";

export default async function ReportesAsistenciaPage() {
  const supabase = await createClient();

  // 1. Verificación de Sesión
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // 2. Fetch en Paralelo (Permisos + Empleados para el Combobox)
  const [permsRes, empleadosData] = await Promise.all([
    supabase.rpc('get_my_permissions_slugs'),
    getEmpleadosAsistenciaAction()
  ]);

  // 3. Validar Permisos (Ajusta el slug según tus reglas, aquí asumo asistencia.read o acceso_total)
  const permisos = permsRes.data || [];
  const tieneAcceso = permisos.includes('acceso_total') || permisos.includes('asistencia.read');

  if (!tieneAcceso) {
    return <AccessDenied message="No tienes permisos para ver los reportes de asistencia." />;
  }

  // 4. Renderizar Cliente (Cero Cascadas)
  return (
    <div className="h-[100dvh] md:h-full flex flex-col p-0 pb-20 md:p-6 lg:p-8 overflow-hidden animate-in fade-in duration-500">
        <ReportesClient initialEmpleados={empleadosData} />
      </div>
  );
}