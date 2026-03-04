'use client'

import { useState, useEffect } from 'react'
import { getHistorialResumen, getDetalleNominaPorFecha } from '@/src/services/generarNominaService'
import { generarPDFNomina } from '@/src/lib/utils/reporteNominaGenerator'
import { FileDown, History, Loader2 } from 'lucide-react'

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
    <div className="max-w-5xl mx-auto pb-20 md:pb-32">
      {/* Header */}
      <div className="
        flex items-center gap-4 mb-8
        bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm
        border border-emerald-200/30 dark:border-emerald-900/30
        rounded-3xl p-6 shadow-sm
      ">
        <div className="
          h-12 w-12 rounded-2xl flex items-center justify-center
          bg-emerald-500/10 dark:bg-emerald-600/15
          ring-1 ring-emerald-200/30 dark:ring-emerald-900/30
        ">
          <History size={24} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
            Historial de Nóminas
          </h1>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">
            Consulta y descarga reportes anteriores
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 size={32} className="animate-spin text-emerald-600 dark:text-emerald-400" />
        </div>
      ) : historial.length === 0 ? (
        <div className="
          bg-white/50 dark:bg-neutral-950/40 backdrop-blur-sm
          border border-emerald-200/30 dark:border-emerald-900/30
          rounded-3xl p-10 text-center
        ">
          <p className="text-lg font-medium text-neutral-600 dark:text-neutral-300">
            No hay nóminas procesadas aún
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {historial.map((item) => (
            <div 
              key={item.fecha} 
              className={`
                group flex flex-col sm:flex-row sm:items-center justify-between gap-5
                bg-white/60 dark:bg-neutral-950/50 backdrop-blur-sm
                border border-emerald-200/30 dark:border-emerald-900/30
                hover:border-emerald-400/50 hover:shadow-md hover:shadow-emerald-500/10
                p-6 rounded-3xl transition-all duration-300
              `}
            >
              {/* Info principal */}
              <div className="flex flex-wrap items-center gap-6 sm:gap-8">
                <div className="flex flex-col min-w-[140px]">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                    Fecha de Pago
                  </span>
                  <span className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">
                    {new Date(item.fecha + 'T12:00:00').toLocaleDateString('es-MX', { dateStyle: 'long' })}
                  </span>
                </div>

                <div className="h-10 w-px bg-emerald-200/40 dark:bg-emerald-900/30 hidden sm:block" />

                <div className="flex flex-col min-w-[120px]">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                    Personal
                  </span>
                  <span className="text-base font-bold text-neutral-900 dark:text-white mt-0.5">
                    {item.total_empleados} Empleados
                  </span>
                </div>

                <div className="h-10 w-px bg-emerald-200/40 dark:bg-emerald-900/30 hidden sm:block" />

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                    Total Desembolsado
                  </span>
                  <span className="text-xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
                    {formatMoney(item.monto_total)}
                  </span>
                </div>
              </div>

              {/* Botón de descarga */}
              <button
                onClick={() => handleDownload(item.fecha)}
                disabled={!!descargando}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-sm
                  transition-all duration-200 shadow-md
                  ${descargando === item.fecha 
                    ? 'bg-neutral-400/30 text-neutral-500 cursor-not-allowed' 
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg hover:shadow-emerald-600/20'
                  }
                `}
              >
                {descargando === item.fecha ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <FileDown size={18} />
                )}
                {descargando === item.fecha ? 'Generando...' : 'Descargar PDF'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}