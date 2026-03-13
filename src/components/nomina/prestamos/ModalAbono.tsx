'use client'

import { useState } from 'react'
import { X, Loader2, HandCoins, CheckCircle2 } from 'lucide-react'

interface ModalAbonoProps {
  isOpen: boolean
  onClose: () => void
  prestamo: any
  onAbonar: (id: number, monto: number, omitir: boolean, motivo: string) => Promise<void>
}

export default function ModalAbono({ isOpen, onClose, prestamo, onAbonar }: ModalAbonoProps) {
  const [loading, setLoading] = useState(false)
  const [accion, setAccion] = useState<'cuota' | 'liquidar'>('cuota')

  if (!isOpen || !prestamo) return null

  const cuota = Number(prestamo.cuota_semanal)
  const saldo = Number(prestamo.saldo_restante)
  const cuotaNormal = cuota > saldo ? saldo : cuota
  const esUltimoPago = cuotaNormal === saldo

  const formatMoney = (num: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const montoACobrar = accion === 'liquidar' ? saldo : cuotaNormal
      await onAbonar(prestamo.id, montoACobrar, false, '')
      setAccion('cuota')
      onClose()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop alineado con los otros modales */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={!loading ? onClose : undefined} 
      />

      {/* Modal central con el nuevo diseño */}
      <div className="
        relative w-full max-w-md bg-white dark:bg-neutral-900 
        rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/20 dark:shadow-black/40
        p-5 sm:p-6 md:p-8 animate-in zoom-in-95 fade-in duration-300
      ">
        
        {/* Header alineado */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white leading-tight">
              Registrar Abono
            </h2>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">
              {prestamo.empleados?.nombre} {prestamo.empleados?.apellidos}
            </p>
          </div>
          <button 
            onClick={onClose} 
            disabled={loading}
            className="
              p-2 sm:p-2.5 rounded-full bg-neutral-100 dark:bg-neutral-800 
              hover:bg-neutral-200 dark:hover:bg-neutral-700 
              text-neutral-600 dark:text-neutral-300 transition-colors
            "
          >
            <X size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Opciones de Acción */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Adelantar Cuota */}
            <button
              type="button"
              onClick={() => setAccion('cuota')}
              className={`
                p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200
                flex flex-col items-start gap-2
                ${accion === 'cuota' 
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-sm' 
                  : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 hover:border-emerald-300 dark:hover:border-emerald-800/50'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${accion === 'cuota' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                  <HandCoins size={20} />
                </div>
                <div>
                  <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${accion === 'cuota' ? 'text-emerald-700 dark:text-emerald-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    Abonar Cuota
                  </p>
                  <p className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white tabular-nums">
                    {formatMoney(cuotaNormal)}
                  </p>
                </div>
              </div>
            </button>

            {/* Liquidar Total (solo si no es el último pago) */}
            {!esUltimoPago && (
              <button
                type="button"
                onClick={() => setAccion('liquidar')}
                className={`
                  p-4 sm:p-5 rounded-2xl border-2 text-left transition-all duration-200
                  flex flex-col items-start gap-2
                  ${accion === 'liquidar' 
                    ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10 shadow-sm' 
                    : 'border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/50 hover:border-emerald-300 dark:hover:border-emerald-800/50'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${accion === 'liquidar' ? 'bg-emerald-500 text-white' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'}`}>
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${accion === 'liquidar' ? 'text-emerald-700 dark:text-emerald-400' : 'text-neutral-500 dark:text-neutral-400'}`}>
                      Liquidar Restante
                    </p>
                    <p className="text-lg sm:text-xl font-black text-neutral-900 dark:text-white tabular-nums">
                      {formatMoney(saldo)}
                    </p>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Botón Confirmar */}
          <button 
            type="submit" 
            disabled={loading}
            className="
              w-full bg-emerald-600 hover:bg-emerald-700 
              text-white font-bold py-3.5 sm:py-4 rounded-xl sm:rounded-2xl 
              flex items-center justify-center gap-2 transition-all
              shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30
              disabled:opacity-50 disabled:cursor-not-allowed
              text-sm sm:text-base mt-2
            "
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin sm:w-5 sm:h-5" size={18} />
                <span>Procesando...</span>
              </>
            ) : (
              'Confirmar Abono'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}