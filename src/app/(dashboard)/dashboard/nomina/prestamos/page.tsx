import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'
import PrestamosClient from '@/src/components/nomina/prestamos/PrestamosClient'

export const dynamic = 'force-dynamic'

export default async function PrestamosPage() {
  const supabase = await createClient()

  // 1. Verificación de sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. OBTENCIÓN EN PARALELO (Destruyendo la cascada)
  const [perfilRes, permsRes, prestamosRes, empleadosRes] = await Promise.all([
    supabase.from('empleados').select('estado').eq('usuario_id', user.id).single(),
    supabase.rpc('get_my_permissions_slugs'),
    supabase.from('prestamos')
      .select(`
        *,
        empleados!prestamos_empleado_id_fkey (
          id, nombre, apellidos, foto_perfil_url, areas!empleados_area_id_fkey(nombre)
        )
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false }),
    supabase.from('empleados')
      .select('id, nombre, apellidos, foto_perfil_url')
      .eq('estado', 'activo')
      .is('deleted_at', null)
      .order('nombre', { ascending: true })
  ])

  // 3. BLINDAJE DE ESTADO Y SEGURIDAD
  if (perfilRes.data?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  const permisos = permsRes.data || []
  const isAdmin = permisos.includes('acceso_total')
  
  const canAccess = permisos.includes('prestamos.read') || isAdmin
  const canManage = permisos.includes('prestamos.create') || permisos.includes('prestamos.update') || isAdmin

  if (!canAccess) {
    return <AccessDenied message="Solo el departamento de Contabilidad y Administración tienen acceso al módulo de préstamos." />
  }

  // Inyectamos el avatar de Google si es necesario (Opcional, pero lo mantenemos por tu lógica)
  const googleAvatar = user.user_metadata?.avatar_url;
  const prestamosProcesados = (prestamosRes.data || []).map((p: any) => {
    if (p.empleados?.usuario_id === user.id && (!p.empleados.foto_perfil_url || p.empleados.foto_perfil_url === '') && googleAvatar) {
        return { ...p, empleados: { ...p.empleados, foto_perfil_url: googleAvatar } };
    }
    return p;
  });

  return (
    <div className="h-full p-4 sm:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500 overflow-hidden flex flex-col">
      <PrestamosClient 
        initialPrestamos={prestamosProcesados}
        empleadosLista={empleadosRes.data || []}
        canManage={canManage}
      />
    </div>
  )
}