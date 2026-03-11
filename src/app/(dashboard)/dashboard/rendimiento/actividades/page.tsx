import { createClient } from '@/src/lib/supabase/server'
import ActividadesClient from '@/src/components/perfomance/actividades/ActividadesClient'
import { ActividadConRelaciones } from '@/src/types/performance'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'

export const dynamic = 'force-dynamic'
export const revalidate = 0 

export default async function ActividadesPage() { 
  const supabase = await createClient() 

  // 1. BLINDAJE DE SESIÓN Y ESTADO ACTIVO
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: perfil } = await supabase
    .from('empleados')
    .select('estado')
    .eq('usuario_id', user.id)
    .single()

  if (perfil?.estado === 'baja') { 
    redirect('/login?error=cuenta_desactivada')
  }
  
  // 2. VERIFICACIÓN DE PERMISOS (Aquí ya pasará Contabilidad gracias a la BD)
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs')
  const permisos = perms || []

  const canAccess = permisos.includes('actividades.read') || permisos.includes('acceso_total')

  if (!canAccess) {
    return (
      <AccessDenied 
        message="No tienes los permisos necesarios para ver el módulo de actividades." 
      />
    )
  }

  // 3. FETCH DE ACTIVIDADES (RLS protege lo que pueden ver)
  const { data, error } = await supabase 
    .from('actividades') 
    .select(`
      *,
      areas ( nombre ),
      asignacion_actividades (
        *,
        empleados (
          id,
          usuario_id,
          nombre,
          apellidos,
          foto_perfil_url,
          estado
        )
      )
    `)
    .is('deleted_at', null) 
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando actividades:', error)
  }

  return (
    // CONTENEDOR AJUSTADO PARA EL SCROLL INTERNO
    <div className="h-full flex flex-col min-h-0 w-full px-4 sm:px-6 lg:px-8">
      <ActividadesClient
        initialData={(data as unknown as ActividadConRelaciones[]) || []}
      />
    </div>
  )
}