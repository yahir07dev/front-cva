import { createClient } from '@/src/lib/supabase/client'
import { TipoComentario } from '@/src/types/performance'

const supabase = createClient()

/**
 * Obtiene la lista de empleados para el sidebar.
 */
export const getEmpleadosParaFeedback = async () => {
  const { data, error } = await supabase
    .from('empleados')
    .select(`
      id, 
      usuario_id,
      nombre, 
      apellidos, 
      foto_perfil_url,
      roles ( nombre )
    `)
    .eq('estado', 'activo')
    .is('deleted_at', null)
    .order('nombre', { ascending: true })

  if (error) {
    console.error("Error al obtener empleados feedback:", error.message)
    return []
  }
  return data || []
}

/**
 * Obtiene los comentarios usando las relaciones explícitas.
 * IMPORTANTE: No usar comentarios (--) dentro del string select().
 */
export const getComentarios = async (empleadoId?: number) => {
  let query = supabase
    .from('comentarios_rendimiento')
    .select(`
      *,
      empleado:empleados!fk_comentarios_empleado (
        id, 
        usuario_id,
        nombre, 
        apellidos, 
        foto_perfil_url
      ),
      autor:empleados!fk_comentarios_autor (
        id,
        usuario_id,
        nombre,
        apellidos,
        foto_perfil_url
      )
    `)
    .order('created_at', { ascending: true })

  if (empleadoId) {
    query = query.eq('empleado_id', empleadoId)
  }

  const { data, error } = await query

  if (error) {
    console.error("Error al obtener comentarios:", error.message)
    throw error
  }

  return data || []
}

/**
 * Crea un comentario.
 */
export const crearComentario = async (
  comentario: {
    empleado_id: number,
    tipo: TipoComentario,
    titulo: string,
    descripcion: string
  }
) => {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) throw new Error('No hay sesión activa.')

  const { data, error } = await supabase
    .from('comentarios_rendimiento')
    .insert([{
      empleado_id: comentario.empleado_id,
      tipo: comentario.tipo,
      titulo: comentario.titulo,
      descripcion: comentario.descripcion,
      autor_id: user.id,
      created_by: user.id
    }])
    .select()
    .single()

  if (error) {
    console.error("Error creating comentario:", error.message)
    throw new Error(error.message)
  }

  return data
}

/**
 * Elimina un comentario por su ID.
 * (Las políticas RLS de Supabase asegurarán que solo el autor o un admin puedan borrarlo).
 */
export const eliminarComentario = async (id: number) => {
  const { error } = await supabase
    .from('comentarios_rendimiento')
    .delete()
    .eq('id', id)

  if (error) {
    console.error("Error al eliminar comentario:", error.message)
    throw new Error(error.message)
  }
}