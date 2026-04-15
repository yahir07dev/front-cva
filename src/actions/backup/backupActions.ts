'use server'

import { createClient } from '@/src/lib/supabase/server'

export async function generarBackupCompletoAction() {
  const supabase = await createClient();
  
  // 1. Validación de seguridad (Opcional, pero recomendada)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("No estás autorizado para realizar esta acción.");

  // 2. Tu esquema completo (25 tablas)
  const tablas = [
    'actividades', 'areas', 'asignacion_actividades', 'asignacion_cursos',
    'asistencias', 'comentarios_rendimiento', 'cursos', 'empleados',
    'evaluaciones_resultados', 'expedientes', 'huellas_biometricas',
    'notas_categorias', 'notas_globales', 'notificaciones', 'opciones_pregunta',
    'pagos_prestamo', 'permisos', 'plantilla_empleados', 'plantillas_nomina',
    'preguntas', 'prestamos', 'registros_nomina', 'respuestas_empleado',
    'rol_permisos', 'roles'
  ];

  // 3. Contenedor del Backup
  const backupData: Record<string, any[]> = {};

  // 4. Ejecución en paralelo de las 25 consultas
  const promesas = tablas.map(async (tabla) => {
    // Solo traemos los que NO están marcados como eliminados (si la tabla tiene esa columna)
    // Para no complicarlo y asegurar que traiga todo, hacemos un select full.
    // Si necesitas filtrar los deleted_at, lo ideal es hacerlo por tabla específica.
    const { data, error } = await supabase.from(tabla).select('*');
    
    if (error) {
      console.warn(`[Backup] Error al leer tabla ${tabla}:`, error.message);
      backupData[tabla] = []; 
    } else {
      backupData[tabla] = data || [];
    }
  });

  await Promise.all(promesas);

  // 5. Devolvemos el objeto estructurado
  return {
    metadatos: {
      fecha_generacion: new Date().toISOString(),
      tablas_procesadas: tablas.length,
      generado_por: user.id
    },
    datos: backupData
  };
}