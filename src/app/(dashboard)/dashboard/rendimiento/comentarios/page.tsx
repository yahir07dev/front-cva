import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import FeedbackClient from '@/src/components/perfomance/feedback/FeedbackClient' 

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ComentariosPage() {
  const supabase = await createClient()

  // 1. OBTENER USUARIO Y VERIFICAR ESTADO (Blindaje de Servidor)
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

  // Si es "baja", lo redirigimos fuera del módulo inmediatamente
  if (perfilLogueado?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  // 2. OBTENER LISTA DE EMPLEADOS ACTIVOS
  const { data: empleados, error } = await supabase
    .from('empleados')
    .select('id, usuario_id, nombre, apellidos, foto_perfil_url, estado, roles(nombre)') 
    .eq('estado', 'activo') // Filtro estricto para la lista lateral
    .is('deleted_at', null)
    .order('nombre', { ascending: true })

  if (error) {
    console.error("Error cargando empleados:", error)
  }

  return (
    <div className="h-full flex flex-col p-4 sm:p-6 lg:p-8">
       {/* Header de la Página */}
       <div className="flex-none mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Feedback y Retroalimentación</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Historial de comentarios, mejoras y seguimiento del equipo.
        </p>
      </div>

      {/* Contenedor del Chat/Feedback */}
      <div className="flex-1 min-h-0 bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm">
        <FeedbackClient 
          initialUser={user} 
          initialEmpleados={empleados || []} 
        />
      </div>
    </div>
  )
}