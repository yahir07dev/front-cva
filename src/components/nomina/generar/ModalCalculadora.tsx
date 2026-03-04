'use client'

import { useState, useEffect } from 'react'
import { X, Calculator, PlusCircle, CalendarClock, DollarSign } from 'lucide-react'
import { ValoresCalculadora } from '@/src/hooks/useGenerarNomina'

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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal container */}
      <div className="
        relative w-full max-w-md bg-white/70 dark:bg-neutral-900/70 
        backdrop-blur-xl border border-neutral-200/30 dark:border-neutral-800/40
        rounded-3xl shadow-2xl shadow-black/10 dark:shadow-black/40
        p-6 md:p-8 animate-in zoom-in-95 fade-in duration-200
        max-h-[92vh] overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-300/50 dark:scrollbar-thumb-emerald-700/50
      ">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-7 sticky top-0 bg-inherit backdrop-blur-sm z-10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
              <Calculator size={18} />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-700/90 dark:text-emerald-400/90">
                Ajuste de Asistencia
              </h3>
              <h2 className="text-xl md:text-2xl font-black text-neutral-900 dark:text-white mt-1 leading-tight">
                {empleadoNombre}
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 rounded-full bg-neutral-100/80 dark:bg-neutral-800/60 hover:bg-neutral-200/80 dark:hover:bg-neutral-700/60 text-neutral-600 dark:text-neutral-300 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-8">
          
          {/* 1. Asistencia Regular */}
          <section>
            <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2.5">
              <CalendarClock size={16} className="text-emerald-600/80" />
              Asistencia Regular
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/50 dark:bg-neutral-950/40 border border-emerald-200/30 dark:border-emerald-900/30 hover:border-emerald-400/40 transition-colors">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Días Normales</span>
                <input 
                  type="number" 
                  min={0} 
                  max={7} 
                  value={diasNormales} 
                  onChange={e => setDiasNormales(Number(e.target.value))} 
                  className="w-20 text-center bg-transparent border-b-2 border-transparent focus:border-emerald-500 text-lg font-bold outline-none transition-all tabular-nums" 
                />
              </div>

              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/50 dark:bg-neutral-950/40 border border-emerald-200/30 dark:border-emerald-900/30 hover:border-emerald-400/40 transition-colors">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Día Descanso</span>
                <select 
                  value={descanso} 
                  onChange={e => setDescanso(Number(e.target.value))} 
                  className="px-4 py-2.5 rounded-xl bg-white/60 dark:bg-neutral-900/50 border border-emerald-200/30 dark:border-emerald-800/30 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 text-sm font-semibold outline-none cursor-pointer transition-all"
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
            <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2.5">
              <PlusCircle size={16} className="text-emerald-600/80" />
              Tiempo Extra Trabajado
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/50 dark:bg-neutral-950/40 border border-emerald-200/30 dark:border-emerald-900/30 hover:border-emerald-400/40 transition-colors">
                <div>
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Días Extra Completos</span>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Trabajó en su descanso</p>
                </div>
                <input 
                  type="number" 
                  min={0} 
                  max={7} 
                  value={diasExtra} 
                  onChange={e => setDiasExtra(Number(e.target.value))} 
                  className="w-20 text-center bg-transparent border-b-2 border-transparent focus:border-emerald-500 text-lg font-bold outline-none transition-all tabular-nums" 
                />
              </div>

              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/50 dark:bg-neutral-950/40 border border-emerald-200/30 dark:border-emerald-900/30 hover:border-emerald-400/40 transition-colors">
                <div>
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Medios Turnos Extra</span>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Equivale a 5 horas</p>
                </div>
                <input 
                  type="number" 
                  min={0} 
                  value={mediosTurnos} 
                  onChange={e => setMediosTurnos(Number(e.target.value))} 
                  className="w-20 text-center bg-transparent border-b-2 border-transparent focus:border-emerald-500 text-lg font-bold outline-none transition-all tabular-nums" 
                />
              </div>

              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/50 dark:bg-neutral-950/40 border border-emerald-200/30 dark:border-emerald-900/30 hover:border-emerald-400/40 transition-colors">
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Horas Sueltas</span>
                <input 
                  type="number" 
                  min={0} 
                  value={horas} 
                  onChange={e => setHoras(Number(e.target.value))} 
                  className="w-20 text-center bg-transparent border-b-2 border-transparent focus:border-emerald-500 text-lg font-bold outline-none transition-all tabular-nums" 
                />
              </div>
            </div>
          </section>

          {/* 3. Tarifas Especiales */}
          <section>
            <h4 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2.5">
              <DollarSign size={16} className="text-emerald-600/80" />
              Tarifas Especiales
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-white/50 dark:bg-neutral-950/40 border border-emerald-200/30 dark:border-emerald-900/30 hover:border-emerald-400/40 transition-colors">
                <div>
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Días con Tarifa Fija</span>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Reemplaza el sueldo base</p>
                </div>
                <input 
                  type="number" 
                  min={0} 
                  max={7} 
                  value={diasEspeciales} 
                  onChange={e => setDiasEspeciales(Number(e.target.value))} 
                  className="w-20 text-center bg-transparent border-b-2 border-transparent focus:border-emerald-500 text-lg font-bold outline-none transition-all tabular-nums" 
                />
              </div>

              {diasEspeciales > 0 && (
                <div className="flex justify-between items-center p-4 rounded-2xl bg-white/50 dark:bg-neutral-950/40 border border-emerald-200/30 dark:border-emerald-900/30 animate-in slide-in-from-top-2">
                  <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">Precio del Día Fijo</span>
                  <div className="relative w-28">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 font-bold">$</span>
                    <input 
                      type="number" 
                      min={0} 
                      value={precioEspecial} 
                      onChange={e => setPrecioEspecial(Number(e.target.value))} 
                      className="w-full pl-8 pr-3 py-2.5 text-right bg-transparent border-b-2 border-transparent focus:border-emerald-500 text-lg font-bold outline-none transition-all tabular-nums" 
                    />
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Botón principal */}
        <button
          onClick={() => {
            onApply({ diasNormales, descanso, diasExtra, mediosTurnos, horas, diasEspeciales, precioEspecial })
            onClose()
          }}
          className="
            w-full mt-8 bg-emerald-600 hover:bg-emerald-700 
            text-white py-4 rounded-2xl text-base font-bold 
            shadow-lg shadow-emerald-600/20 dark:shadow-emerald-700/30 
            transition-all hover:scale-[1.02] active:scale-98
          "
        >
          Calcular y Aplicar
        </button>
      </div>
    </div>
  )
}