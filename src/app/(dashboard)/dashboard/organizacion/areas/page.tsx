import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'
import AreasClient from '@/src/components/organizacion/AreasClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AreasPage() {
  const supabase = await createClient()

  // 1. Verificación de sesión y estado
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: perfil } = await supabase
    .from('empleados')
    .select('estado')
    .eq('usuario_id', user.id)
    .single()

  if (perfil?.estado === 'baja') redirect('/login?error=cuenta_desactivada')

  // 2. Permisos
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs')
  const permisos = perms || []
  const canView = permisos.includes('areas.read') || permisos.includes('acceso_total')

  if (!canView) return <AccessDenied message="No tienes permisos." />

  // 3. Carga de datos
  const [areasRes, empleadosRes] = await Promise.all([
    supabase.from('areas').select(`*, encargado:empleados!fk_areas_encargado(*)`).is('deleted_at', null).order('nombre'),
    supabase.from('empleados').select('*').eq('estado', 'activo').is('deleted_at', null).order('nombre')
  ])

  return (
    /**
     * 🟢 INTEGRACIÓN TOTAL CON EL FONDO:
     * - Fondo consistente en toda la página
     * - Sin bordes ni separaciones
     */
    <div className="h-full w-full overflow-y-auto bg-neutral-50 dark:bg-neutral-950">
      
      {/* Contenido integrado con el fondo */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 pb-32">
        
        {/* Encabezado integrado (sin borde inferior) */}
        <div className="mb-6">
          <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Estructura Organizacional
          </h2>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm italic mt-1">
            Gestión de departamentos y asignación operativa.
          </p>
        </div>
        
        {/* Cliente - Ya maneja su propio fondo integrado */}
        <AreasClient 
          initialAreas={areasRes.data || []} 
          initialEmpleados={empleadosRes.data || []}
        />
      </div>
    </div>
  )
}