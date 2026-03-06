import { createClient } from '@/src/lib/supabase/client'

const supabase = createClient()

export const obtenerMisNotificaciones = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No hay sesión activa.')

  const { data, error } = await supabase
    .from('notificaciones')
    .select('*')
    .eq('usuario_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20); // Traemos las últimas 20 para no saturar la vista

  if (error) throw error;
  return data || [];
}

export const marcarComoLeida = async (notificacionId: number) => {
  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('id', notificacionId);

  if (error) throw error;
}

export const marcarTodasComoLeidas = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return;

  const { error } = await supabase
    .from('notificaciones')
    .update({ leida: true })
    .eq('usuario_id', user.id)
    .eq('leida', false);

  if (error) throw error;
}

// ... (tus funciones anteriores se quedan igual)

export const eliminarNotificacion = async (notificacionId: number) => {
  const { error } = await supabase
    .from('notificaciones')
    .delete()
    .eq('id', notificacionId);

  if (error) throw error;
}

export const limpiarTodasLasNotificaciones = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return;

  const { error } = await supabase
    .from('notificaciones')
    .delete()
    .eq('usuario_id', user.id);

  if (error) throw error;
}