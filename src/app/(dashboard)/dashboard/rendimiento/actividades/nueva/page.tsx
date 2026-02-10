import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'
import NuevaActividadClient from '@/src/components/perfomance/NuevaActividadClient' // Ajusté ruta 'perfomance' -> 'performance'

export const dynamic = 'force-dynamic'

export default async function NuevaActividadPage() {
  const supabase = await createClient()

  // 1. Verificación básica de sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. VERIFICACIÓN DE PERMISOS (SERVIDOR)
  // Obtenemos los slugs de permisos del usuario usando tu RPC
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs')
  const permisos = perms || []

  // Permisos requeridos: crear actividad O acceso total (admin)
  const canCreate = permisos.includes('actividades.create') || permisos.includes('acceso_total')

  // 3. SI NO TIENE PERMISO -> BLOQUEO TOTAL
  // Esto evita que renderice siquiera el formulario
  if (!canCreate) {
    return (
      <AccessDenied 
        message="Solo los Supervisores y Administradores pueden crear nuevas tareas y asignaciones." 
      />
    )
  }

  // 4. Si tiene permiso -> Renderizar formulario cliente
  return <NuevaActividadClient />
}