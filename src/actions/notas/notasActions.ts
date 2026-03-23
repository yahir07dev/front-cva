'use server'

import { createClient } from '@/src/lib/supabase/server'

// LECTURA (Cero Cascadas, se usa en page.tsx)
export const obtenerNotasAction = async () => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notas_globales')
    .select('*')
    .order('pinned', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
};

// CREACIÓN
export const guardarNotaAction = async (titulo: string, contenidoJson: any, colorFondo: string = '#fdf6e3') => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  const { data, error } = await supabase
    .from('notas_globales')
    .insert([{ titulo, contenido_json: contenidoJson, creado_por_id: user.id, color_fondo: colorFondo }])
    .select().single();

  if (error) throw new Error(error.message);
  return data;
};

// ACTUALIZACIÓN
export const actualizarNotaAction = async (id: string, titulo: string, contenidoJson: any, colorFondo: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('notas_globales')
    .update({ titulo, contenido_json: contenidoJson, color_fondo: colorFondo, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select().single();

  if (error) throw new Error(error.message);
  return data;
};

// ELIMINACIÓN
export const eliminarNotaAction = async (id: string) => {
  const supabase = await createClient();
  const { error } = await supabase.from('notas_globales').delete().eq('id', id);
  if (error) throw new Error(error.message);
};

// PIN
export const togglePinNotaAction = async (id: string, isPinned: boolean) => {
  const supabase = await createClient();
  const { error } = await supabase
    .from('notas_globales')
    .update({ pinned: !isPinned, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
};