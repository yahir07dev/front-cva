import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'
import AreasClient from '@/src/components/organizacion/AreasClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Estructura Organizacional',
  description: 'Gestión de departamentos y asignación operativa.'
}

export const dynamic = 'force-dynamic'

export default async function AreasPage() {
  const supabase = await createClient()

  // 1. Verificación inicial obligatoria
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. FETCH MASIVO EN PARALELO (Cero Cascadas)
  const [perfilRes, permsRes, areasRes, empleadosRes] = await Promise.all([
    supabase.from('empleados').select('estado').eq('usuario_id', user.id).single(),
    supabase.rpc('get_my_permissions_slugs'),
    supabase.from('areas').select(`*, encargado:empleados!fk_areas_encargado(*)`).is('deleted_at', null).order('nombre'),
    supabase.from('empleados').select('*').eq('estado', 'activo').is('deleted_at', null).order('nombre')
  ])

  // 3. Blindaje de estado
  if (perfilRes.data?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  // 4. Permisos (Solo Admin)
  const permisos = permsRes.data || []
  const canManage = permisos.includes('acceso_total')

  if (!canManage) {
    return <AccessDenied message="No tienes permisos de Administrador para ver la estructura organizacional." />
  }

  return (
    <div className="h-full w-full overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-32">
        
        {/* Encabezado integrado */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Estructura Organizacional
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm italic mt-1">
            Gestión de departamentos y asignación operativa.
          </p>
        </div>
        
        <AreasClient 
          initialAreas={areasRes.data || []} 
          initialEmpleados={empleadosRes.data || []}
          canManage={canManage} // Se lo pasamos pre-calculado
        />
      </div>
    </div>
  )
}