import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'
import PrestamosClient from '@/src/components/nomina/prestamos/PrestamosClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function PrestamosPage() {
  const supabase = await createClient()

  // 1. Verificación básica de sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. BLINDAJE DE ESTADO: Verificar si el usuario que accede está ACTIVO
  const { data: perfil } = await supabase
    .from('empleados')
    .select('estado')
    .eq('usuario_id', user.id)
    .single()

  // Si el usuario es "baja", lo sacamos de aquí inmediatamente
  if (perfil?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  // 3. VERIFICACIÓN DE PERMISOS DESDE EL SERVIDOR
  // Obtenemos los slugs de permisos del usuario usando tu RPC
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs')
  const permisos = perms || []

  // Para entrar aquí necesita ser Contabilidad (prestamos.read) o Administrador (acceso_total)
  const canAccess = permisos.includes('prestamos.read') || permisos.includes('acceso_total')

  // 4. SI NO TIENE PERMISO -> PANTALLA DE BLOQUEO TOTAL
  // Esto deja fuera automáticamente a los Empleados (Rol 3) y Supervisores (Rol 5)
  if (!canAccess) {
    return (
      <AccessDenied 
        message="Solo el departamento de Contabilidad y Administración tienen acceso al módulo de préstamos." 
      />
    )
  }

  // 5. RENDERIZADO
  // Si pasa todos los blindajes, mostramos la UI de Préstamos.
  return (
    <div className="h-full px-4 sm:px-6 lg:px-8 py-6">
      <PrestamosClient />
    </div>
  )
}