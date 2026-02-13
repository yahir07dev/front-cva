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

  // 2. Blindaje de Estado: El usuario debe estar activo
  const { data: perfilLogueado } = await supabase
    .from('empleados')
    .select('id, nombre, apellidos, estado')
    .eq('usuario_id', user.id)
    .single()

  if (perfilLogueado?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  // 3. Validación Jerárquica de Permisos
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

  // 4. Carga de Datos con soporte para Avatares e Incumplimientos
  // Agregamos 'estado' en el select e incluimos 'no_realizada' en el filtro
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
    // Filtramos para incluir tanto éxitos como tareas vencidas para el Score Global
    .in('estado', ['completada', 'no_realizada'])
    .is('deleted_at', null)
    .eq('asignacion_actividades.empleados.estado', 'activo')

  const { data: feedback } = await supabase
    .from('comentarios_rendimiento')
    .select(`
      id, tipo, created_at, 
      empleado:empleados!inner(
        id, 
        usuario_id, 
        nombre, 
        apellidos, 
        estado, 
        foto_perfil_url
      )
    `)
    .eq('empleados.estado', 'activo')
    .is('empleados.deleted_at', null)

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
      <ReportesClient 
        actividades={actividades || []} 
        feedback={feedback || []}
        currentUserId={perfilLogueado?.id}
        isAdmin={true} 
      />
    </div>
  )
}