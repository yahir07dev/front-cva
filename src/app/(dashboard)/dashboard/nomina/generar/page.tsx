import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'
import GenerarNominaClient from '@/src/components/nomina/generar/GenerarNominaClient'
import { Metadata } from 'next'
export const metadata: Metadata = {
  title: 'Generar Nómina',
  description: 'Genera la nómina mensual para el personal activo.'
}

export const dynamic = 'force-dynamic'

export default async function GenerarNominaPage() {
  const supabase = await createClient()

  // 1. Verificación básica de sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Fetch en paralelo para eliminar la cascada inicial
  const [perfilRes, permsRes] = await Promise.all([
    supabase.from('empleados').select('estado').eq('usuario_id', user.id).single(),
    supabase.rpc('get_my_permissions_slugs')
  ])

  if (perfilRes.data?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  const permisos = permsRes.data || []
  const isAdmin = permisos.includes('acceso_total')
  
  const canAccess = permisos.includes('nomina.read') || permisos.includes('nomina.create') || isAdmin
  const canManage = permisos.includes('nomina.create') || isAdmin

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