import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'
import RolesClient from '@/src/components/roles/RolesClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Gestión de Roles | Panel',
  description: 'Administración de roles y permisos del sistema.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0 

export default async function RolesPage() {
  const supabase = await createClient()
  
  // 1. Verificación de Sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Blindaje de Estado
  const { data: perfilLogueado } = await supabase
    .from('empleados')
    .select('id, estado')
    .eq('usuario_id', user.id)
    .single()

  if (perfilLogueado?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  // 3. Validación ESTRICTA de Permisos (Solo Superadmin)
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs')
  const permisos = perms || []
  
  // Aquí ignoramos el "acceso_total". Tiene que ser superadmin explícitamente.
  const isSuperAdmin = permisos.includes('superadmin')

  if (!isSuperAdmin) {
    return (
      <AccessDenied 
        message="Acceso Restringido. Solo el Dueño/Superadministrador del sistema puede crear o modificar los roles y permisos." 
      />
    )
  }

  // 4. Si pasa la seguridad, le mostramos el cliente
  return (
    <div className="h-[100dvh] md:h-full flex flex-col p-0 pb-20 md:p-6 lg:p-8 overflow-hidden animate-in fade-in duration-500">
      <div className="flex-1 min-h-0 bg-white dark:bg-neutral-900 md:rounded-3xl overflow-hidden md:border border-neutral-200 dark:border-0 shadow-sm relative">
        <RolesClient />
      </div>
    </div>
  )
}