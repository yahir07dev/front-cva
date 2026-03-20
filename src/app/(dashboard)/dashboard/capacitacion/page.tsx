import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'
import CapacitacionClient from '@/src/components/capacitacion/admin/CapacitacionClient'
import { getCursosAction } from '@/src/actions/capacitacion/capacitacionActions'

export const dynamic = 'force-dynamic'

export default async function CapacitacionPage() {
  const supabase = await createClient()

  // 1. Verificación básica
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. OBTENCIÓN MASIVA EN PARALELO (Cero Cascadas)
  const [perfilRes, permsRes, cursosData, empleadosData] = await Promise.all([
    supabase.from('empleados').select('id, estado').eq('usuario_id', user.id).single(),
    supabase.rpc('get_my_permissions_slugs'),
    getCursosAction(),
    supabase.from('empleados').select('id, nombre, apellidos, foto_perfil_url, roles(nombre)').eq('estado', 'activo').is('deleted_at', null).order('nombre')
  ])

  // 3. Blindaje de Estado
  if (!perfilRes.data || perfilRes.data.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  // 4. Permisos
  const permisos = permsRes.data || []
  const isAdmin = permisos.includes('acceso_total')
  const canAccess = permisos.includes('cursos.read') || isAdmin
  const canManage = permisos.includes('cursos.create') || permisos.includes('cursos.update') || isAdmin

  if (!canAccess) {
    return <AccessDenied message="No tienes los permisos necesarios para acceder a la academia de capacitación." />
  }

  // 5. Inyección de Avatar
  const googleAvatar = user.user_metadata?.avatar_url;
  const cursosProcesados = cursosData.map(curso => ({
    ...curso,
    asignacion_cursos: curso.asignacion_cursos.map((asig: any) => {
      const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados;
      if (emp?.usuario_id === user.id && (!emp.foto_perfil_url || emp.foto_perfil_url === '') && googleAvatar) {
        return { ...asig, empleados: { ...emp, foto_perfil_url: googleAvatar } }
      }
      return asig;
    })
  }))

  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500 flex flex-col">
      <CapacitacionClient 
        initialCursos={cursosProcesados} 
        empleadosDisponibles={empleadosData.data || []}
        canManage={canManage}
        empleadoId={perfilRes.data.id}
        userId={user.id}
      />
    </div>
  )
}