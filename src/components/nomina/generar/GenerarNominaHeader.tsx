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
    <div className="w-full relative z-10 bg-white dark:bg-neutral-900 p-4 sm:p-5 md:p-6 rounded-2xl sm:rounded-3xl shadow-sm mb-4 sm:mb-6 md:mb-8 animate-in slide-in-from-top-4">

      {/* HEADER TÍTULO Y BOTÓN (Alineados horizontalmente en Desktop) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 md:mb-6 border-b border-neutral-100 dark:border-neutral-800 pb-4 md:pb-5">
        
        {/* Título */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-xl md:rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 shrink-0">
            <Calendar size={20} className="md:w-6 md:h-6" />
          </div>
          <div>
            <h2 className="text-base md:text-xl font-black tracking-tight text-neutral-900 dark:text-white">
              Parámetros de Nómina
            </h2>
            <p className="text-xs md:text-sm font-medium text-neutral-500">
              Define el periodo y selecciona el grupo a pagar
            </p>
          </div>
        </div>

        {/* Botón de Generar (Movido arriba en Desktop para ahorrar espacio vertical) */}
        <button
          onClick={props.onCargar}
          disabled={props.loading || !props.plantillaId}
          className="
            w-full md:w-auto flex items-center justify-center gap-2 shrink-0
            bg-neutral-900 dark:bg-white text-white dark:text-black
            px-6 py-3.5 md:py-3 rounded-xl md:rounded-2xl
            font-bold text-sm md:text-sm
            hover:scale-[1.02] hover:shadow-lg active:scale-95 transition-all
            disabled:opacity-50 shadow-md shadow-black/10 dark:shadow-none
          "
        >
          {props.loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Generando...</span>
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" />
              <span>Generar Hoja de Cálculo</span>
            </>
          )}
        </button>
      </div>

      {/* FORMULARIO DE PARÁMETROS (Grid horizontal expansivo) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Plantilla */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">
            Plantilla a Pagar
          </label>
          <select
            value={props.plantillaId}
            onChange={(e) => props.setPlantillaId(e.target.value)}
            className="w-full p-3 md:p-3.5 rounded-xl md:rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm font-bold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all cursor-pointer"
          >
            <option value="" className="text-neutral-500">Selecciona un grupo...</option>
            {props.plantillas.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} ({p.dia_pago})</option>
            ))}
          </select>
        </div>

        {/* Fechas (Mapeadas) */}
        {[
          { label: 'Inicio del Periodo', val: props.periodoInicio, set: props.setPeriodoInicio },
          { label: 'Fin del Periodo',    val: props.periodoFin,    set: props.setPeriodoFin    },
          { label: 'Fecha de Pago',      val: props.fechaPago,     set: props.setFechaPago     },
        ].map(({ label, val, set }) => (
          <div key={label} className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">
              {label}
            </label>
            <input
              type="date" 
              value={val}
              onChange={(e) => set(e.target.value)}
              className="w-full p-3 md:p-3.5 rounded-xl md:rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm font-bold outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all text-neutral-800 dark:text-neutral-200"
            />
          </div>
        ))}
      </div>

    </div>
  )
}