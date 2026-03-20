'use server'

import { createClient } from '@/src/lib/supabase/server'
import { CursoCapacitacion, RespuestaEnvio } from '@/src/types/capacitacion'

// 1. OBTENCIÓN DE CURSOS (CERO WATERFALLS, CERO N+1)
export async function getCursosAction() {
  const supabase = await createClient();

  // 1. Traemos cursos, preguntas, opciones y asignaciones en un solo query
  const { data: cursos, error } = await supabase
    .from('cursos')
    .select(`
      *,
      preguntas ( id, texto_pregunta, puntaje, orden, opciones_pregunta ( id, texto_opcion, es_correcta, orden ) ),
      asignacion_cursos ( id, estado, fecha_asignacion, fecha_completado, notas_empleado, empleado_id, empleados ( id, usuario_id, nombre, apellidos, foto_perfil_url ) )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  if (!cursos || cursos.length === 0) return [];

  // 2. Extraemos todos los IDs de cursos para traer TODAS las evaluaciones de golpe
  const cursoIds = cursos.map(c => c.id);

  const { data: evaluaciones } = await supabase
    .from('evaluaciones_resultados')
    .select('curso_id, empleado_id, calificacion')
    .in('curso_id', cursoIds)
    .order('created_at', { ascending: false }); // Las más recientes primero

  // 3. Mapeamos las evaluaciones en un diccionario rápido: dict[curso_id][empleado_id] = calificacion
  const evalDict: Record<number, Record<number, number>> = {};
  (evaluaciones || []).forEach(ev => {
    if (!evalDict[ev.curso_id]) evalDict[ev.curso_id] = {};
    // Como vienen ordenadas descendentes, solo guardamos la primera (más reciente)
    if (evalDict[ev.curso_id][ev.empleado_id] === undefined) {
      evalDict[ev.curso_id][ev.empleado_id] = ev.calificacion;
    }
  });

  // 4. Ensamblamos el resultado final en memoria
  return cursos.map(curso => ({
    ...curso,
    asignacion_cursos: (curso.asignacion_cursos || []).map((asig: any) => ({
      ...asig,
      calificacion: evalDict[curso.id]?.[asig.empleado_id] ?? null,
    })),
    preguntas: (curso.preguntas || [])
      .sort((a: any, b: any) => a.orden - b.orden)
      .map((p: any) => ({
        ...p,
        opciones_pregunta: (p.opciones_pregunta || []).sort((a: any, b: any) => a.orden - b.orden),
      })),
  }));
}

// 2. CREAR CURSO
export async function crearCursoAction(curso: CursoCapacitacion, empleadosIds: number[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa');

  const { data: nuevoCurso, error: errorCurso } = await supabase
    .from('cursos')
    .insert([{
      titulo: curso.titulo,
      descripcion: curso.descripcion,
      url_youtube: curso.url_youtube,
      duracion_minutos: curso.duracion_minutos,
      tiempo_limite_examen: curso.tiempo_limite_examen || 0,
      es_obligatorio: curso.es_obligatorio,
      created_by: user.id,
    }])
    .select().single();

  if (errorCurso) throw new Error('Error al crear curso: ' + errorCurso.message);

  if (empleadosIds.length > 0) {
    const asignaciones = empleadosIds.map(empId => ({ curso_id: nuevoCurso.id, empleado_id: empId, created_by: user.id }));
    await supabase.from('asignacion_cursos').insert(asignaciones);
  }

  if (curso.preguntas && curso.preguntas.length > 0) {
    for (const [indexP, preg] of curso.preguntas.entries()) {
      const { data: nuevaPregunta } = await supabase.from('preguntas')
        .insert([{ curso_id: nuevoCurso.id, texto_pregunta: preg.texto_pregunta, puntaje: preg.puntaje || 10, orden: indexP, created_by: user.id }])
        .select().single();

      if (nuevaPregunta && preg.opciones && preg.opciones.length > 0) {
        const opciones = preg.opciones.map((opc: any, indexO: number) => ({
          pregunta_id: nuevaPregunta.id, texto_opcion: opc.texto_opcion, es_correcta: opc.es_correcta, orden: indexO, created_by: user.id
        }));
        await supabase.from('opciones_pregunta').insert(opciones);
      }
    }
  }
  return nuevoCurso;
}

// 3. ACTUALIZAR CURSO
export async function actualizarCursoAction(cursoId: number, curso: CursoCapacitacion, empleadosIds: number[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa');

  await supabase.from('cursos').update({
    titulo: curso.titulo, descripcion: curso.descripcion, url_youtube: curso.url_youtube,
    duracion_minutos: curso.duracion_minutos, tiempo_limite_examen: curso.tiempo_limite_examen || 0,
    es_obligatorio: curso.es_obligatorio, updated_at: new Date().toISOString(), updated_by: user.id,
  }).eq('id', cursoId);

  const { data: asignacionesActuales } = await supabase.from('asignacion_cursos').select('id, empleado_id, estado').eq('curso_id', cursoId);
  const actualesIds = asignacionesActuales?.map(a => a.empleado_id) || [];
  
  const nuevosAInsertar = empleadosIds.filter(id => !actualesIds.includes(id));
  const aBorrar = asignacionesActuales?.filter(a => !empleadosIds.includes(a.empleado_id) && a.estado === 'asignado').map(a => a.id) || [];

  if (nuevosAInsertar.length > 0) {
    await supabase.from('asignacion_cursos').insert(nuevosAInsertar.map(empId => ({ curso_id: cursoId, empleado_id: empId, created_by: user.id })));
  }
  if (aBorrar.length > 0) {
    await supabase.from('asignacion_cursos').delete().in('id', aBorrar);
  }

  // Lógica de preguntas omitida por brevedad visual (es la misma que ya tenías, envuelta aquí)
  if (curso.preguntas) {
    for (const [indexP, preg] of curso.preguntas.entries()) {
      let preguntaId = preg.id;
      if (preguntaId) {
        await supabase.from('preguntas').update({ texto_pregunta: preg.texto_pregunta, orden: indexP, updated_at: new Date().toISOString() }).eq('id', preguntaId);
      } else {
        const { data: nP } = await supabase.from('preguntas').insert([{ curso_id: cursoId, texto_pregunta: preg.texto_pregunta, puntaje: preg.puntaje || 10, orden: indexP, created_by: user.id }]).select().single();
        preguntaId = nP?.id;
      }
      if (preguntaId && preg.opciones) {
        for (const [indexO, opc] of preg.opciones.entries()) {
          if (opc.id) await supabase.from('opciones_pregunta').update({ texto_opcion: opc.texto_opcion, es_correcta: opc.es_correcta, orden: indexO }).eq('id', opc.id);
          else await supabase.from('opciones_pregunta').insert([{ pregunta_id: preguntaId, texto_opcion: opc.texto_opcion, es_correcta: opc.es_correcta, orden: indexO, created_by: user.id }]);
        }
      }
    }
  }
}

// 4. ELIMINAR CURSO
export async function eliminarCursoAction(id: number) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('cursos').update({ deleted_at: new Date().toISOString(), deleted_by: user?.id, esta_activo: false }).eq('id', id);
}

// 5. GUARDAR BORRADOR
export async function guardarProgresoBorradorAction(cursoId: number, empleadoId: number, progresoData: any) {
  const supabase = await createClient();
  await supabase.from('asignacion_cursos').update({ notas_empleado: JSON.stringify(progresoData), estado: 'en_progreso' }).eq('curso_id', cursoId).eq('empleado_id', empleadoId);
}

// 6. ENVIAR EVALUACIÓN
export async function enviarEvaluacionAction(cursoId: number, respuestas: RespuestaEnvio[], tiempoInicio: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No hay sesión activa');

  const { data: empleado } = await supabase.from('empleados').select('id').eq('usuario_id', user.id).single();
  if (!empleado) throw new Error('Empleado no encontrado');

  const { data: opcionesCorrectas } = await supabase.from('opciones_pregunta').select('id, pregunta_id').eq('es_correcta', true).in('pregunta_id', respuestas.map(r => r.pregunta_id));

  let respuestasCorrectas = 0;
  const totalPreguntas = respuestas.length;

  const respuestasAInsertar = respuestas.map(res => {
    const esCorrecta = opcionesCorrectas?.some(oc => oc.pregunta_id === res.pregunta_id && oc.id === res.opcion_elegida_id) || false;
    if (esCorrecta) respuestasCorrectas++;
    return { empleado_id: empleado.id, pregunta_id: res.pregunta_id, opcion_elegida_id: res.opcion_elegida_id, es_correcta: esCorrecta, created_by: user.id };
  });

  const calificacionFinal = totalPreguntas > 0 ? (respuestasCorrectas / totalPreguntas) * 100 : 0;
  const aprobado = calificacionFinal >= 80;

  const { data: evaluacion } = await supabase.from('evaluaciones_resultados').insert([{ curso_id: cursoId, empleado_id: empleado.id, preguntas_totales: totalPreguntas, respuestas_correctas: respuestasCorrectas, calificacion: calificacionFinal, aprobado: aprobado, tiempo_inicio: tiempoInicio, created_by: user.id }]).select().single();

  if (respuestasAInsertar.length > 0) {
    await supabase.from('respuestas_empleado').insert(respuestasAInsertar.map(r => ({ ...r, evaluacion_id: evaluacion.id })));
  }

  await supabase.from('asignacion_cursos').update({ estado: 'completado', fecha_completado: new Date().toISOString(), notas_empleado: null }).eq('curso_id', cursoId).eq('empleado_id', empleado.id);

  return evaluacion;
}

// 7. OBTENER DETALLE EVALUACIÓN
export async function getDetalleEvaluacionAction(cursoId: number, empleadoId: number) {
  const supabase = await createClient();
  const { data: evaluacion, error } = await supabase.from('evaluaciones_resultados').select(`id, calificacion, aprobado, respuestas_correctas, preguntas_totales, tiempo_inicio, fecha_finalizacion, respuestas_empleado ( pregunta_id, opcion_elegida_id, es_correcta )`).eq('curso_id', cursoId).eq('empleado_id', empleadoId).order('created_at', { ascending: false }).limit(1).single();

  if (error) return null;

  const { data: preguntas } = await supabase.from('preguntas').select(`id, texto_pregunta, orden, opciones_pregunta ( id, texto_opcion, es_correcta, orden )`).eq('curso_id', cursoId).is('deleted_at', null).order('orden', { ascending: true });

  const preguntasConRespuesta = (preguntas || []).map((preg: any) => {
    const respuestaEmpleado = evaluacion.respuestas_empleado?.find((r: any) => r.pregunta_id === preg.id);
    return {
      ...preg,
      opciones_pregunta: (preg.opciones_pregunta || []).sort((a: any, b: any) => a.orden - b.orden),
      opcion_elegida_id: respuestaEmpleado?.opcion_elegida_id ?? null,
      respondida_correctamente: respuestaEmpleado?.es_correcta ?? false,
    };
  });

  return { ...evaluacion, preguntas: preguntasConRespuesta };
}