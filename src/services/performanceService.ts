import { createClient } from '@/src/lib/supabase/client';
import { EstadoActividad, PrioridadActividad, ActividadConRelaciones } from '@/src/types/performance'

const supabase = createClient()

/**
 * Obtiene empleados activos para asignarles tareas.
 * CORRECCIÓN: Se especifica la FK exacta para 'areas' (!empleados_area_id_fkey)
 */
export const getEmpleadosParaAsignacion = async () => {
  const { data, error } = await supabase
    .from('empleados')
    .select(`
      id, 
      usuario_id, 
      nombre, 
      apellidos, 
      foto_perfil_url,
      roles ( nombre ),
      areas!empleados_area_id_fkey ( nombre )  
    `) // ^^^ AQUÍ ESTÁ EL CAMBIO IMPORTANTE
    .eq('estado', 'activo') 
    .is('deleted_at', null) 
    .order('nombre', { ascending: true });
  
  if (error) {
    console.error("Error al obtener empleados:", error.message);
    return []; 
  }
  return data || [];
}

/**
 * Obtiene TODAS las actividades.
 */
export const getActividades = async () => {
  const { data, error } = await supabase
    .from('actividades')
    .select(`
      *,
      areas ( nombre ),
      asignacion_actividades (
        id,
        empleados ( id, usuario_id, nombre, apellidos, foto_perfil_url, estado )
      )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error("Error fetching activities:", error.message)
    throw error
  }

  return data as unknown as ActividadConRelaciones[]
}

export const crearNuevaActividad = async (
  actividad: {
    titulo: string
    descripcion: string
    prioridad: PrioridadActividad
    fecha_limite: string 
    area_id?: number 
  }, 
  empleadosIds: string[]
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  const { data: perfilAutor } = await supabase
    .from('empleados')
    .select('estado')
    .eq('usuario_id', user.id)
    .single();

  if (perfilAutor?.estado === 'baja') { 
    throw new Error('Tu cuenta está desactivada.');
  }

  const ahora = new Date();
  const limite = new Date(actividad.fecha_limite);

  if (isNaN(limite.getTime())) {
      throw new Error('La fecha límite no es válida.');
  }

  if (limite.getTime() <= ahora.getTime()) {
    throw new Error('La fecha y hora límite deben ser mayores a la hora actual.');
  }

  const fechaParaDB = limite.toISOString(); 

  // 1. CREACIÓN DE LA ACTIVIDAD
  const { data: nuevaActividad, error: actError } = await supabase
    .from('actividades')
    .insert([{
      ...actividad,
      fecha_limite: fechaParaDB,
      estado: 'pendiente' as EstadoActividad,
      created_by: user.id 
    }])
    .select()
    .single()

  if (actError) throw new Error('Error al crear: ' + actError.message);

  // 2. ASIGNACIÓN
  const filasAsignacion = empleadosIds
    .map(id => parseInt(id))
    .filter(id => !isNaN(id))
    .map(empId => ({
        actividad_id: nuevaActividad.id,
        empleado_id: empId,
        estado_individual: 'asignada' as const,
        fecha_asignacion: ahora.toISOString()
    }))

  if (filasAsignacion.length > 0) {
      const { error: asignError } = await supabase
        .from('asignacion_actividades')
        .insert(filasAsignacion)

      if (asignError) {
        await supabase.from('actividades').delete().eq('id', nuevaActividad.id);
        throw new Error('Error al asignar: ' + asignError.message);
      }
  }

  return nuevaActividad
}

export const actualizarEstadoActividad = async (id: number, nuevoEstado: string, userId: string) => {
  const updateData: any = { 
    estado: nuevoEstado,
    updated_at: new Date().toISOString(),
    updated_by: userId
  }

  if (nuevoEstado === 'completada' || nuevoEstado === 'no_realizada') {
    updateData.fecha_completada = new Date().toISOString()
  } else {
    updateData.fecha_completada = null
  }

  const { error } = await supabase
    .from('actividades')
    .update(updateData)
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export const eliminarActividad = async (id: number) => {
  const { error } = await supabase
    .from('actividades')
    .delete()
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export const evaluarActividad = async (
  id: number, 
  rating: number, 
  observaciones: string, 
  evaluadorId: string
) => {
  const { error } = await supabase
    .from('actividades')
    .update({
      calificacion: rating,
      observaciones_evaluacion: observaciones?.trim() || null,
      fecha_evaluada: new Date().toISOString(),
      evaluado_por_id: evaluadorId 
    })
    .eq('id', id)

  if (error) throw new Error(error.message)
}