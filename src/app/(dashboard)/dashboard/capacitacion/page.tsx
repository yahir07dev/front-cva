import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import AccessDenied from '@/src/components/shared/AccessDenied'
import CapacitacionClient from '@/src/components/capacitacion/admin/CapacitacionClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function CapacitacionPage() {
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

  // Para entrar aquí necesita tener el permiso de lectura de cursos (cursos.read) o acceso total.
  // Recordando que por SQL ya le dimos 'cursos.read' tanto a Administradores como a Empleados.
  const canAccess = permisos.includes('cursos.read') || permisos.includes('acceso_total')

  // 4. SI NO TIENE PERMISO -> PANTALLA DE BLOQUEO TOTAL
  if (!canAccess) {
    return (
      <AccessDenied 
        message="No tienes los permisos necesarios para acceder a la academia de capacitación." 
      />
    )
  }

  // 5. RENDERIZADO
  // Se aplicó el fondo dinámico para el tema Light/Dark y se unificó el padding
  return (
    <div className="h-full p-4 sm:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors duration-500 overflow-hidden flex flex-col min-h-0">
      <CapacitacionClient />
    </div>
  )
}