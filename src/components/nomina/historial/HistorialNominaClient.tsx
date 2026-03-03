'use client'

import { useState, useEffect } from 'react'
import { getHistorialResumen, getDetalleNominaPorFecha } from '@/src/services/generarNominaService'
import { generarPDFNomina } from '@/src/lib/utils/reporteNominaGenerator'
import { FileDown, History, Search, Loader2 } from 'lucide-react'

export default function HistorialNominaClient() {
  const [historial, setHistorial] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [descargando, setDescargando] = useState<string | null>(null)

  useEffect(() => {
    getHistorialResumen().then(setHistorial).finally(() => setLoading(false))
  }, [])

  const handleDownload = async (fecha: string) => {
    setDescargando(fecha)
    try {
      const detalle = await getDetalleNominaPorFecha(fecha)
      generarPDFNomina(fecha, detalle)
    } catch (e) {
      alert("Error al generar PDF")
    } finally {
      setDescargando(null)
    }
  }

  const formatMoney = (n: number) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="flex items-center gap-3 mb-8">
        <div className="h-12 w-12 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
          <History className="text-neutral-600 dark:text-neutral-400" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">Historial de Nóminas</h1>
          <p className="text-sm text-neutral-500 font-medium">Consulta y descarga reportes pasados</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-orange-500" /></div>
      ) : (
        <div className="grid gap-3">
          {historial.map((item) => (
            <div key={item.fecha} className="group bg-white dark:bg-neutral-900 p-5 rounded-[24px] border border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between hover:border-orange-500/50 transition-all shadow-sm">
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Fecha de Pago</span>
                  <span className="text-sm font-black text-neutral-900 dark:text-white">
                    {new Date(item.fecha + 'T12:00:00').toLocaleDateString('es-MX', { dateStyle: 'long' })}
                  </span>
                </div>
                <div className="h-8 w-[1px] bg-neutral-100 dark:bg-neutral-800" />
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Personal</span>
                  <span className="text-sm font-bold text-neutral-700 dark:text-neutral-300">{item.total_empleados} Empleados</span>
                </div>
                <div className="h-8 w-[1px] bg-neutral-100 dark:bg-neutral-800 hidden sm:block" />
                <div className="flex flex-col hidden sm:flex">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Total Desembolsado</span>
                  <span className="text-sm font-black text-emerald-600">{formatMoney(item.monto_total)}</span>
                </div>
              </div>

              <button 
                onClick={() => handleDownload(item.fecha)}
                disabled={!!descargando}
                className="flex items-center gap-2 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-orange-500 hover:text-white transition-all shadow-sm"
              >
                {descargando === item.fecha ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
                <span>{descargando === item.fecha ? 'Generando...' : 'Descargar PDF'}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}