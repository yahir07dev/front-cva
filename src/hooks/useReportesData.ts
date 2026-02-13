import { useState, useMemo } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface ActividadReporte {
  id: number
  calificacion: number | null
  fecha_evaluada: string | null
  estado: string 
  asignaciones: {
    empleado: {
      id: number
      nombre: string
      apellidos: string
      foto_perfil_url?: string 
      estado?: string 
    }
  }[]
}

export function useReportesData(actividades: ActividadReporte[]) {
  const [filtroNombre, setFiltroNombre] = useState('')

  // 1. Top Empleados (Algoritmo basado en Operatividad)
  const topEmpleados = useMemo(() => {
    const map = new Map()

    // A. Procesar Actividades (Evaluaciones y Tareas Vencidas)
    actividades.forEach((act) => {
      if (!act.asignaciones) return;
      act.asignaciones.forEach((asig) => {
        const emp = asig.empleado
        if (!emp || emp.estado === 'baja') return

        if (!map.has(emp.id)) {
          map.set(emp.id, { 
            id: emp.id, 
            nombre: `${emp.nombre} ${emp.apellidos}`,
            foto_perfil_url: emp.foto_perfil_url,
            totalStars: 0, 
            countAct: 0, 
            noRealizadas: 0 
          })
        }
        
        const data = map.get(emp.id)
        
        // Sumar estrellas si la tarea fue completada y evaluada
        if (act.estado === 'completada' && act.calificacion) {
          data.totalStars += act.calificacion
          data.countAct += 1
        } 
        // Aumentar contador de fallos si la tarea venció
        else if (act.estado === 'no_realizada') {
          data.noRealizadas += 1
        }
      })
    })

    // B. Calcular Score Final Balanceado
    let lista = Array.from(map.values()).map((e: any) => {
      const promedioNum = e.countAct > 0 ? (e.totalStars / e.countAct) : 0
      
      /**
       * FÓRMULA DE RENDIMIENTO OPERATIVO
       * Base: Promedio x 10 (Max 50 pts)
       * Penalización: -5.0 pts por cada Actividad No Realizada
       */
      let score = promedioNum * 10
      score -= (e.noRealizadas * 5.0)

      return {
        ...e,
        promedio: promedioNum.toFixed(1),
        score: Math.max(0, score), // El score nunca es menor a 0
      }
    })

    // C. Aplicación de Filtros
    if (filtroNombre) {
      lista = lista.filter((e: any) => e.nombre.toLowerCase().includes(filtroNombre.toLowerCase()))
    }

    return lista.sort((a: any, b: any) => b.score - a.score)
  }, [actividades, filtroNombre])

  // 2. Datos Gráfica de Tendencia (Evaluaciones Mensuales)
  const datosGrafica = useMemo(() => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    const contadores = meses.map(m => ({ name: m, total: 0, count: 0 }))

    actividades.forEach((act) => {
      if (act.estado !== 'completada' || !act.fecha_evaluada || !act.calificacion) return
      const fecha = new Date(act.fecha_evaluada)
      if (isNaN(fecha.getTime())) return

      const mesIndex = fecha.getMonth()
      if (mesIndex >= 0 && mesIndex < 12) {
        contadores[mesIndex].total += act.calificacion
        contadores[mesIndex].count += 1
      }
    })

    return contadores.map(d => ({
      name: d.name,
      promedio: d.count > 0 ? parseFloat((d.total / d.count).toFixed(1)) : 0
    }))
  }, [actividades])

  // 3. Exportación PDF Simplificada
  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.setTextColor(234, 88, 12) 
    doc.text('Reporte Operativo de Desempeño', 14, 20)
    
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 28)

    const tableData = topEmpleados.map((e: any) => [
      e.nombre,
      e.score.toFixed(1),
      e.promedio,
      e.noRealizadas
    ])

    autoTable(doc, {
      startY: 35,
      head: [['Colaborador', 'Score PTS', '★ Media', 'Incumplimientos']],
      body: tableData,
      headStyles: { fillColor: [30, 41, 59], halign: 'center' },
      styles: { fontSize: 8, halign: 'center' },
      columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } }
    })

    doc.save(`reporte_operativo_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return {
    topEmpleados,
    datosGrafica,
    filtroNombre,
    setFiltroNombre,
    exportarPDF
  }
}