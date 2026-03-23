'use server'

import { createClient } from '@/src/lib/supabase/server'

// HELPER INTERNO
const asignarEmpleadoAAreaServer = async (empleadoId: number, areaId: number | null) => {
  const supabase = await createClient()
  const { error } = await supabase.from('empleados').update({ area_id: areaId }).eq('id', empleadoId);
  if (error) throw new Error(error.message);
}

export const crearAreaAction = async (nombre: string, descripcion: string, encargado_id?: number) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  const { data: nuevaArea, error } = await supabase
    .from('areas')
    .insert([{ nombre, descripcion, encargado_id }])
    .select()
    .single();
  
  if (error) throw new Error('Error al crear el área.');

  if (encargado_id && nuevaArea) {
    await asignarEmpleadoAAreaServer(encargado_id, nuevaArea.id);
  }
}

export const actualizarAreaAction = async (id: number, updates: { nombre?: string, descripcion?: string, encargado_id?: number | null }) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  const { error } = await supabase.from('areas').update(updates).eq('id', id);
  if (error) throw new Error('Error al actualizar el área.');

  if (updates.encargado_id) {
    await asignarEmpleadoAAreaServer(updates.encargado_id, id);
  }
}

export const eliminarAreaAction = async (id: number) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  const { error } = await supabase.from('areas').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  if (error) throw new Error('Error al eliminar el área.');
}

export const asignarEmpleadoAAreaAction = async (empId: number, areaId: number | null) => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  // Validación de seguridad adicional en el servidor
  const { data: perms } = await supabase.rpc('get_my_permissions_slugs');
  const permisos = perms || [];
  if (!permisos.includes('acceso_total')) {
    throw new Error('No tienes permisos de Administrador para reasignar empleados.');
  }

  await asignarEmpleadoAAreaServer(empId, areaId);
}