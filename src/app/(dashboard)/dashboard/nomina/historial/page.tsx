import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'
import HistorialNominaClient from '@/src/components/nomina/historial/HistorialNominaClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function HistorialNominaPage() {
  const supabase = await createClient()

  // 1. Verificación de sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Verificación de estado activo
  const { data: perfil } = await supabase
    .from('empleados')
    .select('estado')
    .eq('usuario_id', user.id)
    .single()

  if (perfil?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  // 3. Verificación de permisos (Solo lectura o acceso total)
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs')
  const permisos = perms || []

  const canAccess = permisos.includes('nomina.read') || permisos.includes('acceso_total')

  if (!canAccess) {
    return <AccessDenied message="No tienes permisos para ver el historial de nóminas." />
  }

  return (
    <div className="h-full px-4 sm:px-6 lg:px-8 py-6">
      <HistorialNominaClient />
    </div>
  )
}