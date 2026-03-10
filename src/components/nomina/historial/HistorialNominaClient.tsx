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
      alert('Error al generar PDF')
    } finally {
      setDescargando(null)
    }
  }

  const formatMoney = (n: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n)

  return (
    // min-h-0 es clave: permite que flex-1 + overflow funcionen correctamente
    // cuando este componente vive dentro de un flex column del layout padre
    <div className="max-w-5xl mx-auto flex flex-col min-h-0 h-full">

      {/* Header fijo */}
      <div className="
        flex items-center gap-3 sm:gap-4 shrink-0
        bg-white/60 dark:bg-neutral-900/60 backdrop-blur-sm
        border border-emerald-200/30 dark:border-emerald-900/30
        rounded-2xl sm:rounded-3xl p-4 sm:p-5 md:p-6 shadow-sm
        mb-4 sm:mb-5 md:mb-6
      ">
        <div className="
          h-9 w-9 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-xl sm:rounded-2xl
          flex items-center justify-center shrink-0
          bg-emerald-500/10 dark:bg-emerald-600/15
          ring-1 ring-emerald-200/30 dark:ring-emerald-900/30
        ">
          <History size={18} className="sm:w-5 sm:h-5 md:w-6 md:h-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-lg sm:text-2xl md:text-3xl font-black tracking-tight text-neutral-900 dark:text-white leading-tight">
            Historial de Nóminas
          </h1>
          <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-0.5 sm:mt-1">
            Consulta y descarga reportes anteriores
          </p>
        </div>
      </div>

      {/* Lista con scroll — flex-1 + min-h-0 garantiza que no desborde */}
      <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        <div className="pb-6 sm:pb-8 pr-0.5">

          {loading ? (
            <div className="flex justify-center items-center py-24 sm:py-32">
              <Loader2 size={28} className="sm:w-8 sm:h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
            </div>
          ) : historial.length === 0 ? (
            <div className="
              bg-white/50 dark:bg-neutral-950/40 backdrop-blur-sm
              border border-emerald-200/30 dark:border-emerald-900/30
              rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-center
            ">
              <p className="text-sm sm:text-base md:text-lg font-medium text-neutral-600 dark:text-neutral-300">
                No hay nóminas procesadas aún
              </p>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {historial.map((item) => (
                <div
                  key={item.fecha}
                  className="
                    group flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-5
                    bg-white/60 dark:bg-neutral-950/50 backdrop-blur-sm
                    border border-emerald-200/30 dark:border-emerald-900/30
                    hover:border-emerald-400/50 hover:shadow-md hover:shadow-emerald-500/10
                    p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl transition-all duration-300
                  "
                >
                  {/* Info principal */}
                  <div className="flex flex-wrap items-start sm:items-center gap-4 sm:gap-6 md:gap-8 flex-1 min-w-0">

                    <div className="flex flex-col min-w-0">
                      <span className="text-[9px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                        Fecha de Pago
                      </span>
                      <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white mt-0.5 leading-tight">
                        {new Date(item.fecha + 'T12:00:00').toLocaleDateString('es-MX', { dateStyle: 'long' })}
                      </span>
                    </div>

                    <div className="h-8 sm:h-10 w-px bg-emerald-200/40 dark:bg-emerald-900/30 hidden sm:block shrink-0" />

                    <div className="flex flex-col shrink-0">
                      <span className="text-[9px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                        Personal
                      </span>
                      <span className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white mt-0.5">
                        {item.total_empleados} Empleados
                      </span>
                    </div>

                    <div className="h-8 sm:h-10 w-px bg-emerald-200/40 dark:bg-emerald-900/30 hidden sm:block shrink-0" />

                    <div className="flex flex-col shrink-0">
                      <span className="text-[9px] sm:text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                        Total Desembolsado
                      </span>
                      <span className="text-lg sm:text-xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums mt-0.5">
                        {formatMoney(item.monto_total)}
                      </span>
                    </div>
                  </div>

                  {/* Botón de descarga */}
                  <button
                    onClick={() => handleDownload(item.fecha)}
                    disabled={!!descargando}
                    className={`
                      flex items-center justify-center gap-2
                      px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl
                      font-semibold text-xs sm:text-sm
                      transition-all duration-200 shadow-md
                      w-full sm:w-auto shrink-0
                      ${descargando === item.fecha
                        ? 'bg-neutral-400/30 text-neutral-500 cursor-not-allowed'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg hover:shadow-emerald-600/20'
                      }
                    `}
                  >
                    {descargando === item.fecha ? (
                      <Loader2 size={15} className="sm:w-[18px] sm:h-[18px] animate-spin" />
                    ) : (
                      <FileDown size={15} className="sm:w-[18px] sm:h-[18px]" />
                    )}
                    {descargando === item.fecha ? 'Generando...' : 'Descargar PDF'}
                  </button>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}