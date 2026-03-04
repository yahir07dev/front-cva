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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={!loading ? onClose : undefined} 
      />

      {/* Modal */}
      <div className="
        relative w-full max-w-md bg-white/70 dark:bg-neutral-900/70 
        backdrop-blur-xl border border-emerald-200/30 dark:border-emerald-900/30
        rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/40
        p-6 md:p-8 animate-in zoom-in-95 fade-in duration-300
      ">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-7">
          <div>
            <h2 className="text-2xl font-black text-neutral-900 dark:text-white leading-tight">
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
              p-2.5 rounded-full bg-neutral-100/80 dark:bg-neutral-800/60 
              hover:bg-neutral-200/80 dark:hover:bg-neutral-700/60 
              text-neutral-600 dark:text-neutral-300 transition-colors
            "
          >
            <X size={20} />
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
                p-5 rounded-2xl border text-left transition-all duration-200
                flex flex-col items-start gap-2
                ${accion === 'cuota' 
                  ? 'bg-emerald-500/10 border-emerald-500 shadow-sm' 
                  : 'bg-white/50 dark:bg-neutral-950/40 border-emerald-200/40 dark:border-emerald-900/30 hover:border-emerald-400/60'}
              `}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <HandCoins size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                    Adelantar Cuota
                  </p>
                  <p className="text-xl font-black text-neutral-900 dark:text-white tabular-nums">
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
                  p-5 rounded-2xl border text-left transition-all duration-200
                  flex flex-col items-start gap-2
                  ${accion === 'liquidar' 
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-sm' 
                    : 'bg-white/50 dark:bg-neutral-950/40 border-emerald-200/40 dark:border-emerald-900/30 hover:border-emerald-400/60'}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                      Liquidar Total
                    </p>
                    <p className="text-xl font-black text-neutral-900 dark:text-white tabular-nums">
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
              text-white font-bold py-4 rounded-2xl 
              flex items-center justify-center gap-2 transition-all
              shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Registrar Abono'}
          </button>
        </form>
      </div>
    </div>
  )
}