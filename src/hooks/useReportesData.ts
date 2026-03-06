import { useState, useMemo } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function useReportesData(actividades: any[] = [], comentarios: any[] = []) {
  const [filtroNombre, setFiltroNombre] = useState('')

  const topEmpleados = useMemo(() => {
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
              foto_perfil_url: emp.foto_perfil_url,
              puntosActividadesRaw: 0, // Puntos brutos ganados/perdidos
              totalAsignadas: 0,       // NUEVO: Total de tareas asignadas (para sacar proporción)
              puntosFeedback: 0,
              tareasCompletadas: 0, 
              noRealizadas: 0 
            })
          }
          
          const data = map.get(empId)
          
          // Sumamos 1 al total de tareas asignadas para saber el máximo posible
          if (act.estado === 'completada' || act.estado === 'no_realizada') {
             data.totalAsignadas += 1;
          }
          
          // LÓGICA ESTRICTA DE PUNTOS POR TAREA
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
            data.puntosActividadesRaw -= 15; // Castigo base
            
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

    // 3. CALCULAR SCORE NORMALIZADO (EQUITATIVO) Y ORDENAR
    let lista = Array.from(map.values()).map((e: any) => {
      // ¿Cuántos puntos habría ganado si todo fuera perfecto (5 estrellas = 10 pts)?
      const puntosMaximosPosibles = e.totalAsignadas * 10;
      
      let efectividadTareas = 0;
      if (puntosMaximosPosibles > 0) {
        // Sacamos el porcentaje de efectividad (puede ser negativo si hizo todo mal)
        efectividadTareas = (e.puntosActividadesRaw / puntosMaximosPosibles) * 100;
      }

      // El Score final es su efectividad base 100 + sus bonos/castigos de feedback
      const scoreTotal = Math.round(efectividadTareas + e.puntosFeedback);

      return {
        ...e,
        score: scoreTotal,
        enRiesgo: scoreTotal < 0 // Sanción si cae en números negativos
      }
    })

    if (filtroNombre) {
      lista = lista.filter(e => e.nombre.toLowerCase().includes(filtroNombre.toLowerCase()))
    }

    return lista.sort((a, b) => b.score - a.score)
  }, [actividades, comentarios, filtroNombre])


  // 4. GRÁFICA MENSUAL EQUITATIVA
  const datosGrafica = useMemo(() => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const contadores = meses.map(m => ({ name: m, puntosRaw: 0, puntosMaximos: 0 }))

    actividades.forEach((act) => {
      // Usamos fecha evaluada, o si no la hizo, usamos su fecha límite para saber en qué mes graficarla
      const fechaStr = act.fecha_evaluada || act.fecha_limite || act.fecha_creacion;
      
      if (fechaStr) {
        const fecha = new Date(fechaStr)
        if (!isNaN(fecha.getTime())) {
          const mesIndex = fecha.getMonth()
          
          contadores[mesIndex].puntosMaximos += 10; // Potencial perfecto de esta tarea
          
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

    // Normalizamos la gráfica a escala de 0 a 100
    return contadores.map(c => ({
      name: c.name,
      scoreMensual: c.puntosMaximos > 0 ? Math.round((c.puntosRaw / c.puntosMaximos) * 100) : 0
    }));
  }, [actividades])

  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.text('Reporte Analítico de Rendimiento (Score Normalizado)', 14, 20)
    autoTable(doc, {
      startY: 30,
      head: [['Colaborador', 'Tareas Exitosas', 'Tareas Fallidas', 'Score Total', 'Estado']],
      body: topEmpleados.map(e => [
        e.nombre, 
        e.tareasCompletadas, 
        e.noRealizadas, 
        `${e.score} pts`,
        e.enRiesgo ? 'ALERTA / RIESGO' : 'ESTABLE'
      ]),
    })
    doc.save('reporte_desempeno.pdf')
  }

  return { topEmpleados, datosGrafica, filtroNombre, setFiltroNombre, exportarPDF }
}