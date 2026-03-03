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

  // Preview del cálculo (Reactivo)
  const preview = useMemo(() => {
    const montoNum = Number(form.monto);
    if (!montoNum || montoNum <= 0) return null;

    const cuota = montoNum >= 2000 ? 500 : 200;
    const pagos = Math.ceil(montoNum / cuota);
    
    return { cuota, pagos };
  }, [form.monto])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.empleado_id || !form.monto) return;

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={!loading ? onClose : undefined} />
      
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-[32px] shadow-2xl p-6 md:p-8 animate-in zoom-in-95 duration-300">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-black text-neutral-900 dark:text-white">Nuevo Préstamo</h2>
            <p className="text-xs text-neutral-500 font-medium">Asigna un préstamo a un empleado</p>
          </div>
          <button onClick={onClose} disabled={loading} className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors">
            <X size={18} className="text-neutral-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider ml-1">Empleado</label>
            <select 
              required
              value={form.empleado_id}
              onChange={e => setForm({...form, empleado_id: e.target.value})}
              className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm font-bold outline-none focus:border-orange-500"
            >
              <option value="">Selecciona un empleado...</option>
              {empleados.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.nombre} {emp.apellidos}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider ml-1">Monto del préstamo ($)</label>
            <input 
              type="number" 
              required
              min="1"
              step="any"
              placeholder="Ej. 2000"
              value={form.monto}
              onChange={e => setForm({...form, monto: e.target.value})}
              className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-lg font-black outline-none focus:border-orange-500 placeholder:font-medium placeholder:text-neutral-400"
            />
          </div>

          {/* Caja de Preview Inteligente */}
          <div className={`overflow-hidden transition-all duration-500 ${preview ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="bg-orange-500/10 border border-orange-500/20 p-4 rounded-2xl flex gap-3">
              <Info size={20} className="text-orange-500 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-orange-700 dark:text-orange-400 mb-1">Cálculo Automático</p>
                <p className="text-orange-600/80 dark:text-orange-300/80 leading-relaxed">
                  El sistema descontará <strong className="font-black text-orange-600 dark:text-orange-400">${preview?.cuota}</strong> semanales durante <strong className="font-black text-orange-600 dark:text-orange-400">{preview?.pagos} pagos</strong>.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider ml-1">Motivo (Opcional)</label>
            <input 
              type="text" 
              placeholder="Ej. Adelanto de quincena..."
              value={form.observaciones}
              onChange={e => setForm({...form, observaciones: e.target.value})}
              className="w-full p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm font-medium outline-none focus:border-orange-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl flex justify-center items-center gap-2 transition-all shadow-xl shadow-orange-500/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <span>Confirmar Préstamo</span>}
          </button>
        </form>

      </div>
    </div>
  )
}