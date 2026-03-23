import { Metadata } from 'next' // 👈 1. Importamos Metadata de Next.js
import { createClient } from '@/src/lib/supabase/server'
import ActividadesClient from '@/src/components/perfomance/actividades/ActividadesClient'
import { ActividadConRelaciones } from '@/src/types/performance'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'

// 👇 2. Exportamos el objeto metadata
export const metadata: Metadata = {
  title: 'Actividades',
  description: 'Gestión y seguimiento de actividades del personal.',
}

export const dynamic = 'force-dynamic'

export default async function ActividadesPage() { 
  const supabase = await createClient() 

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // ✅ OPTIMIZACIÓN: Ejecutamos las 3 promesas pesadas en paralelo (SSR)
  const [perfilResponse, permsResponse, actividadesResponse] = await Promise.all([
    supabase.from('empleados').select('estado').eq('usuario_id', user.id).single(),
    supabase.rpc('get_my_permissions_slugs'),
    supabase.from('actividades')
      .select(`
        *,
        areas ( nombre ),
        asignacion_actividades (
          *,
          empleados ( id, usuario_id, nombre, apellidos, foto_perfil_url, estado )
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
  ])

  // Manejo de estado del perfil
  if (perfilResponse.data?.estado === 'baja') { 
    redirect('/login?error=cuenta_desactivada')
  }

  // Verificación de permisos
  const permisos = permsResponse.data || []
  const canAccess = permisos.includes('actividades.read') || permisos.includes('acceso_total')

  if (!canAccess) {
    return <AccessDenied message="No tienes los permisos necesarios para ver el módulo de actividades." />
  }

  if (actividadesResponse.error) {
    console.error('Error cargando actividades:', actividadesResponse.error)
  }

  return (
    <div className="h-full flex flex-col min-h-0 w-full px-4 sm:px-6 lg:px-8">
      <ActividadesClient
        initialData={(actividadesResponse.data as unknown as ActividadConRelaciones[]) || []}
        initialUserEstado={perfilResponse.data?.estado || 'activo'}
        initialPermisos={permisos}
        sessionUser={user}
      />
    </div>
  )
}