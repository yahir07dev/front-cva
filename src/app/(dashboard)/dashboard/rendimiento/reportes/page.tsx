import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import ReportesClient from '@/src/components/perfomance/reportes/ReportesClient'
import AccessDenied from '@/src/components/shared/AccessDenied' // <--- Importamos

export const dynamic = 'force-dynamic'

export default async function ReportesPage() {
  const supabase = await createClient()
  
  // 1. Sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Obtener Permisos
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs')
  const permisos = perms || []
  
  // Regla de Negocio: Solo Admin o quien tenga 'reportes.read_all' entra aquí.
  const canViewReports = permisos.includes('acceso_total') || permisos.includes('reportes.read_all')

  // 3. BLOQUEO DE SEGURIDAD
  if (!canViewReports) {
    return (
      <AccessDenied 
        message="El módulo de reportes analíticos es exclusivo para el personal administrativo." 
      />
    )
  }

  // 4. Si pasa, cargamos los datos
  const { data: empleadoActual } = await supabase
    .from('empleados')
    .select('id, nombre, apellidos')
    .eq('usuario_id', user.id)
    .single()

  const { data: actividades } = await supabase
    .from('actividades')
    .select(`
      id, calificacion, fecha_evaluada,
      asignaciones:asignacion_actividades!inner(
        empleado:empleados(id, nombre, apellidos)
      )
    `)
    .eq('estado', 'completada')
    .not('calificacion', 'is', null)

  const { data: feedback } = await supabase
    .from('comentarios_rendimiento')
    .select(`
      id, tipo, created_at, 
      empleado:empleados!inner(id, nombre, apellidos)
    `)

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8">
      <ReportesClient 
        actividades={actividades || []} 
        feedback={feedback || []}
        currentUserId={empleadoActual?.id}
        isAdmin={true} // Ya validamos que es Admin/Supervisor arriba
      />
    </div>
  )
}