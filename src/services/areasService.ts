import { createClient } from '@/src/lib/supabase/client';

const supabase = createClient();

export const getAreasConEncargado = async () => {
  const { data, error } = await supabase
    .from('areas')
    .select(`
      id, nombre, descripcion, encargado_id,
      encargado:empleados!fk_areas_encargado(id, nombre, apellidos, foto_perfil_url)
    `)
    .is('deleted_at', null)
    .order('nombre', { ascending: true });

  if (error) {
    console.error("Error al obtener áreas:", error.message);
    throw error;
  }
  return data || [];
}

export const getEmpleadosActivos = async () => {
  const { data, error } = await supabase
    .from('empleados')
    .select('id, nombre, apellidos, foto_perfil_url, area_id')
    .eq('estado', 'activo')
    .is('deleted_at', null)
    .order('nombre', { ascending: true });

  if (error) throw error;
  return data || [];
}

export const crearArea = async (nombre: string, descripcion: string, encargado_id?: number) => {
  const { error } = await supabase
    .from('areas')
    .insert([{ nombre, descripcion, encargado_id }]);
  
  if (error) throw error;
}

export const asignarEmpleadoAArea = async (empleadoId: number, areaId: number | null) => {
  const { error } = await supabase
    .from('empleados')
    .update({ area_id: areaId })
    .eq('id', empleadoId);

  if (error) throw error;
}

// --- NUEVAS FUNCIONES PARA EDITAR Y BORRAR ---

export const actualizarArea = async (id: number, updates: { nombre?: string, descripcion?: string, encargado_id?: number | null }) => {
  const { error } = await supabase
    .from('areas')
    .update(updates)
    .eq('id', id);

  if (error) throw error;
}

export const eliminarArea = async (id: number) => {
  // Soft delete: solo marcamos la fecha de borrado
  const { error } = await supabase
    .from('areas')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}