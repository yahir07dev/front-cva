import { createClient } from '@/src/lib/supabase/client'

const supabase = createClient()

export const obtenerDatosReporte = async () => {
  
  // 1. Traer Actividades Evaluadas (Con estrellas)
  // Usamos !inner para asegurar que traiga solo las que tienen asignación y empleado válido
  const { data: actividades, error: errAct } = await supabase
    .from('actividades')
    .select(`
      id,
      titulo,
      calificacion,
      fecha_evaluada,
      asignaciones:asignacion_actividades!inner(
        empleado:empleados(id, nombre, apellidos, foto_perfil_url)
      )
    `)
    .eq('estado', 'completada')
    .not('calificacion', 'is', null) // Solo las evaluadas
    .order('fecha_evaluada', { ascending: true })

  if (errAct) {
    console.error("Error fetching actividades reporte:", errAct)
    throw errAct
  }

  // 2. Traer Feedback (Comentarios)
  const { data: feedback, error: errFeed } = await supabase
    .from('comentarios_rendimiento')
    .select(`
      id,
      tipo,
      created_at,
      empleado:empleados!inner(id, nombre, apellidos)
    `)
    .order('created_at', { ascending: true })

  if (errFeed) {
    console.error("Error fetching feedback reporte:", errFeed)
    throw errFeed
  }

  return { actividades, feedback }
}