'use client'

import { useState } from 'react'
import { X, Loader2, HandCoins, CheckCircle2 } from 'lucide-react'

interface ModalAbonoProps {
  isOpen: boolean;
  onClose: () => void;
  prestamo: any; // El préstamo seleccionado
  onAbonar: (id: number, monto: number, omitir: boolean, motivo: string) => Promise<void>;
}

export default function ModalAbono({ isOpen, onClose, prestamo, onAbonar }: ModalAbonoProps) {
  const [loading, setLoading] = useState(false)
  // Ahora las opciones son 'cuota' (abono normal) o 'liquidar' (pago total)
  const [accion, setAccion] = useState<'cuota' | 'liquidar'>('cuota')

  if (!isOpen || !prestamo) return null;

  const cuota = Number(prestamo.cuota_semanal);
  const saldo = Number(prestamo.saldo_restante);
  // Calculamos la cuota normal (si ya debe menos de la cuota, solo le cobramos lo que debe)
  const cuotaNormal = cuota > saldo ? saldo : cuota; 

  const formatMoney = (num: number) => 
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(num)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      // Si elige liquidar, le mandamos el saldo total. Si no, la cuota normal.
      const montoACobrar = accion === 'liquidar' ? saldo : cuotaNormal;
      
      // Llamamos a la función (omitir siempre en false y sin motivo)
      await onAbonar(prestamo.id, montoACobrar, false, '')
      setAccion('cuota')
      onClose()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Si es su último pago de todos modos (la cuota normal cubre el saldo), 
  // la UI se verá igual en ambos, lo cual es correcto.
  const esUltimoPago = cuotaNormal === saldo;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-[32px] shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-300">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black text-neutral-900 dark:text-white">Pago Manual Adelantado</h2>
            <p className="text-xs text-neutral-500 font-medium">Empleado: {prestamo.empleados?.nombre} {prestamo.empleados?.apellidos}</p>
          </div>
          <button onClick={onClose} disabled={loading} className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
            <X size={18} className="text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Opciones de Acción */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setAccion('cuota')}
              className={`p-4 rounded-2xl border text-left transition-all ${accion === 'cuota' ? 'bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400' : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-500'}`}
            >
              <HandCoins size={20} className="mb-2" />
              <p className="text-[10px] font-bold uppercase tracking-wider">Adelantar Cuota</p>
              <p className="text-lg font-black">{formatMoney(cuotaNormal)}</p>
            </button>

            {!esUltimoPago && (
              <button
                type="button"
                onClick={() => setAccion('liquidar')}
                className={`p-4 rounded-2xl border text-left transition-all ${accion === 'liquidar' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400' : 'bg-neutral-50 dark:bg-neutral-950 border-neutral-200 dark:border-neutral-800 text-neutral-500'}`}
              >
                <CheckCircle2 size={20} className="mb-2" />
                <p className="text-[10px] font-bold uppercase tracking-wider">Liquidar Total</p>
                <p className="text-lg font-black">{formatMoney(saldo)}</p>
              </button>
            )}
          </div>

          {/* Botón de Confirmación */}
          <button 
            type="submit" 
            disabled={loading}
            className={`w-full font-bold py-4 rounded-2xl flex justify-center items-center gap-2 transition-all disabled:opacity-50 text-white ${accion === 'cuota' ? 'bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/20' : 'bg-emerald-500 hover:bg-emerald-600 shadow-xl shadow-emerald-500/20'}`}
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Registrar Pago Manual</span>}
          </button>
        </form>

      </div>
    </div>
  )
}