import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReportesClient from '@/src/components/perfomance/reportes/ReportesClient'
import AccessDenied from '@/src/components/shared/AccessDenied'

export const dynamic = 'force-dynamic'
export const revalidate = 0 

export default async function ReportesPage() {
  const supabase = await createClient()
  
  // 1. Verificación de Sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Blindaje de Estado
  const { data: perfilLogueado } = await supabase
    .from('empleados')
    .select('id, nombre, apellidos, estado')
    .eq('usuario_id', user.id)
    .single()

  if (perfilLogueado?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  // 3. Validación de Permisos
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs')
  const permisos = perms || []
  const canViewReports = permisos.includes('acceso_total') || permisos.includes('reportes.read_all')

  if (!canViewReports) {
    return (
      <AccessDenied 
        message="El módulo de reportes analíticos es exclusivo para el personal administrativo y supervisores." 
      />
    )
  }

  // 4. Carga de Actividades (Solo éxitos e incumplimientos)
  const { data: actividades } = await supabase
    .from('actividades')
    .select(`
      id, 
      calificacion, 
      fecha_evaluada,
      estado,
      asignaciones:asignacion_actividades!inner(
        empleado:empleados!inner(
          id, 
          usuario_id, 
          nombre, 
          apellidos, 
          estado, 
          foto_perfil_url
        )
      )
    `)
    .in('estado', ['completada', 'no_realizada'])
    .is('deleted_at', null)
    .eq('asignacion_actividades.empleados.estado', 'activo')

  return (
    // Ajuste de altura dinámica para evitar que el contenido se oculte en móvil
    <div className="h-[100dvh] md:h-full flex flex-col p-0 pb-20 md:p-6 lg:p-8 overflow-hidden animate-in fade-in duration-500">
      <div className="flex-1 min-h-0 bg-white dark:bg-neutral-900 md:rounded-3xl overflow-hidden md:border border-neutral-200 dark:border-0 shadow-sm">
        <ReportesClient 
          actividades={actividades || []} 
          currentUserId={perfilLogueado?.id}
          isAdmin={true} 
        />
      </div>
    </div>
  )
}