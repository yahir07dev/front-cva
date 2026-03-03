import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'
import GenerarNominaClient from '@/src/components/nomina/generar/GenerarNominaClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function GenerarNominaPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('empleados')
    .select('estado')
    .eq('usuario_id', user.id)
    .single()

  if (perfil?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  const { data: perms } = await supabase.rpc('get_my_permissions_slugs')
  const permisos = perms || []

  // Permiso de lectura o escritura
  const canAccess = permisos.includes('nomina.read') || permisos.includes('nomina.create') || permisos.includes('acceso_total')
  
  // Permiso solo de escritura (para bloquear la UI a los contadores)
  const canManage = permisos.includes('nomina.create') || permisos.includes('acceso_total')

  if (!canAccess) {
    return (
      <AccessDenied 
        message="No tienes los permisos necesarios para ver o generar nóminas." 
      />
    )
  }

  return (
    <div className="h-full px-4 sm:px-6 lg:px-8 py-6">
      <GenerarNominaClient canManage={canManage} />
    </div>
  )
}