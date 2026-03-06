import { createClient } from '@/src/lib/supabase/client'

const supabase = createClient()

export const obtenerDatosReporte = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;
  const googleAvatar = session?.user?.user_metadata?.avatar_url;

  // 1. TRAER ACTIVIDADES (Como ya lo tenías)
  const { data: actividades, error: errorAct } = await supabase
    .from('actividades')
    .select(`
      id, titulo, calificacion, fecha_evaluada, estado,
      asignaciones:asignacion_actividades!inner(
        empleado:empleados!inner(
          id, usuario_id, nombre, apellidos, foto_perfil_url, estado
        )
      )
    `)
    .in('estado', ['completada', 'no_realizada']) 
    .is('deleted_at', null)
    .eq('asignacion_actividades.empleados.estado', 'activo');

  if (errorAct) throw errorAct;

  // 2. TRAER COMENTARIOS / FEEDBACK (Nuevo)
  const { data: comentarios, error: errorCom } = await supabase
    .from('comentarios_rendimiento')
    .select(`
      id, empleado_id, valor_puntos, fecha,
      empleado:empleados!fk_comentarios_empleado(estado)
    `)
    .is('deleted_at', null)
    .eq('empleados.estado', 'activo');

  if (errorCom) throw errorCom;

  // Procesar fotos de actividades
  const actividadesProcesadas = actividades?.map(act => ({
    ...act,
    asignaciones: act.asignaciones.map((asig: any) => {
      const emp = asig.empleado;
      if (emp && emp.usuario_id === currentUserId && googleAvatar) {
        if (!emp.foto_perfil_url || emp.foto_perfil_url.trim() === '') {
          emp.foto_perfil_url = googleAvatar;
        }
      }
      return asig;
    })
  }));

  return { 
    actividades: actividadesProcesadas || [],
    comentarios: comentarios || [] // Devolvemos los comentarios
  };
}