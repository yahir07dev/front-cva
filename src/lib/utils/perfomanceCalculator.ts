export function calcularRankingData(actividades: any[] = [], comentarios: any[] = []) {
  const map = new Map()

  // 1. PROCESAR ACTIVIDADES
  if (Array.isArray(actividades)) {
    actividades.forEach((act) => {
      const listaAsignaciones = Array.isArray(act.asignaciones) ? act.asignaciones : [act.asignaciones];
      
      listaAsignaciones.forEach((asig: any) => {
        const emp = asig?.empleado;
        if (!emp) return;
        const empId = String(emp.id);

        if (!map.has(empId)) {
          map.set(empId, { 
            id: empId, 
            nombre: `${emp.nombre} ${emp.apellidos}`,
            apellidos: emp.apellidos,
            foto_perfil_url: emp.foto_perfil_url,
            puntosActividadesRaw: 0, 
            totalAsignadas: 0,       
            puntosFeedback: 0,
            tareasCompletadas: 0, 
            noRealizadas: 0 
          })
        }
        
        const data = map.get(empId)
        
        if (act.estado === 'completada' || act.estado === 'no_realizada') {
           data.totalAsignadas += 1;
        }
        
        if (act.estado === 'completada') {
          data.tareasCompletadas += 1;
          if (act.calificacion) {
            const calif = Number(act.calificacion);
            if (calif === 5) data.puntosActividadesRaw += 10;
            else if (calif === 4) data.puntosActividadesRaw += 5;
            else if (calif <= 2) data.puntosActividadesRaw -= 5;
          }
        } else if (act.estado === 'no_realizada') {
          data.noRealizadas += 1;
          data.puntosActividadesRaw -= 15; 
          if (act.calificacion) {
            const calif = Number(act.calificacion);
            if (calif === 5) data.puntosActividadesRaw += 10;
            else if (calif === 4) data.puntosActividadesRaw += 5;
            else if (calif <= 2) data.puntosActividadesRaw -= 5;
          }
        }
      })
    })
  }

  // 2. PROCESAR COMENTARIOS / FEEDBACK
  if (Array.isArray(comentarios)) {
    comentarios.forEach((com) => {
      const empId = String(com.empleado_id);
      if (map.has(empId)) {
        const data = map.get(empId);
        data.puntosFeedback += Number(com.valor_puntos || 0);
      }
    })
  }

  // 3. CALCULAR SCORE NORMALIZADO Y ORDENAR
  let lista = Array.from(map.values()).map((e: any) => {
    const puntosMaximosPosibles = e.totalAsignadas * 10;
    let efectividadTareas = 0;
    if (puntosMaximosPosibles > 0) {
      efectividadTareas = (e.puntosActividadesRaw / puntosMaximosPosibles) * 100;
    }
    const scoreTotal = Math.round(efectividadTareas + e.puntosFeedback);

    return {
      ...e,
      score: scoreTotal,
      enRiesgo: scoreTotal < 0
    }
  })

  return lista.sort((a, b) => b.score - a.score)
}

export function calcularGraficaData(actividades: any[]) {
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
  const contadores = meses.map(m => ({ name: m, puntosRaw: 0, puntosMaximos: 0 }))

  if (!Array.isArray(actividades)) return contadores.map(c => ({ name: c.name, scoreMensual: 0 }))

  actividades.forEach((act) => {
    const fechaStr = act.fecha_evaluada || act.fecha_limite || act.fecha_creacion;
    if (fechaStr) {
      const fecha = new Date(fechaStr)
      if (!isNaN(fecha.getTime())) {
        const mesIndex = fecha.getMonth()
        contadores[mesIndex].puntosMaximos += 10; 
        
        if (act.estado === 'completada') {
           if (act.calificacion) {
               const calif = Number(act.calificacion);
               if (calif === 5) contadores[mesIndex].puntosRaw += 10;
               else if (calif === 4) contadores[mesIndex].puntosRaw += 5;
               else if (calif <= 2) contadores[mesIndex].puntosRaw -= 5;
           }
        } else if (act.estado === 'no_realizada') {
           contadores[mesIndex].puntosRaw -= 15;
           if (act.calificacion) {
               const calif = Number(act.calificacion);
               if (calif <= 2) contadores[mesIndex].puntosRaw -= 5;
           }
        }
      }
    }
  })

  return contadores.map(c => ({
    name: c.name,
    scoreMensual: c.puntosMaximos > 0 ? Math.round((c.puntosRaw / c.puntosMaximos) * 100) : 0
  }));
}