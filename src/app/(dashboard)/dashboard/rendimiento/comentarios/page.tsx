import { createClient } from '@/src/lib/supabase/server'
import { redirect } from 'next/navigation'
import FeedbackClient from '@/src/components/perfomance/feedback/FeedbackClient' 
import AccessDenied from '@/src/components/shared/AccessDenied'
import { Metadata } from 'next'


export const metadata: Metadata = {
  title: 'Comentarios',
  description: 'Gestión de comentarios y retroalimentación del sistema'
}

export const dynamic = 'force-dynamic'

export default async function ComentariosPage() {
  const supabase = await createClient()

  // 1. OBTENER USUARIO
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. FETCH EN PARALELO (Perfil, Permisos y Empleados)
  const [perfilRes, permsRes, empleadosRes] = await Promise.all([
    supabase.from('empleados').select('estado').eq('usuario_id', user.id).single(),
    supabase.rpc('get_my_permissions_slugs'),
    supabase.from('empleados')
      .select('id, usuario_id, nombre, apellidos, foto_perfil_url, estado, roles(nombre)') 
      .eq('estado', 'activo') 
      .is('deleted_at', null)
      .order('nombre', { ascending: true })
  ])

  // 3. BLINDAJE DE ESTADO
  if (perfilRes.data?.estado === 'baja') {
    redirect('/login?error=cuenta_desactivada')
  }

  // 4. LÓGICA DE PERMISOS (Servidor)
  const permisos = permsRes.data || []
  const isAdmin = permisos.includes('acceso_total')
  
  // Define accesos exactos
  const canAccess = permisos.includes('comentarios.read') || isAdmin
  const canManage = permisos.includes('comentarios.manage') || isAdmin // Reemplaza con tu slug real
  const canCreate = permisos.includes('comentarios.create') || isAdmin // Reemplaza con tu slug real

  if (!canAccess) {
    return (
      <AccessDenied 
        message="No tienes los permisos necesarios para acceder al módulo de Feedback y Comentarios." 
      />
    )
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
          initialEmpleados={empleadosRes.data || []} 
          userId={user.id}
          userEstado={perfilRes.data?.estado || 'activo'}
          canManage={canManage}
          canCreate={canCreate}
        />
      </div>
    </div>
  )
}