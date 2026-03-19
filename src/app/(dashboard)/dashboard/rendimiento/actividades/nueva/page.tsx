import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'
import NuevaActividadClient from '@/src/components/perfomance/actividades/NuevaActividadClient'

export const dynamic = 'force-dynamic'

export default async function NuevaActividadPage() {
  const supabase = await createClient()

  // 1. Verificación básica de sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. FETCH EN PARALELO (Elimina el waterfall)
  // Traemos el perfil, los permisos y TODOS los empleados activos al mismo tiempo
  const [perfilRes, permsRes, empleadosRes] = await Promise.all([
    supabase.from('empleados').select('estado,areas(nombre)').eq('usuario_id', user.id).single(),
    supabase.rpc('get_my_permissions_slugs'),
    supabase.from('empleados')
      .select('id, usuario_id, nombre, apellidos, foto_perfil_url, roles(nombre), areas!empleados_area_id_fkey(nombre)')
      .eq('estado', 'activo')
      .is('deleted_at', null)
      .order('nombre', { ascending: true })
  ])

  // 3. BLINDAJE DE ESTADO Y SEGURIDAD
  if (perfilRes.data?.estado === 'baja') { 
    redirect('/login?error=cuenta_desactivada')
  }

  const permisos = permsRes.data || []
  const canCreate = permisos.includes('actividades.create') || permisos.includes('acceso_total')

  if (!canCreate) {
    return (
      <AccessDenied 
        message="Solo los Supervisores y Administradores pueden crear nuevas tareas y asignaciones." 
      />
    )
  }

  // 4. LÓGICA DE NEGOCIO EN SERVIDOR (Procesamiento de empleados)
  const isAdmin = permisos.includes('acceso_total')
  const isSupervisor = canCreate && !isAdmin
  const googleAvatar = user.user_metadata?.avatar_url

  let empleadosProcesados = (empleadosRes.data || []).map((emp: any) => {
    const esElUsuarioActual = emp.usuario_id === user.id
    const noTieneFotoBD = !emp.foto_perfil_url || emp.foto_perfil_url.trim() === ''
    
    // Si es el usuario actual y no tiene foto, le ponemos la de Google
    if (esElUsuarioActual && noTieneFotoBD && googleAvatar) {
      return { ...emp, foto_perfil_url: googleAvatar }
    }
    return emp
  })

  // Regla de negocio: Los supervisores no pueden asignar a Contabilidad
  if (isSupervisor) {
    empleadosProcesados = empleadosProcesados.filter(
      (emp: any) => emp.roles?.nombre !== 'Contabilidad'
    )
  }

  // 5. Renderizado del cliente pasando SÓLO lo que necesita
  return (
    <div className="h-full">
      <NuevaActividadClient 
        initialEmpleados={empleadosProcesados}
        userEstado={perfilRes.data?.estado || 'activo'}
        userId={user.id}
      />
    </div>
  )
}