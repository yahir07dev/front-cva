import { createClient } from '@/src/lib/supabase/client';

const supabase = createClient();

// Función auxiliar para validar la sesión y estado del usuario (Como en todos tus servicios)
const validarAcceso = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  const { data: perfilAutor } = await supabase
    .from('empleados')
    .select('estado')
    .eq('usuario_id', user.id)
    .single();

  if (perfilAutor?.estado === 'baja') { 
    throw new Error('Tu cuenta está desactivada. No puedes realizar esta acción.');
  }

  return user;
};

export const obtenerNotas = async () => {
  // Incluso para leer, validamos que no sea un usuario dado de baja
  await validarAcceso();

  const { data, error } = await supabase
    .from('notas_globales')
    .select('*') // <-- CORREGIDO: Eliminada la relación problemática con auth.users
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const guardarNota = async (titulo: string, contenidoJson: any, colorFondo: string = '#fdf6e3') => {
  const user = await validarAcceso();

  const { data, error } = await supabase
    .from('notas_globales')
    .insert([{
      titulo,
      contenido_json: contenidoJson,
      creado_por_id: user.id,
      color_fondo: colorFondo
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const actualizarNota = async (id: string, titulo: string, contenidoJson: any, colorFondo: string) => {
  await validarAcceso();

  const { data, error } = await supabase
    .from('notas_globales')
    .update({
      titulo,
      contenido_json: contenidoJson,
      color_fondo: colorFondo,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

export const eliminarNota = async (id: string) => {
  await validarAcceso();

  const { error } = await supabase
    .from('notas_globales')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
};

export const togglePinNota = async (id: string, isPinned: boolean) => {
  await validarAcceso();

  const { error } = await supabase
    .from('notas_globales')
    .update({ 
      pinned: !isPinned,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) throw new Error(error.message);
};