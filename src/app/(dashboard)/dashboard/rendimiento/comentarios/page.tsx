import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
// NOTA: Ajusté la ruta a 'performance' para mantener la consistencia
import FeedbackClient from '@/src/components/perfomance/feedback/FeedbackClient' 

export const dynamic = 'force-dynamic'

export default async function ComentariosPage() {
  const supabase = await createClient()

  // 1. Obtener Usuario Actual
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Obtener Lista de Empleados
  // Se obtienen todos los activos. El componente Cliente (FeedbackClient) y 
  // el hook (useFeedback) se encargarán de ocultar la lista si el usuario no es Admin/Supervisor.
  const { data: empleados, error } = await supabase
    .from('empleados')
    .select('id, usuario_id, nombre, apellidos, roles(nombre)')
    .eq('estado', 'activo')
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
      <div className="flex-1 min-h-0">
        <FeedbackClient 
          initialUser={user} 
          initialEmpleados={empleados || []} 
        />
      </div>
    </div>
  )
}