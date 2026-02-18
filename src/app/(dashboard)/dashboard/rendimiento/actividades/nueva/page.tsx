import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'
import NuevaActividadClient from '@/src/components/perfomance/NuevaActividadClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function NuevaActividadPage() {
  const supabase = await createClient()

  // 1. Verificación básica de sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. BLINDAJE DE ESTADO (Servidor)
  // Verificamos si el usuario (aunque sea admin) está ACTIVO
  const { data: perfil } = await supabase
    .from('empleados')
    .select('estado,areas(nombre)')
    .eq('usuario_id', user.id)
    .single()

  if (perfil?.estado === 'baja') { //
    redirect('/login?error=cuenta_desactivada')
  }

  // 3. VERIFICACIÓN DE PERMISOS (SERVIDOR)
  // Obtenemos los slugs de permisos del usuario usando la RPC
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs')
  const permisos = perms || []

  // Permisos requeridos: crear actividad O acceso total (admin)
  const canCreate = permisos.includes('actividades.create') || permisos.includes('acceso_total')

  // 4. SI NO TIENE PERMISO -> BLOQUEO TOTAL
  if (!canCreate) {
    return (
      <AccessDenied 
        message="Solo los Supervisores y Administradores pueden crear nuevas tareas y asignaciones." 
      />
    )
  }

  // 5. Si todo está en orden -> Renderizar formulario cliente
  return (
    <div className="h-full">
      <NuevaActividadClient />
    </div>
  )
}