// src/services/performanceService.ts
import { createClient } from '@/src/lib/supabase/client';
import { EstadoActividad, PrioridadActividad } from '@/src/types/performance'

const supabase = createClient()

export const getEmpleadosParaAsignacion = async () => {
  const { data, error } = await supabase
    .from('empleados')
    .select('id, usuario_id, nombre, apellidos, roles(nombre)')
    .eq('estado', 'activo') 
    .is('deleted_at', null) 
    .order('nombre', { ascending: true });
  
  if (error) {
    console.error("Error al obtener empleados:", error.message);
    throw error;
  }
  return data || [];
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

  // Validación de tiempo: No se pueden crear tareas en el pasado
  if (limite.getTime() <= ahora.getTime()) {
    throw new Error('La fecha y hora límite deben ser mayores a la hora actual.');
  }

  // Normalizamos a ISO para consistencia en el cálculo de rachas
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

  // 2. ASIGNACIÓN A EMPLEADOS
  // Registramos la asignación. Para las rachas, esto nos dirá qué días
  // el empleado TENÍA tareas pendientes que completar.
  const filasAsignacion = empleadosIds.map(empId => ({
    actividad_id: nuevaActividad.id,
    empleado_id: parseInt(empId),
    estado_individual: 'asignada' as const,
    fecha_asignacion: ahora.toISOString() // Añadimos marca de tiempo de asignación
  }))

  const { error: asignError } = await supabase
    .from('asignacion_actividades')
    .insert(filasAsignacion)

  if (asignError) {
    await supabase.from('actividades').delete().eq('id', nuevaActividad.id);
    throw new Error('Error al asignar: ' + asignError.message);
  }

  return nuevaActividad
}