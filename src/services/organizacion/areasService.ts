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

// 🟢 FUNCIÓN AUXILIAR PARA MOVER EMPLEADO
export const asignarEmpleadoAArea = async (empleadoId: number, areaId: number | null) => {
  const { error } = await supabase
    .from('empleados')
    .update({ area_id: areaId })
    .eq('id', empleadoId);

  if (error) throw error;
}

// 🟢 MODIFICADA: Crea el área Y asigna al encargado a esa área
export const crearArea = async (nombre: string, descripcion: string, encargado_id?: number) => {
  // 1. Insertamos y usamos .select().single() para obtener el ID generado
  const { data: nuevaArea, error } = await supabase
    .from('areas')
    .insert([{ nombre, descripcion, encargado_id }])
    .select()
    .single();
  
  if (error) throw error;

  // 2. Si se definió un encargado, lo movemos automáticamente a esta nueva área
  if (encargado_id && nuevaArea) {
    await asignarEmpleadoAArea(encargado_id, nuevaArea.id);
  }
}

// 🟢 MODIFICADA: Al editar, si cambia el encargado, también lo movemos
export const actualizarArea = async (id: number, updates: { nombre?: string, descripcion?: string, encargado_id?: number | null }) => {
  const { error } = await supabase
    .from('areas')
    .update(updates)
    .eq('id', id);

  if (error) throw error;

  // Si la actualización incluye un nuevo encargado (y no es null), lo movemos al área
  if (updates.encargado_id) {
    await asignarEmpleadoAArea(updates.encargado_id, id);
  }
}

export const eliminarArea = async (id: number) => {
  // Soft delete
  const { error } = await supabase
    .from('areas')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}