import { createClient } from '@/src/lib/supabase/client';

const supabase = createClient();

/**
 * Obtiene todos los roles junto con sus permisos asignados.
 */
export const getRolesConPermisos = async () => {
  const { data, error } = await supabase
    .from('roles')
    .select(`
      id, 
      nombre, 
      descripcion, 
      es_sistema, 
      created_at,
      rol_permisos (
        permisos ( id, slug, modulo )
      )
    `)
    .is('deleted_at', null)
    .order('id', { ascending: true });

  if (error) {
    console.error("Error al obtener roles:", error.message);
    throw error;
  }
  return data || [];
}

/**
 * Obtiene el catálogo completo de permisos disponibles para asignar.
 */
export const getCatalogoPermisos = async () => {
  const { data, error } = await supabase
    .from('permisos')
    .select('*')
    .is('deleted_at', null)
    .order('modulo', { ascending: true })
    .order('slug', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Crea un nuevo rol y le asigna sus permisos.
 */
export const crearRol = async (
  rol: { nombre: string; descripcion: string },
  permisosIds: number[]
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  // 1. Crear el Rol
  const { data: nuevoRol, error: rolError } = await supabase
    .from('roles')
    .insert([{
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      es_sistema: false, // Los roles creados manualmente no son de sistema
      created_by: user.id
    }])
    .select()
    .single();

  if (rolError) throw new Error('Error al crear el rol: ' + rolError.message);

  // 2. Asignar los permisos en la tabla pivote
  if (permisosIds.length > 0) {
    const filasPermisos = permisosIds.map(permisoId => ({
      rol_id: nuevoRol.id,
      permiso_id: permisoId,
      created_by: user.id
    }));

    const { error: asigError } = await supabase
      .from('rol_permisos')
      .insert(filasPermisos);

    if (asigError) {
      // Rollback manual si falla la asignación
      await supabase.from('roles').delete().eq('id', nuevoRol.id);
      throw new Error('Error al asignar permisos: ' + asigError.message);
    }
  }

  return nuevoRol;
}

/**
 * Actualiza un rol y sincroniza sus permisos.
 */
export const actualizarRol = async (
  id: number,
  rol: { nombre: string; descripcion: string },
  permisosIds: number[]
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  // 1. Actualizar datos base del rol
  const { error: rolError } = await supabase
    .from('roles')
    .update({
      nombre: rol.nombre,
      descripcion: rol.descripcion,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq('id', id);

  if (rolError) throw new Error('Error al actualizar el rol: ' + rolError.message);

  // 2. Borrar permisos anteriores
  await supabase
    .from('rol_permisos')
    .delete()
    .eq('rol_id', id);

  // 3. Insertar los nuevos permisos
  if (permisosIds.length > 0) {
    const filasPermisos = permisosIds.map(permisoId => ({
      rol_id: id,
      permiso_id: permisoId,
      created_by: user.id
    }));

    const { error: asigError } = await supabase
      .from('rol_permisos')
      .insert(filasPermisos);

    if (asigError) throw new Error('Error al actualizar permisos: ' + asigError.message);
  }
}

/**
 * Elimina un rol (Soft delete o borrado físico dependiendo de tus reglas).
 */
export const eliminarRol = async (id: number) => {
  // Opcional: Validar que no haya empleados usando este rol antes de borrarlo
  const { count } = await supabase
    .from('empleados')
    .select('*', { count: 'exact', head: true })
    .eq('rol_id', id);

  if (count && count > 0) {
    throw new Error('No puedes eliminar este rol porque hay empleados que lo están usando.');
  }

  // Borramos primero la relación de permisos
  await supabase.from('rol_permisos').delete().eq('rol_id', id);

  // Luego borramos el rol
  const { error } = await supabase
    .from('roles')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}