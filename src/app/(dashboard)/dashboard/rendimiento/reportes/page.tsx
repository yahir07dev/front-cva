import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReportesClient from '@/src/components/perfomance/reportes/ReportesClient'
import AccessDenied from '@/src/components/shared/AccessDenied'
import { calcularRankingData, calcularGraficaData } from '@/src/lib/utils/perfomanceCalculator'

export const dynamic = 'force-dynamic'

export default async function ReportesPage() {
  const supabase = await createClient()
  
  // 1. Verificación de Sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Fetch de datos en paralelo
  const [perfilRes, permsRes, actividadesRes, comentariosRes] = await Promise.all([
    supabase.from('empleados').select('id, nombre, apellidos, estado').eq('usuario_id', user.id).single(),
    supabase.rpc('get_my_permissions_slugs'),
    supabase.from('actividades')
      .select(`
        id, calificacion, fecha_evaluada, estado,
        asignaciones:asignacion_actividades!inner(
          empleado:empleados!inner(
            id, usuario_id, nombre, apellidos, estado, foto_perfil_url
          )
        )
      `)
      .in('estado', ['completada', 'no_realizada'])
      .is('deleted_at', null)
      .eq('asignacion_actividades.empleados.estado', 'activo'),
    supabase.from('comentarios_rendimiento')
      .select('id, empleado_id, valor_puntos, fecha')
      .is('deleted_at', null)
  ])

  // 3. Blindaje de Estado
  if (perfilRes.data?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  // 4. Validación de Permisos
  const permisos = permsRes.data || []
  const isAdmin = permisos.includes('acceso_total') || permisos.includes('reportes.read_all')
  const canViewReports = isAdmin || permisos.includes('actividades.read')

  if (!canViewReports) {
    return <AccessDenied message="No tienes los permisos necesarios para acceder a tu panel de rendimiento." />
  }

  // 5. CÁLCULO INTENSIVO EN EL SERVIDOR
  // En lugar de enviar la data cruda, enviamos los resultados procesados
  const topEmpleadosData = calcularRankingData(actividadesRes.data || [], comentariosRes.data || [])
  const datosGraficaData = calcularGraficaData(actividadesRes.data || [])

  return (
    <div className="h-[100dvh] md:h-full flex flex-col p-0 pb-20 md:p-6 lg:p-8 overflow-hidden animate-in fade-in duration-500">
      <div className="flex-1 min-h-0 bg-white dark:bg-neutral-900 md:rounded-3xl overflow-hidden md:border border-neutral-200 dark:border-0 shadow-sm">
        <ReportesClient 
          topEmpleados={topEmpleadosData} 
          datosGrafica={datosGraficaData} 
          currentUserId={String(perfilRes.data?.id)}
          isAdmin={isAdmin} 
        />
      </div>
    </div>
  )
}