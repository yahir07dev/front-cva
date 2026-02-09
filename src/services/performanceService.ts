// src/services/performanceService.ts
import { createClient } from '@/lib/supabase/client';
import { EstadoActividad, PrioridadActividad } from '@/types/performance'

const supabase = createClient()

export const getEmpleadosParaAsignacion = async () => {
  const { data, error } = await supabase
    .from('empleados')
    .select('id, usuario_id, nombre, apellidos, roles(nombre)')
    .eq('estado', 'activo')
    .is('deleted_at', null)
  
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

  const { data: nuevaActividad, error: actError } = await supabase
    .from('actividades')
    .insert([{
      ...actividad,
      estado: 'pendiente' as EstadoActividad,
      created_by: user.id 
    }])
    .select()
    .single()

  if (actError) throw new Error('Error al crear: ' + actError.message);

  const filasAsignacion = empleadosIds.map(empId => ({
    actividad_id: nuevaActividad.id,
    empleado_id: parseInt(empId),
    estado_individual: 'asignada' as const
  }))

  const { error: asignError } = await supabase
    .from('asignacion_actividades')
    .insert(filasAsignacion)

  if (asignError) throw new Error('Error al asignar: ' + asignError.message);

  return nuevaActividad
}