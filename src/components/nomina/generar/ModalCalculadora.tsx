'use client'

import { useState, useEffect } from 'react'
import { X, Calculator, PlusCircle, CalendarClock, DollarSign } from 'lucide-react'
import { ValoresCalculadora } from '@/src/hooks/nomina/useGenerarNomina'

interface ModalCalculadoraProps {
  isOpen: boolean
  onClose: () => void
  empleadoNombre: string
  onApply: (valores: ValoresCalculadora) => void
}

export default function ModalCalculadora({ isOpen, onClose, empleadoNombre, onApply }: ModalCalculadoraProps) {
  const [diasNormales, setDiasNormales] = useState(6)
  const [descanso, setDescanso] = useState(1)
  const [diasExtra, setDiasExtra] = useState(0)
  const [mediosTurnos, setMediosTurnos] = useState(0)
  const [horas, setHoras] = useState(0)
  const [diasEspeciales, setDiasEspeciales] = useState(0)
  const [precioEspecial, setPrecioEspecial] = useState(250)

  useEffect(() => {
    if (isOpen) {
      setDiasNormales(6)
      setDescanso(1)
      setDiasExtra(0)
      setMediosTurnos(0)
      setHoras(0)
      setDiasEspeciales(0)
      setPrecioEspecial(250)
    }
  }, [isOpen])

  // Cerrar con Escape
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal: bottom sheet en móvil, centered en desktop */}
      <div className="
        relative w-full sm:max-w-md
        bg-white dark:bg-neutral-900
        rounded-t-3xl sm:rounded-3xl
        shadow-2xl shadow-black/20 dark:shadow-black/50
        flex flex-col
        max-h-[92dvh] sm:max-h-[88vh]
        animate-in slide-in-from-bottom sm:zoom-in-95 fade-in duration-200
      ">
        {/* Indicador de arrastre (solo móvil) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        </div>

        {/* Header fijo */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-3 sm:pt-5 pb-3 sm:pb-4 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shrink-0">
              <Calculator size={15} className="sm:w-[17px] sm:h-[17px]" />
            </div>
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                Ajuste de Asistencia
              </p>
              <h2 className="text-base sm:text-xl font-black text-neutral-900 dark:text-white leading-tight truncate">
                {empleadoNombre}
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-500 transition-colors shrink-0 ml-2"
          >
            <X size={16} />
          </button>
        </div>

        {/* Cuerpo con scroll interno */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-5 space-y-5 sm:space-y-6">

          {/* 1. Asistencia Regular */}
          <section>
            <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
              <CalendarClock size={13} className="text-emerald-600/80" />
              Asistencia Regular
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/80">
                <span className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-200">Días Normales</span>
                <input
                  type="number" min={0} max={7} value={diasNormales}
                  onChange={e => setDiasNormales(Number(e.target.value))}
                  className="w-16 sm:w-20 text-center bg-transparent border-b-2 border-transparent focus:border-emerald-500 text-base sm:text-lg font-bold outline-none transition-all tabular-nums"
                />
              </div>
              <div className="flex justify-between items-center p-3 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/80">
                <span className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-200">Día Descanso</span>
                <select
                  value={descanso}
                  onChange={e => setDescanso(Number(e.target.value))}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-xs sm:text-sm font-semibold outline-none cursor-pointer transition-all"
                >
                  <option value={1}>Pagado (100%)</option>
                  <option value={0.5}>Medio (50%)</option>
                  <option value={0}>Sin Pagar</option>
                </select>
              </div>
            </div>
          </section>

          {/* 2. Tiempo Extra */}
          <section>
            <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
              <PlusCircle size={13} className="text-emerald-600/80" />
              Tiempo Extra Trabajado
            </h4>
            <div className="space-y-2">
              {[
                { label: 'Días Extra Completos', desc: 'Trabajó en su descanso', val: diasExtra, set: setDiasExtra },
                { label: 'Medios Turnos Extra', desc: 'Equivale a 5 horas', val: mediosTurnos, set: setMediosTurnos },
                { label: 'Horas Sueltas', desc: null, val: horas, set: setHoras },
              ].map(({ label, desc, val, set }) => (
                <div key={label} className="flex justify-between items-center p-3 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/80">
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-200">{label}</span>
                    {desc && <p className="text-[9px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">{desc}</p>}
                  </div>
                  <input
                    type="number" min={0} value={val}
                    onChange={e => set(Number(e.target.value))}
                    className="w-16 sm:w-20 text-center bg-transparent border-b-2 border-transparent focus:border-emerald-500 text-base sm:text-lg font-bold outline-none transition-all tabular-nums"
                  />
                </div>
              ))}
            </div>
          </section>

          {/* 3. Tarifas Especiales */}
          <section>
            <h4 className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-1.5">
              <DollarSign size={13} className="text-emerald-600/80" />
              Tarifas Especiales
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/80">
                <div className="min-w-0 flex-1 pr-2">
                  <span className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-200">Días con Tarifa Fija</span>
                  <p className="text-[9px] sm:text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Reemplaza el sueldo base</p>
                </div>
                <input
                  type="number" min={0} max={7} value={diasEspeciales}
                  onChange={e => setDiasEspeciales(Number(e.target.value))}
                  className="w-16 sm:w-20 text-center bg-transparent border-b-2 border-transparent focus:border-emerald-500 text-base sm:text-lg font-bold outline-none transition-all tabular-nums"
                />
              </div>
              {diasEspeciales > 0 && (
                <div className="flex justify-between items-center p-3 sm:p-4 rounded-xl bg-neutral-50 dark:bg-neutral-950/80 animate-in slide-in-from-top-2">
                  <span className="text-xs sm:text-sm font-semibold text-neutral-700 dark:text-neutral-200">Precio del Día Fijo</span>
                  <div className="relative w-24 sm:w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold text-sm">$</span>
                    <input
                      type="number" min={0} value={precioEspecial}
                      onChange={e => setPrecioEspecial(Number(e.target.value))}
                      className="w-full pl-7 pr-2 py-2 text-right bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-sm font-bold outline-none transition-all tabular-nums"
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Botón fijo al fondo */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-t border-neutral-100 dark:border-neutral-800 shrink-0 bg-white dark:bg-neutral-900 rounded-b-3xl">
          <button
            onClick={() => {
              onApply({ diasNormales, descanso, diasExtra, mediosTurnos, horas, diasEspeciales, precioEspecial })
              onClose()
            }}
            className="
              w-full bg-emerald-600 hover:bg-emerald-700
              text-white py-3.5 sm:py-4 rounded-2xl text-sm sm:text-base font-bold
              shadow-lg shadow-emerald-600/20 dark:shadow-emerald-700/30
              transition-all hover:scale-[1.01] active:scale-[0.98]
            "
          >
            Calcular y Aplicar
          </button>
        </div>
      </div>
    </div>
  )
}