import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import NotasClient from '@/src/components/notas/NotasClient'
import AccessDenied from '@/src/components/shared/AccessDenied'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Notas Globales | Panel',
  description: 'Bloc de notas colaborativo para la administración.',
}

export const dynamic = 'force-dynamic'
export const revalidate = 0 

export default async function NotasPage() {
  const supabase = await createClient()
  
  // 1. Verificación de Sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Blindaje de Estado (Revisar que el empleado no esté de baja)
  const { data: perfilLogueado } = await supabase
    .from('empleados')
    .select('id, estado')
    .eq('usuario_id', user.id)
    .single()

  if (perfilLogueado?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  // 3. Validación de Permisos (SOLO ADMINS Y SUPERVISORES)
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs')
  const permisos = perms || []
  
  // Es Admin/Super si tiene acceso total o el permiso explícito de leer notas
  const canViewNotas = permisos.includes('acceso_total') || permisos.includes('notas.read')

  if (!canViewNotas) {
    return (
      <AccessDenied 
        message="No tienes los permisos necesarios para acceder a las Notas Globales. Solo Administradores y Supervisores pueden ver esta sección." 
      />
    )
  }

  // 4. Renderizamos el cliente 
  // (No necesitamos cargar las notas aquí en el server porque NotasClient ya usa useNotasGlobales para hacer el fetch en tiempo real)
  return (
    <div className="h-[100dvh] md:h-full flex flex-col p-0 pb-20 md:p-6 lg:p-8 overflow-hidden animate-in fade-in duration-500">
      <div className="flex-1 min-h-0 bg-white dark:bg-neutral-900 md:rounded-3xl overflow-hidden md:border border-neutral-200 dark:border-0 shadow-sm relative">
        <NotasClient />
      </div>
    </div>
  )
}