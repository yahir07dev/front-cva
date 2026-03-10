'use client'

import { Calendar, Play, Loader2 } from 'lucide-react'

interface HeaderProps {
  plantillas: any[]
  plantillaId: number | string
  setPlantillaId: (id: number | string) => void
  periodoInicio: string
  setPeriodoInicio: (val: string) => void
  periodoFin: string
  setPeriodoFin: (val: string) => void
  fechaPago: string
  setFechaPago: (val: string) => void
  onCargar: () => void
  loading: boolean
}

export default function GenerarNominaHeader(props: HeaderProps) {
  return (
    <div className="relative z-10 bg-white dark:bg-neutral-900 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl shadow-sm mb-4 sm:mb-6 md:mb-8 animate-in slide-in-from-top-4">

      <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-5 md:mb-6">
        <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0">
          <Calendar size={15} className="sm:w-5 sm:h-5" />
        </div>
        <div>
          <h2 className="text-sm sm:text-base md:text-lg font-black tracking-tight text-neutral-900 dark:text-white">
            Parámetros de Nómina
          </h2>
          <p className="text-[9px] sm:text-xs font-medium text-neutral-500">
            Define el periodo y selecciona el grupo a pagar
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 md:gap-4">
        {/* Plantilla — ocupa las 2 columnas en móvil */}
        <div className="col-span-2 sm:col-span-1 space-y-1 sm:space-y-1.5">
          <label className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">
            Plantilla
          </label>
          <select
            value={props.plantillaId}
            onChange={(e) => props.setPlantillaId(e.target.value)}
            className="w-full p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm font-bold outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all"
          >
            <option value="">Selecciona un grupo...</option>
            {props.plantillas.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} ({p.dia_pago})</option>
            ))}
          </select>
        </div>

        {[
          { label: 'Inicio Periodo', val: props.periodoInicio, set: props.setPeriodoInicio },
          { label: 'Fin Periodo',    val: props.periodoFin,    set: props.setPeriodoFin    },
          { label: 'Fecha de Pago',  val: props.fechaPago,     set: props.setFechaPago     },
        ].map(({ label, val, set }) => (
          <div key={label} className="space-y-1 sm:space-y-1.5">
            <label className="text-[9px] sm:text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">
              {label}
            </label>
            <input
              type="date" value={val}
              onChange={(e) => set(e.target.value)}
              className="w-full p-2.5 sm:p-3 md:p-3.5 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm font-bold outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 transition-all"
            />
          </div>
        ))}
      </div>

      <div className="mt-4 sm:mt-5 md:mt-6">
        <button
          onClick={props.onCargar}
          disabled={props.loading || !props.plantillaId}
          className="
            w-full sm:w-auto sm:ml-auto flex items-center justify-center gap-2
            bg-black dark:bg-white text-white dark:text-black
            px-5 sm:px-6 py-3 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl
            font-bold text-xs sm:text-sm
            hover:scale-[1.02] active:scale-95 transition-all
            disabled:opacity-50 shadow-xl shadow-black/10
          "
        >
          {props.loading ? (
            <>
              <Loader2 size={15} className="sm:w-[17px] sm:h-[17px] animate-spin" />
              <span>Generando...</span>
            </>
          ) : (
            <>
              <Play size={15} className="sm:w-[17px] sm:h-[17px]" fill="currentColor" />
              <span>Generar Hoja de Cálculo</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}