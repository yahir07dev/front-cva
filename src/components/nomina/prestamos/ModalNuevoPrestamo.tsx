'use client'

import { useState, useMemo } from 'react'
import { X, Loader2, Info, ChevronDown, Check } from 'lucide-react'
import { NuevoPrestamo } from '@/src/services/nomina/prestamosService'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  empleados: any[]
  onSave: (datos: NuevoPrestamo) => Promise<void>
}

export default function ModalNuevoPrestamo({ isOpen, onClose, empleados, onSave }: ModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ empleado_id: '', monto: '', observaciones: '' })
  
  // Estado para controlar nuestro selector personalizado
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const preview = useMemo(() => {
    const montoNum = Number(form.monto)
    if (!montoNum || montoNum <= 0) return null

    const cuota = montoNum >= 2000 ? 500 : 200
    const pagos = Math.ceil(montoNum / cuota)

    return { cuota, pagos }
  }, [form.monto])

  // Encontrar el empleado seleccionado para mostrar su nombre
  const empleadoSeleccionado = useMemo(() => {
    return empleados.find(emp => String(emp.id) === form.empleado_id)
  }, [empleados, form.empleado_id])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validación manual rápida ya que quitamos el <select required>
    if (!form.empleado_id) {
      alert("Por favor, selecciona un empleado.")
      return
    }
    if (!form.monto) return

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
        onClick={!loading ? onClose : undefined}
      />

      {/* Modal */}
      <div className="
        relative w-full max-w-md bg-white dark:bg-neutral-900 
        rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/20 dark:shadow-black/40
        p-5 sm:p-6 md:p-8 animate-in zoom-in-95 fade-in duration-300
      ">

        {/* Header */}
        <div className="flex justify-between items-start mb-5 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white leading-tight">
              Nuevo Préstamo
            </h2>
            <p className="text-xs sm:text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">
              Asigna un préstamo a un empleado
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

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

          {/* SELECTOR DE EMPLEADO PERSONALIZADO 👇 */}
          <div className="space-y-1 relative">
            <label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide ml-1">
              Empleado
            </label>
            
            {/* Botón que abre/cierra el dropdown */}
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`
                w-full px-4 py-3.5 rounded-xl sm:rounded-2xl 
                bg-neutral-50 dark:bg-neutral-950/80 
                border ${isDropdownOpen ? 'border-emerald-500 ring-1 ring-emerald-500/20' : 'border-neutral-200 dark:border-neutral-800'}
                text-sm font-semibold outline-none 
                transition-all cursor-pointer flex justify-between items-center
              `}
            >
              <span className={empleadoSeleccionado ? 'text-neutral-900 dark:text-white' : 'text-neutral-400 dark:text-neutral-500'}>
                {empleadoSeleccionado ? `${empleadoSeleccionado.nombre} ${empleadoSeleccionado.apellidos}` : 'Selecciona un empleado...'}
              </span>
              <ChevronDown size={18} className={`text-neutral-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Menú Desplegable */}
            {isDropdownOpen && (
              <>
                {/* Capa invisible para cerrar al hacer clic afuera */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsDropdownOpen(false)} 
                />
                
                <div className="absolute z-50 w-full mt-2 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 shadow-xl rounded-xl sm:rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-200 dark:scrollbar-thumb-emerald-900/50">
                    {empleados.length === 0 ? (
                      <div className="px-4 py-4 text-center text-sm text-neutral-500">No hay empleados activos</div>
                    ) : (
                      empleados.map(emp => {
                        const isSelected = String(form.empleado_id) === String(emp.id);
                        return (
                          <div
                            key={emp.id}
                            onClick={() => {
                              setForm({ ...form, empleado_id: String(emp.id) });
                              setIsDropdownOpen(false);
                            }}
                            className={`
                              flex items-center justify-between px-4 py-3 cursor-pointer transition-colors text-sm font-medium
                              ${isSelected
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                : 'hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                              }
                            `}
                          >
                            <span>{emp.nombre} {emp.apellidos}</span>
                            {isSelected && <Check size={16} className="text-emerald-500" />}
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Monto */}
          <div className="space-y-1">
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
              onChange={e => setForm({ ...form, monto: e.target.value })}
              className="
                w-full px-4 py-3.5 rounded-xl sm:rounded-2xl 
                bg-neutral-50 dark:bg-neutral-950/80 
                border border-neutral-200 dark:border-neutral-800
                text-base sm:text-lg font-black outline-none 
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
              bg-emerald-50 dark:bg-emerald-900/20 
              border border-emerald-200 dark:border-emerald-800/30 
              p-3 sm:p-4 rounded-xl sm:rounded-2xl flex gap-3 items-start
            ">
              <Info size={18} className="sm:w-5 sm:h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-semibold text-emerald-800 dark:text-emerald-300 mb-1">
                  Cálculo automático
                </p>
                <p className="text-emerald-700/90 dark:text-emerald-300/90 leading-relaxed">
                  Se descontarán <strong className="font-black text-emerald-800 dark:text-emerald-400">${preview?.cuota}</strong> semanales durante
                  <strong className="font-black text-emerald-800 dark:text-emerald-400"> {preview?.pagos} pagos</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide ml-1">
              Motivo (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej. Adelanto de quincena..."
              value={form.observaciones}
              onChange={e => setForm({ ...form, observaciones: e.target.value })}
              className="
                w-full px-4 py-3.5 rounded-xl sm:rounded-2xl 
                bg-neutral-50 dark:bg-neutral-950/80 
                border border-neutral-200 dark:border-neutral-800
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
              text-white font-bold py-3.5 sm:py-4 rounded-xl sm:rounded-2xl 
              flex items-center justify-center gap-2 transition-all
              shadow-lg shadow-emerald-600/20 hover:shadow-xl hover:shadow-emerald-600/30
              disabled:opacity-50 disabled:cursor-not-allowed
              text-sm sm:text-base
            "
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin sm:w-5 sm:h-5" size={18} />
                <span>Procesando...</span>
              </>
            ) : 'Confirmar Préstamo'}
          </button>
        </form>
      </div>
    </div>
  )
}