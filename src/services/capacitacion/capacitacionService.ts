import { createClient } from '@/src/lib/supabase/client';
import { CursoCapacitacion, RespuestaEnvio } from '@/src/types/capacitacion';

const supabase = createClient();

/**
 * LECTURA DE CURSOS
 * Ahora incluye evaluaciones_resultados para mostrar la calificación real de cada empleado.
 */
export const getCursos = async () => {
  const { data, error } = await supabase
    .from('cursos')
    .select(`
      *,
      preguntas (
        id, texto_pregunta, puntaje, orden,
        opciones_pregunta ( id, texto_opcion, es_correcta, orden )
      ),
      asignacion_cursos (
        id, estado, fecha_asignacion, fecha_completado, notas_empleado, empleado_id,
        empleados ( id, usuario_id, nombre, apellidos, foto_perfil_url )
      )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error al obtener cursos:", error.message);
    throw new Error(error.message);
  }

  // Para cada curso, traemos las evaluaciones de los empleados que completaron
  const cursosConCalificaciones = await Promise.all(
    (data || []).map(async (curso) => {
      // IDs de empleados que completaron este curso
      const empleadosCompletados = (curso.asignacion_cursos || [])
        .filter((a: any) => a.estado === 'completado')
        .map((a: any) => a.empleado_id)
        .filter(Boolean);

      let evaluacionesPorEmpleado: Record<number, number> = {};

      if (empleadosCompletados.length > 0) {
        // Traemos la última evaluación de cada empleado para este curso
        const { data: evaluaciones } = await supabase
          .from('evaluaciones_resultados')
          .select('empleado_id, calificacion, created_at')
          .eq('curso_id', curso.id)
          .in('empleado_id', empleadosCompletados)
          .order('created_at', { ascending: false });

        // Quedamos solo con la más reciente por empleado
        (evaluaciones || []).forEach((ev: any) => {
          if (evaluacionesPorEmpleado[ev.empleado_id] === undefined) {
            evaluacionesPorEmpleado[ev.empleado_id] = ev.calificacion;
          }
        });
      }

      // Inyectamos la calificación en cada asignacion_cursos
      const asignacionesConNota = (curso.asignacion_cursos || []).map((asig: any) => ({
        ...asig,
        calificacion: evaluacionesPorEmpleado[asig.empleado_id] ?? null,
      }));

      return {
        ...curso,
        asignacion_cursos: asignacionesConNota,
        preguntas: (curso.preguntas || [])
          .sort((a: any, b: any) => a.orden - b.orden)
          .map((p: any) => ({
            ...p,
            opciones_pregunta: (p.opciones_pregunta || []).sort((a: any, b: any) => a.orden - b.orden),
          })),
      };
    })
  );

  return cursosConCalificaciones;
};

/**
 * CREAR CURSO
 */
export const crearCursoCompleto = async (curso: CursoCapacitacion, empleadosIds: number[]) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa');

  const { data: nuevoCurso, error: errorCurso } = await supabase
    .from('cursos')
    .insert([{
      titulo: curso.titulo,
      descripcion: curso.descripcion,
      url_youtube: curso.url_youtube,
      duracion_minutos: curso.duracion_minutos,
      tiempo_limite_examen: curso.tiempo_limite_examen || 0, // 👈 Se inyecta el tiempo límite (0 por defecto)
      es_obligatorio: curso.es_obligatorio,
      created_by: user.id,
    }])
    .select()
    .single();

  if (errorCurso) throw new Error('Error al crear curso: ' + errorCurso.message);

  if (empleadosIds.length > 0) {
    const asignaciones = empleadosIds.map(empId => ({
      curso_id: nuevoCurso.id,
      empleado_id: empId,
      created_by: user.id,
    }));
    await supabase.from('asignacion_cursos').insert(asignaciones);
  }

  if (curso.preguntas && curso.preguntas.length > 0) {
    for (const [indexP, preg] of curso.preguntas.entries()) {
      const { data: nuevaPregunta } = await supabase
        .from('preguntas')
        .insert([{
          curso_id: nuevoCurso.id,
          texto_pregunta: preg.texto_pregunta,
          puntaje: preg.puntaje || 10,
          orden: indexP,
          created_by: user.id,
        }])
        .select()
        .single();

      if (nuevaPregunta && preg.opciones && preg.opciones.length > 0) {
        const opciones = preg.opciones.map((opc, indexO) => ({
          pregunta_id: nuevaPregunta.id,
          texto_opcion: opc.texto_opcion,
          es_correcta: opc.es_correcta,
          orden: indexO,
          created_by: user.id,
        }));
        await supabase.from('opciones_pregunta').insert(opciones);
      }
    }
  }

  return nuevoCurso;
};

/**
 * ACTUALIZAR CURSO
 */
export const actualizarCursoCompleto = async (cursoId: number, curso: CursoCapacitacion, empleadosIds: number[]) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa');

  const { error: errorCurso } = await supabase
    .from('cursos')
    .update({
      titulo: curso.titulo,
      descripcion: curso.descripcion,
      url_youtube: curso.url_youtube,
      duracion_minutos: curso.duracion_minutos,
      tiempo_limite_examen: curso.tiempo_limite_examen || 0, // 👈 Se actualiza el tiempo límite
      es_obligatorio: curso.es_obligatorio,
      updated_at: new Date().toISOString(),
      updated_by: user.id,
    })
    .eq('id', cursoId);

  if (errorCurso) throw new Error('Error al actualizar curso: ' + errorCurso.message);

  const { data: asignacionesActuales } = await supabase
    .from('asignacion_cursos')
    .select('id, empleado_id, estado')
    .eq('curso_id', cursoId);

  const actualesIds = asignacionesActuales?.map(a => a.empleado_id) || [];
  const nuevosAInsertar = empleadosIds.filter(id => !actualesIds.includes(id));
  const aBorrar = asignacionesActuales
    ?.filter(a => !empleadosIds.includes(a.empleado_id) && a.estado === 'asignado')
    .map(a => a.id) || [];

  if (nuevosAInsertar.length > 0) {
    const insertData = nuevosAInsertar.map(empId => ({ curso_id: cursoId, empleado_id: empId, created_by: user.id }));
    await supabase.from('asignacion_cursos').insert(insertData);
  }
  if (aBorrar.length > 0) {
    await supabase.from('asignacion_cursos').delete().in('id', aBorrar);
  }

  if (curso.preguntas) {
    for (const [indexP, preg] of curso.preguntas.entries()) {
      let preguntaId = preg.id;

      if (preguntaId) {
        await supabase.from('preguntas')
          .update({ texto_pregunta: preg.texto_pregunta, orden: indexP, updated_at: new Date().toISOString() })
          .eq('id', preguntaId);
      } else {
        const { data: nuevaPregunta } = await supabase.from('preguntas')
          .insert([{ curso_id: cursoId, texto_pregunta: preg.texto_pregunta, puntaje: preg.puntaje || 10, orden: indexP, created_by: user.id }])
          .select().single();
        preguntaId = nuevaPregunta?.id;
      }

      if (preguntaId && preg.opciones) {
        for (const [indexO, opc] of preg.opciones.entries()) {
          if (opc.id) {
            await supabase.from('opciones_pregunta')
              .update({ texto_opcion: opc.texto_opcion, es_correcta: opc.es_correcta, orden: indexO })
              .eq('id', opc.id);
          } else {
            await supabase.from('opciones_pregunta')
              .insert([{ pregunta_id: preguntaId, texto_opcion: opc.texto_opcion, es_correcta: opc.es_correcta, orden: indexO, created_by: user.id }]);
          }
        }
      }
    }
  }
};

/**
 * ELIMINAR CURSO (Soft Delete)
 */
export const eliminarCurso = async (id: number) => {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('cursos')
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: user?.id,
      esta_activo: false,
    })
    .eq('id', id);

  if (error) throw new Error('Error al eliminar el curso: ' + error.message);
};

/**
 * GUARDAR PROGRESO (Borrador)
 */
export const guardarProgresoBorrador = async (cursoId: number, empleadoId: number, progresoData: any) => {
  const { error } = await supabase
    .from('asignacion_cursos')
    .update({
      notas_empleado: JSON.stringify(progresoData),
      estado: 'en_progreso',
    })
    .eq('curso_id', cursoId)
    .eq('empleado_id', empleadoId);

  if (error) console.error("Error guardando progreso:", error.message);
};

/**
 * EVALUAR CURSO: Calificación automática
 */
export const enviarEvaluacion = async (cursoId: number, respuestas: RespuestaEnvio[], tiempoInicio: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa');

  const { data: empleado } = await supabase
    .from('empleados')
    .select('id')
    .eq('usuario_id', user.id)
    .single();

  if (!empleado) throw new Error('Empleado no encontrado');

  const { data: opcionesCorrectas } = await supabase
    .from('opciones_pregunta')
    .select('id, pregunta_id')
    .eq('es_correcta', true)
    .in('pregunta_id', respuestas.map(r => r.pregunta_id));

  let respuestasCorrectas = 0;
  const totalPreguntas = respuestas.length;

  const respuestasAInsertar = respuestas.map(res => {
    const esCorrecta = opcionesCorrectas?.some(
      oc => oc.pregunta_id === res.pregunta_id && oc.id === res.opcion_elegida_id
    ) || false;

    if (esCorrecta) respuestasCorrectas++;

    return {
      empleado_id: empleado.id,
      pregunta_id: res.pregunta_id,
      opcion_elegida_id: res.opcion_elegida_id,
      es_correcta: esCorrecta,
      created_by: user.id,
    };
  });

  const calificacionFinal = totalPreguntas > 0 ? (respuestasCorrectas / totalPreguntas) * 100 : 0;
  const aprobado = calificacionFinal >= 80;

  const { data: evaluacion, error: errorEval } = await supabase
    .from('evaluaciones_resultados')
    .insert([{
      curso_id: cursoId,
      empleado_id: empleado.id,
      preguntas_totales: totalPreguntas,
      respuestas_correctas: respuestasCorrectas,
      calificacion: calificacionFinal,
      aprobado: aprobado,
      tiempo_inicio: tiempoInicio,
      created_by: user.id,
    }])
    .select()
    .single();

  if (errorEval) throw new Error('Error al guardar evaluación: ' + errorEval.message);

  if (respuestasAInsertar.length > 0) {
    const respuestasConEval = respuestasAInsertar.map(r => ({ ...r, evaluacion_id: evaluacion.id }));
    await supabase.from('respuestas_empleado').insert(respuestasConEval);
  }

  await supabase
    .from('asignacion_cursos')
    .update({
      estado: 'completado',
      fecha_completado: new Date().toISOString(),
      notas_empleado: null,
    })
    .eq('curso_id', cursoId)
    .eq('empleado_id', empleado.id);

  return evaluacion;
};

/**
 * OBTENER DETALLE DE EVALUACIÓN
 */
export const getDetalleEvaluacion = async (cursoId: number, empleadoId: number) => {
  if (!cursoId || !empleadoId) {
    console.error('getDetalleEvaluacion: cursoId o empleadoId son inválidos', { cursoId, empleadoId });
    return null;
  }

  const { data: evaluacion, error } = await supabase
    .from('evaluaciones_resultados')
    .select(`
      id,
      calificacion,
      aprobado,
      respuestas_correctas,
      preguntas_totales,
      tiempo_inicio,
      fecha_finalizacion,
      respuestas_empleado (
        pregunta_id,
        opcion_elegida_id,
        es_correcta
      )
    `)
    .eq('curso_id', cursoId)
    .eq('empleado_id', empleadoId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') {
      console.error("Error obteniendo detalles:", error.message);
    }
    return null;
  }

  const { data: preguntas } = await supabase
    .from('preguntas')
    .select(`
      id,
      texto_pregunta,
      orden,
      opciones_pregunta ( id, texto_opcion, es_correcta, orden )
    `)
    .eq('curso_id', cursoId)
    .is('deleted_at', null)
    .order('orden', { ascending: true });

  const preguntasConRespuesta = (preguntas || []).map((preg: any) => {
    const respuestaEmpleado = evaluacion.respuestas_empleado?.find(
      (r: any) => r.pregunta_id === preg.id
    );
    return {
      ...preg,
      opciones_pregunta: (preg.opciones_pregunta || []).sort((a: any, b: any) => a.orden - b.orden),
      opcion_elegida_id: respuestaEmpleado?.opcion_elegida_id ?? null,
      respondida_correctamente: respuestaEmpleado?.es_correcta ?? false,
    };
  });

  return {
    ...evaluacion,
    preguntas: preguntasConRespuesta,
  };
};