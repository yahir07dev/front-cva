import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'
import AreasClient from '@/src/components/organizacion/AreasClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AreasPage() {
  const supabase = await createClient()

  // 1. Verificación básica de sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. BLINDAJE DE ESTADO (Servidor)
  const { data: perfil } = await supabase
    .from('empleados')
    .select('estado')
    .eq('usuario_id', user.id)
    .single()

  if (perfil?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  // 3. VERIFICACIÓN DE PERMISOS (SERVIDOR)
  // Usamos la RPC que ya tienes configurada y es infalible
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs')
  const permisos = perms || []

  // Permisos requeridos para ver esta página: áreas.read O acceso total
  const canView = permisos.includes('areas.read') || permisos.includes('acceso_total')

  // 4. SI NO TIENE PERMISO -> BLOQUEO TOTAL
  if (!canView) {
    return (
      <AccessDenied 
        message="No tienes los permisos necesarios para gestionar la estructura organizacional. Contacta a un administrador." 
      />
    )
  }

  // 5. CARGA DE DATOS (Solo si pasó el blindaje anterior)
  const [areasRes, empleadosRes] = await Promise.all([
    supabase
      .from('areas')
      .select(`
        id, nombre, descripcion, encargado_id,
        encargado:empleados!fk_areas_encargado(id, nombre, apellidos, foto_perfil_url)
      `)
      .is('deleted_at', null)
      .order('nombre', { ascending: true }),

    supabase
      .from('empleados')
      .select('id, nombre, apellidos, foto_perfil_url, area_id')
      .eq('estado', 'activo')
      .is('deleted_at', null)
      .order('nombre', { ascending: true })
  ])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-6 animate-in fade-in duration-500">
      <div className="mb-6 flex flex-col gap-1">
        <h2 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
          Estructura Organizacional
        </h2>
        <p className="text-muted-foreground text-sm italic">
          Gestión de departamentos y asignación operativa de personal.
        </p>
      </div>
      
      <AreasClient 
        initialAreas={areasRes.data || []} 
        initialEmpleados={empleadosRes.data || []}
      />
    </div>
  )
}