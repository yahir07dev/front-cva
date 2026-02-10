import { useState, useMemo } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// Definimos tipos básicos para lo que esperamos recibir del servicio
interface ActividadReporte {
  id: number
  calificacion: number | null
  fecha_evaluada: string | null
  asignaciones: {
    empleado: {
      id: number
      nombre: string
      apellidos: string
    }
  }[]
}

interface FeedbackReporte {
  id: number
  tipo: string
  created_at: string
  empleado: {
    id: number
    nombre: string
    apellidos: string
  }
}

export function useReportesData(actividades: ActividadReporte[], feedback: FeedbackReporte[]) {
  const [filtroNombre, setFiltroNombre] = useState('')
  const [filtroTipo, setFiltroTipo] = useState('todos')

  // 1. Top Empleados (Con Algoritmo de Puntuación)
  const topEmpleados = useMemo(() => {
    const map = new Map()

    // A. Procesar Actividades (Estrellas)
    actividades.forEach((act) => {
      // Ajuste clave: Iteramos sobre las asignaciones (puede ser más de 1 empleado por tarea)
      if (!act.asignaciones) return;

      act.asignaciones.forEach((asig) => {
        const emp = asig.empleado
        if (!emp) return

        if (!map.has(emp.id)) {
          map.set(emp.id, { 
            id: emp.id, 
            nombre: `${emp.nombre} ${emp.apellidos}`, 
            totalStars: 0, 
            countAct: 0, 
            feedback: { positivo: 0, negativo: 0, mejora: 0 } 
          })
        }
        
        const data = map.get(emp.id)
        // Sumamos calificación solo si existe
        if (act.calificacion) {
          data.totalStars += act.calificacion
          data.countAct += 1
        }
      })
    })

    // B. Procesar Feedback (Conteo)
    feedback.forEach((feed) => {
      const emp = feed.empleado
      if (!emp) return
      
      if (!map.has(emp.id)) {
        map.set(emp.id, { 
          id: emp.id, 
          nombre: `${emp.nombre} ${emp.apellidos}`, 
          totalStars: 0, 
          countAct: 0, 
          feedback: { positivo: 0, negativo: 0, mejora: 0 } 
        })
      }
      
      const data = map.get(emp.id)
      // Normalizamos el tipo a minúsculas por si acaso
      const tipo = feed.tipo?.toLowerCase()
      if (tipo === 'positivo') data.feedback.positivo += 1
      if (tipo === 'negativo') data.feedback.negativo += 1
      if (tipo === 'mejora') data.feedback.mejora += 1
    })

    // C. Calcular Puntuación Final (Score)
    let lista = Array.from(map.values()).map((e: any) => {
      const promedioNum = e.countAct > 0 ? (e.totalStars / e.countAct) : 0
      
      // --- FÓRMULA DE RENDIMIENTO ---
      // Base: Promedio * 10 (Ej: 4.5 estrellas = 45 puntos base)
      let score = promedioNum * 10
      
      // Bonus por Feedback Positivo (+2 puntos c/u)
      score += (e.feedback.positivo * 2)
      
      // Pequeño bonus por Mejora (+0.5 puntos c/u)
      score += (e.feedback.mejora * 0.5)
      
      // Penalización por Negativo (-2 puntos c/u)
      score -= (e.feedback.negativo * 2)

      return {
        ...e,
        promedio: promedioNum.toFixed(1),
        score: score,
        totalFeedback: e.feedback.positivo + e.feedback.negativo + e.feedback.mejora
      }
    })

    // D. Filtros
    if (filtroNombre) {
      lista = lista.filter((e: any) => e.nombre.toLowerCase().includes(filtroNombre.toLowerCase()))
    }
    // Filtro por tipo de feedback (si tiene al menos uno de ese tipo)
    if (filtroTipo !== 'todos') {
      lista = lista.filter((e: any) => e.feedback[filtroTipo] > 0)
    }

    // E. Ordenar por SCORE (El más alto primero)
    return lista.sort((a: any, b: any) => b.score - a.score)
  }, [actividades, feedback, filtroNombre, filtroTipo])

  // 2. Datos Gráfica Mensual (Evolución)
  const datosGrafica = useMemo(() => {
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    // Inicializamos array de contadores
    const contadores = meses.map(m => ({ name: m, total: 0, count: 0 }))

    actividades.forEach((act) => {
      if (!act.fecha_evaluada || !act.calificacion) return
      
      const fecha = new Date(act.fecha_evaluada)
      // Validamos que la fecha sea válida
      if (isNaN(fecha.getTime())) return

      const mesIndex = fecha.getMonth() // 0-11
      if (mesIndex >= 0 && mesIndex < 12) {
        contadores[mesIndex].total += act.calificacion
        contadores[mesIndex].count += 1
      }
    })

    // Calculamos promedios finales
    return contadores.map(d => ({
      name: d.name,
      promedio: d.count > 0 ? parseFloat((d.total / d.count).toFixed(1)) : 0
    }))
  }, [actividades])

  // --- PDF ---
  const exportarPDF = () => {
    const doc = new jsPDF()
    
    // Título
    doc.setFontSize(18)
    doc.setTextColor(40)
    doc.text('Reporte de Rendimiento General', 14, 20)
    
    // Fecha
    doc.setFontSize(10)
    doc.setTextColor(100)
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 28)

    // Datos de la tabla
    const tableData = topEmpleados.map((e: any) => [
      e.nombre,
      e.score.toFixed(1), // Score
      e.promedio,         // Rating Promedio
      e.feedback.positivo,
      e.feedback.mejora,
      e.feedback.negativo
    ])

    autoTable(doc, {
      startY: 35,
      head: [['Empleado', 'Puntaje Global', 'Calif. Promedio', 'Positivos', 'Mejoras', 'Negativos']],
      body: tableData,
      headStyles: { 
        fillColor: [234, 88, 12], // Orange-600
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251] // Gray-50
      },
      styles: {
        fontSize: 10,
        cellPadding: 4
      }
    })

    doc.save(`reporte_rendimiento_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return {
    topEmpleados,
    datosGrafica,
    filtroNombre,
    setFiltroNombre,
    filtroTipo,
    setFiltroTipo,
    exportarPDF
  }
}