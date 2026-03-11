import { createClient } from '@/src/lib/supabase/client'
import { TipoComentario } from '@/src/types/performance'

const supabase = createClient()

/**
 * Obtiene la lista de empleados activos para el sidebar.
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
      estado,
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
 * Obtiene los comentarios.
 */
export const getComentarios = async (empleadoId?: number | string) => {
  if (empleadoId && isNaN(Number(empleadoId))) {
      console.warn("Se intentó buscar comentarios con un ID inválido (posible UUID):", empleadoId);
      return [];
  }

  let query = supabase
    .from('comentarios_rendimiento')
    .select(`
      *,
      empleado:empleados!fk_comentarios_empleado (
        id, usuario_id, nombre, apellidos, foto_perfil_url, estado
      ),
      autor:empleados!fk_comentarios_autor (
        id, usuario_id, nombre, apellidos, foto_perfil_url, estado
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
 * LÓGICA AUTOMÁTICA DE PUNTOS
 */
const calcularValorPuntos = (tipo: TipoComentario): number => {
  switch (tipo) {
    case 'positivo':
      return 20; // Bono fuerte
    case 'mejora':
      return -10; // Penalización leve
    case 'negativo':
      return -30; // Castigo estricto
    default:
      return 0;
  }
}

/**
 * Crea un comentario validando estado del autor y asignando puntos automáticos.
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

  // Verificar que el autor no esté de baja
  const { data: perfilAutor } = await supabase
    .from('empleados')
    .select('estado')
    .eq('usuario_id', user.id)
    .single()

  if (perfilAutor?.estado === 'baja') {
    throw new Error('Cuenta desactivada. No tienes permitido enviar feedback.')
  }

  // Obtenemos el valor numérico basado en el tipo
  const puntosAutomaticos = calcularValorPuntos(comentario.tipo);

  const { data, error } = await supabase
    .from('comentarios_rendimiento')
    .insert([{
      empleado_id: comentario.empleado_id,
      tipo: comentario.tipo,
      titulo: comentario.titulo,
      descripcion: comentario.descripcion,
      valor_puntos: puntosAutomaticos, // <-- AQUÍ SE GUARDA AUTOMÁTICAMENTE
      autor_id: user.id,
      created_by: user.id
    }])
    .select()
    .single()

  if (error) {
    console.error("Error creando comentario:", error.message)
    throw new Error(error.message)
  }

  return data
}

/**
 * Elimina un comentario por ID.
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