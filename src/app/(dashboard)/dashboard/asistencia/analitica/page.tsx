import { Metadata } from "next";
import { createClient } from "@/src/lib/supabase/server";
import AccessDenied from "@/src/components/shared/AccessDenied";
import AnaliticaClient from "@/src/components/asistencia/AnaliticaClient";
import { getAnaliticaAsistenciaAction } from "@/src/actions/asistencia/analiticaActions";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Analítica de Asistencia",
  description: "Métricas y rankings de puntualidad.",
};

export const dynamic = "force-dynamic";

export default async function AnaliticaAsistenciaPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch en paralelo: Permisos + Analítica Inicial (7 días)
  const [permsRes, asistenciasIniciales] = await Promise.all([
    supabase.rpc('get_my_permissions_slugs'),
    getAnaliticaAsistenciaAction(7)
  ]);

  const permisos = permsRes.data || [];
  const tieneAcceso = permisos.includes('acceso_total') || permisos.includes('asistencia.read');

  if (!tieneAcceso) {
    return <AccessDenied message="No tienes permisos para ver la analítica de asistencia." />;
  }

  return (
    <div className="h-[100dvh] md:h-full flex flex-col p-0 pb-20 md:p-6 lg:p-8 overflow-hidden animate-in fade-in duration-500">
      <div className="flex-1 min-h-0 bg-neutral-50 dark:bg-neutral-950 md:rounded-3xl overflow-hidden md:border border-neutral-200 dark:border-neutral-800/60 shadow-sm relative flex flex-col">
        <AnaliticaClient initialAsistencias={asistenciasIniciales} />
      </div>
    </div>
  );
}