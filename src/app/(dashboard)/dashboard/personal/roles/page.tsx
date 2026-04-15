import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'
import RolesClient from '@/src/components/roles/RolesClient'
import { Metadata } from 'next'
import { getRolesConPermisosAction, getCatalogoPermisosAction } from '@/src/actions/roles/rolesActions'

export const metadata: Metadata = {
  title: 'Gestión de Roles',
  description: 'Administración de roles y permisos del sistema.',
}

export const dynamic = 'force-dynamic'

export default async function RolesPage() {
  const supabase = await createClient()
  
  // 1. Verificación de Sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. FETCH MASIVO EN PARALELO (Cero Cascadas)
  const [perfilLogueado, permsRes, rolesData, catalogoData] = await Promise.all([
    supabase.from('empleados').select('id, estado').eq('usuario_id', user.id).single(),
    supabase.rpc('get_my_permissions_slugs'),
    getRolesConPermisosAction(),
    getCatalogoPermisosAction()
  ])

  // 3. Blindaje de Estado
  if (perfilLogueado.data?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  // 4. Validación ESTRICTA de Permisos (Solo Superadmin)
  const permisos = permsRes.data || []
  const isSuperAdmin = permisos.includes('superadmin')

  if (!isSuperAdmin) {
    return (
      <AccessDenied 
        message="Acceso Restringido. Solo el Dueño/Superadministrador del sistema puede crear o modificar los roles y permisos." 
      />
    )
  }

  // 5. Renderizamos el cliente pasando los datos pre-cargados
  return (
    <div className="h-[100dvh] md:h-full flex flex-col p-0 pb-20 md:p-6 lg:p-8 overflow-hidden animate-in fade-in duration-500">
      <div className="flex-1 min-h-0 bg-[#fafafa] dark:bg-[#0a0a0a] md:rounded-3xl overflow-hidden md:border border-neutral-200 dark:border-white/[0.06] shadow-sm relative">
        <RolesClient 
          initialRoles={rolesData}
          initialCatalogo={catalogoData}
        />a 
      </div>
    </div>
  )
}