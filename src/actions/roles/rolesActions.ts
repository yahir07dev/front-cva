'use server'

import { createClient } from '@/src/lib/supabase/server'

// LECTURA DE ROLES
export const getRolesConPermisosAction = async () => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('roles')
    .select(`id, nombre, descripcion, es_sistema, created_at, rol_permisos ( permisos ( id, slug, modulo ) )`)
    .is('deleted_at', null)
    .order('id', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

// LECTURA DE CATÁLOGO
export const getCatalogoPermisosAction = async () => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('permisos')
    .select('*')
    .is('deleted_at', null)
    .order('modulo', { ascending: true })
    .order('slug', { ascending: true })

  if (error) throw new Error(error.message)
  return data || []
}

// CREAR ROL
export const crearRolAction = async (rol: { nombre: string; descripcion: string }, permisosIds: number[]) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sesión no válida.')

  const { data: nuevoRol, error: rolError } = await supabase
    .from('roles')
    .insert([{ nombre: rol.nombre, descripcion: rol.descripcion, es_sistema: false, created_by: user.id }])
    .select().single()

  if (rolError) throw new Error('Error al crear el rol: ' + rolError.message)

  if (permisosIds.length > 0) {
    const filasPermisos = permisosIds.map(permisoId => ({ rol_id: nuevoRol.id, permiso_id: permisoId, created_by: user.id }))
    const { error: asigError } = await supabase.from('rol_permisos').insert(filasPermisos)

    if (asigError) {
      await supabase.from('roles').delete().eq('id', nuevoRol.id)
      throw new Error('Error al asignar permisos: ' + asigError.message)
    }
  }
  return nuevoRol
}

// ACTUALIZAR ROL (CORREGIDO - ESTRATEGIA DIFF)
export const actualizarRolAction = async (id: number, rol: { nombre: string; descripcion: string }, permisosIds: number[]) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Sesión no válida.')

  // 1. Actualizamos el nombre y descripción del rol
  const { error: rolError } = await supabase
    .from('roles')
    .update({ nombre: rol.nombre, descripcion: rol.descripcion, updated_at: new Date().toISOString(), updated_by: user.id })
    .eq('id', id)

  if (rolError) throw new Error('Error al actualizar el rol: ' + rolError.message)

  // 2. Obtenemos los permisos que tiene actualmente el rol
  const { data: currentPerms } = await supabase.from('rol_permisos').select('permiso_id').eq('rol_id', id);
  const currentPermsIds = currentPerms?.map(p => p.permiso_id) || [];

  // 3. Calculamos la diferencia (Cuáles agregar y cuáles quitar)
  const toAdd = permisosIds.filter(pid => !currentPermsIds.includes(pid));
  const toDelete = currentPermsIds.filter(pid => !permisosIds.includes(pid));

  // 4. AGREGAMOS PRIMERO (Para que RLS no te cierre la puerta en la cara si eres superadmin)
  if (toAdd.length > 0) {
    const filasAdd = toAdd.map(permisoId => ({ rol_id: id, permiso_id: permisoId, created_by: user.id }))
    const { error: addError } = await supabase.from('rol_permisos').insert(filasAdd)
    if (addError) throw new Error('Error al agregar nuevos permisos: ' + addError.message)
  }

  // 5. ELIMINAMOS DESPUÉS
  if (toDelete.length > 0) {
    const { error: delError } = await supabase.from('rol_permisos').delete().eq('rol_id', id).in('permiso_id', toDelete);
    if (delError) throw new Error('Error al remover permisos: ' + delError.message)
  }
}

// ELIMINAR ROL
export const eliminarRolAction = async (id: number) => {
  const supabase = await createClient()
  const { count } = await supabase.from('empleados').select('*', { count: 'exact', head: true }).eq('rol_id', id)

  if (count && count > 0) {
    throw new Error('No puedes eliminar este rol porque hay empleados que lo están usando.')
  }

  await supabase.from('rol_permisos').delete().eq('rol_id', id)
  const { error } = await supabase.from('roles').delete().eq('id', id)

  if (error) throw new Error(error.message)
}