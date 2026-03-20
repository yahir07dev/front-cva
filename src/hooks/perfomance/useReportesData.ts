import { useState, useMemo } from 'react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export function useReportesData(topEmpleados: any[] = []) {
  const [filtroNombre, setFiltroNombre] = useState('')

  // El filtro de la lista en base al input de búsqueda
  const listaFiltrada = useMemo(() => {
    if (!filtroNombre) return topEmpleados
    return topEmpleados.filter(e => 
      e.nombre.toLowerCase().includes(filtroNombre.toLowerCase())
    )
  }, [topEmpleados, filtroNombre])

  const exportarPDF = () => {
    const doc = new jsPDF()
    doc.text('Reporte Analítico de Rendimiento (Score Normalizado)', 14, 20)
    autoTable(doc, {
      startY: 30,
      head: [['Colaborador', 'Tareas Exitosas', 'Tareas Fallidas', 'Score Total', 'Estado']],
      body: listaFiltrada.map(e => [
        e.nombre, 
        e.tareasCompletadas, 
        e.noRealizadas, 
        `${e.score} pts`,
        e.enRiesgo ? 'ALERTA / RIESGO' : 'ESTABLE'
      ]),
    })
    doc.save('reporte_desempeno.pdf')
  }

  return { 
    listaFiltrada, 
    filtroNombre, 
    setFiltroNombre, 
    exportarPDF 
  }
}