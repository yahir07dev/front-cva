import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import FeedbackClient from '@/src/components/perfomance/feedback/FeedbackClient' 
import AccessDenied from '@/src/components/shared/AccessDenied' // <-- 1. Importar pantalla de bloqueo

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ComentariosPage() {
  const supabase = await createClient()

  // 1. OBTENER USUARIO Y VERIFICAR ESTADO
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Verificamos si el usuario actual está dado de baja
  const { data: perfilLogueado } = await supabase
    .from('empleados')
    .select('estado')
    .eq('usuario_id', user.id)
    .single()

  if (perfilLogueado?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  // 2. 🛡️ BLINDAJE DE PERMISOS (EL CANDADO REAL)
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs')
  const permisos = perms || []

  // Validamos si tiene el permiso específico o es admin
  const canAccess = permisos.includes('comentarios.read') || permisos.includes('acceso_total')

  if (!canAccess) {
    return (
      <AccessDenied 
        message="No tienes los permisos necesarios para acceder al módulo de Feedback y Comentarios." 
      />
    )
  }

  // 3. OBTENER LISTA DE EMPLEADOS ACTIVOS (Solo se ejecuta si pasó el candado)
  const { data: empleados, error } = await supabase
    .from('empleados')
    .select('id, usuario_id, nombre, apellidos, foto_perfil_url, estado, roles(nombre)') 
    .eq('estado', 'activo') 
    .is('deleted_at', null)
    .order('nombre', { ascending: true })

  if (error) {
    console.error("Error cargando empleados:", error)
  }

  return (
    <div className="h-[100dvh] md:h-full flex flex-col p-0 pb-30 md:p-6 lg:p-8 overflow-hidden">
       
       {/* HEADER OCULTO EN MÓVIL */}
       <div className="hidden md:block flex-none mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback y Retroalimentación</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Historial de comentarios, mejoras y seguimiento del equipo.
        </p>
      </div>

      {/* Contenedor del Chat/Feedback */}
      <div className="flex-1 min-h-0 bg-white dark:bg-neutral-900 md:rounded-2xl overflow-hidden md:border border-neutral-200 dark:border-0 shadow-sm">
        <FeedbackClient 
          initialUser={user} 
          initialEmpleados={empleados || []} 
        />
      </div>
    </div>
  )
}