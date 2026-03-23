import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import NotasClient from '@/src/components/notas/NotasClient'
import AccessDenied from '@/src/components/shared/AccessDenied'
import { Metadata } from 'next'
import { obtenerNotasAction } from '@/src/actions/notas/notasActions'

export const metadata: Metadata = {
  title: 'Notas Globales', // El layout pondrá el "| CVA"
  description: 'Bloc de notas colaborativo para la administración.',
}

export const dynamic = 'force-dynamic'

export default async function NotasPage() {
  const supabase = await createClient()
  
  // 1. Verificación de Sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. FETCH EN PARALELO (Destruyendo la cascada)
  const [perfilRes, permsRes, notasData] = await Promise.all([
    supabase.from('empleados').select('id, estado').eq('usuario_id', user.id).single(),
    supabase.rpc('get_my_permissions_slugs'),
    obtenerNotasAction() // Llamamos al Server Action aquí
  ])

  // 3. Blindaje de Estado
  if (perfilRes.data?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  // 4. Validación de Permisos (Calculada en servidor)
  const permisos = permsRes.data || []
  
  const isAdmin = permisos.includes('acceso_total')
  const canViewNotas = isAdmin || permisos.includes('notas.read')
  const canCreate = isAdmin || permisos.includes('notas.create')
  const canUpdate = isAdmin || permisos.includes('notas.update')
  const canDelete = isAdmin || permisos.includes('notas.delete')

  if (!canViewNotas) {
    return (
      <AccessDenied 
        message="No tienes los permisos necesarios para acceder a las Notas Globales. Solo Administradores y Supervisores pueden ver esta sección." 
      />
    )
  }

  // 5. Renderizamos el cliente enviando las notas y permisos pre-procesados
  return (
    <div className="h-[100dvh] md:h-full flex flex-col p-0 pb-20 md:p-6 lg:p-8 overflow-hidden animate-in fade-in duration-500">
      <div className="flex-1 min-h-0 bg-white dark:bg-neutral-900 md:rounded-3xl overflow-hidden md:border border-neutral-200 dark:border-0 shadow-sm relative">
        <NotasClient 
          initialNotas={notasData}
          permissions={{
            canManage: canUpdate, // Manage se refiere a Update en tu lógica
            canCreate,
            canDelete
          }}
          userId={user.id}
        />
      </div>
    </div>
  )
}