import { createClient } from '@/src/lib/supabase/client'

const supabase = createClient()

export const obtenerDatosReporte = async () => {
  // Obtenemos la sesión para el respaldo de avatar de Google si es el usuario actual
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user?.id;
  const googleAvatar = session?.user?.user_metadata?.avatar_url;

  // 1. Traer Actividades Finalizadas (Éxito y Fallo)
  const { data: actividades, error: errAct } = await supabase
    .from('actividades')
    .select(`
      id,
      titulo,
      calificacion,
      fecha_evaluada,
      estado,
      asignaciones:asignacion_actividades!inner(
        empleado:empleados!inner(
          id, 
          usuario_id,
          nombre, 
          apellidos, 
          foto_perfil_url, 
          estado
        )
      )
    `)
    .in('estado', ['completada', 'no_realizada']) 
    .is('deleted_at', null)
    .eq('asignacion_actividades.empleados.estado', 'activo')
    .order('fecha_evaluada', { ascending: true });

  if (errAct) {
    console.error("Error fetching actividades reporte:", errAct);
    throw errAct;
  }

  // --- LÓGICA DE FOTO INTELIGENTE Y PROCESAMIENTO ---
  // Procesamos actividades para inyectar avatar de Google si falta el de la BD
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

  // Retornamos solo actividades; feedback se envía vacío para no romper el resto de la App
  return { 
    actividades: actividadesProcesadas || [], 
    feedback: [] 
  };
}