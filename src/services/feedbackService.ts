// src/services/feedbackService.ts
import { createClient } from '@/src/lib/supabase/client'
import { TipoComentario } from '@/src/types/performance'

const supabase = createClient()

/**
 * Obtiene los comentarios de rendimiento.
 * * NOTA: La seguridad (RLS) en la base de datos ya filtra automáticamente:
 * - Si es Admin/Supervisor: Puede ver los de todos.
 * - Si es Empleado: Solo recibe los suyos.
 * * @param empleadoId (Opcional) Si se pasa, filtra los comentarios de ese empleado específico.
 */
export const getComentarios = async (empleadoId?: number) => {
  let query = supabase
    .from('comentarios_rendimiento')
    .select(`
      *,
      empleado:empleados!empleado_id (
        id, 
        nombre, 
        apellidos, 
        foto_perfil_url
      )
    `)
    // Ordenamos por fecha ascendente (antiguos arriba, nuevos abajo) para estilo chat
    .order('created_at', { ascending: true })

  // Si el componente pide filtrar por un usuario específico (ej. Admin seleccionando a Juan)
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
 * Crea un nuevo comentario de retroalimentación.
 * Requiere que el usuario tenga permiso 'comentarios.create'.
 */
export const crearComentario = async (
  comentario: {
    empleado_id: number,
    tipo: TipoComentario,
    titulo: string,
    descripcion: string
  }
) => {
  // 1. Obtener usuario actual para el 'autor_id'
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No hay sesión activa para crear el comentario.')
  }

  // 2. Insertar en la base de datos
  const { data, error } = await supabase
    .from('comentarios_rendimiento')
    .insert([{
      empleado_id: comentario.empleado_id,
      tipo: comentario.tipo,
      titulo: comentario.titulo,
      descripcion: comentario.descripcion,
      autor_id: user.id,   // El usuario logueado es el autor
      created_by: user.id  // Auditoría
    }])
    .select()
    .single()

  if (error) {
    console.error("Error al crear comentario:", error.message)
    throw new Error(error.message)
  }

  return data
}