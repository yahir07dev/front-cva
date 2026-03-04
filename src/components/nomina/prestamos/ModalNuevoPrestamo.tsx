'use client'

import { useState, useMemo } from 'react'
import { X, Loader2, Info } from 'lucide-react'
import { NuevoPrestamo } from '@/src/services/prestamosService'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  empleados: any[]
  onSave: (datos: NuevoPrestamo) => Promise<void>
}

export default function ModalNuevoPrestamo({ isOpen, onClose, empleados, onSave }: ModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ empleado_id: '', monto: '', observaciones: '' })

  const preview = useMemo(() => {
    const montoNum = Number(form.monto)
    if (!montoNum || montoNum <= 0) return null

    const cuota = montoNum >= 2000 ? 500 : 200
    const pagos = Math.ceil(montoNum / cuota)
    
    return { cuota, pagos }
  }, [form.monto])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.empleado_id || !form.monto) return

    setLoading(true)
    try {
      await onSave({
        empleado_id: Number(form.empleado_id),
        monto_total: Number(form.monto),
        observaciones: form.observaciones
      })
      setForm({ empleado_id: '', monto: '', observaciones: '' })
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
              Nuevo Préstamo
            </h2>
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">
              Asigna un préstamo a un empleado
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
          
          {/* Empleado */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide ml-1">
              Empleado
            </label>
            <select 
              required
              value={form.empleado_id}
              onChange={e => setForm({...form, empleado_id: e.target.value})}
              className="
                w-full px-4 py-3.5 rounded-2xl bg-white/50 dark:bg-neutral-950/40 
                border border-emerald-200/40 dark:border-emerald-900/30
                text-sm font-semibold outline-none 
                focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20
                transition-all cursor-pointer
              "
            >
              <option value="">Selecciona un empleado...</option>
              {empleados.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.nombre} {emp.apellidos}
                </option>
              ))}
            </select>
          </div>

          {/* Monto */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide ml-1">
              Monto del préstamo ($)
            </label>
            <input 
              type="number" 
              required
              min="1"
              step="any"
              placeholder="Ej. 2000"
              value={form.monto}
              onChange={e => setForm({...form, monto: e.target.value})}
              className="
                w-full px-4 py-3.5 rounded-2xl bg-white/50 dark:bg-neutral-950/40 
                border border-emerald-200/40 dark:border-emerald-900/30
                text-lg font-black outline-none 
                focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20
                transition-all placeholder:font-medium placeholder:text-neutral-400/70
              "
            />
          </div>

          {/* Preview inteligente */}
          <div className={`
            overflow-hidden transition-all duration-500 ease-in-out
            ${preview ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'}
          `}>
            <div className="
              bg-emerald-500/10 dark:bg-emerald-900/20 
              border border-emerald-200/40 dark:border-emerald-800/30 
              p-4 rounded-2xl flex gap-3 items-start
            ">
              <Info size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300 mb-1">
                  Cálculo automático
                </p>
                <p className="text-emerald-600/90 dark:text-emerald-300/90 leading-relaxed">
                  Se descontarán <strong className="font-black text-emerald-700 dark:text-emerald-400">${preview?.cuota}</strong> semanales durante 
                  <strong className="font-black text-emerald-700 dark:text-emerald-400"> {preview?.pagos} pagos</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide ml-1">
              Motivo (Opcional)
            </label>
            <input 
              type="text" 
              placeholder="Ej. Adelanto de quincena..."
              value={form.observaciones}
              onChange={e => setForm({...form, observaciones: e.target.value})}
              className="
                w-full px-4 py-3.5 rounded-2xl bg-white/50 dark:bg-neutral-950/40 
                border border-emerald-200/40 dark:border-emerald-900/30
                text-sm font-medium outline-none 
                focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20
                transition-all placeholder:text-neutral-400/70
              "
            />
          </div>

          {/* Botón principal */}
          <button 
            type="submit" 
            disabled={loading}
            className="
              w-full mt-2 bg-emerald-600 hover:bg-emerald-700 
              text-white font-bold py-4 rounded-2xl 
              flex items-center justify-center gap-2 transition-all
              shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Confirmar Préstamo'}
          </button>
        </form>
      </div>
    </div>
  )
}