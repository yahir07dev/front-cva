import { useState, useMemo } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function useReportesData(actividades: any[] = []) {
  const [filtroNombre, setFiltroNombre] = useState('')

  const topEmpleados = useMemo(() => {
    const map = new Map()

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
              totalStars: 0, 
              countEvaluadas: 0, 
              noRealizadas: 0 
            })
          }
          
          const data = map.get(empId)
          if (act.estado === 'completada' && act.calificacion) {
            data.totalStars += Number(act.calificacion)
            data.countEvaluadas += 1
          } else if (act.estado === 'no_realizada') {
            data.noRealizadas += 1
          }
        })
      })
    }

    let lista = Array.from(map.values()).map((e: any) => {
      const promedioNum = e.countEvaluadas > 0 ? (e.totalStars / e.countEvaluadas) : 0
      
      // FÓRMULA: Estrellas (Max 75 pts) - Penalización por fallos (-10 pts c/u)
      const score = (promedioNum * 15) - (e.noRealizadas * 10)

      return {
        ...e,
        promedio: promedioNum.toFixed(1),
        score: Math.max(0, score),
      }
    })

    if (filtroNombre) {
      lista = lista.filter(e => e.nombre.toLowerCase().includes(filtroNombre.toLowerCase()))
    }

    return lista.sort((a, b) => b.score - a.score)
  }, [actividades, filtroNombre])

  const datosGrafica = useMemo(() => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const contadores = meses.map(m => ({ name: m, total: 0, count: 0 }))

    actividades.forEach((act) => {
      if (act.estado === 'completada' && act.fecha_evaluada && act.calificacion) {
        const fecha = new Date(act.fecha_evaluada)
        if (!isNaN(fecha.getTime())) {
          const mesIndex = fecha.getMonth()
          contadores[mesIndex].total += Number(act.calificacion)
          contadores[mesIndex].count += 1
        }
      }
    })

    return contadores.map(d => ({
      name: d.name,
      promedio: d.count > 0 ? parseFloat((d.total / d.count).toFixed(1)) : 0
    }))
  }, [actividades])

  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.text('Reporte de Desempeño Operativo', 14, 20)
    autoTable(doc, {
      startY: 30,
      head: [['Colaborador', 'Promedio ★', 'Tareas Fallidas', 'Score Final']],
      body: topEmpleados.map(e => [e.nombre, e.promedio, e.noRealizadas, Math.round(e.score)]),
    })
    doc.save('reporte.pdf')
  }

  return { topEmpleados, datosGrafica, filtroNombre, setFiltroNombre, exportarPDF }
}