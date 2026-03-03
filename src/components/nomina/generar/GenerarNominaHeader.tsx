'use client'

import { Calendar, Users, Play, Loader2 } from 'lucide-react'

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
    <div className="bg-white dark:bg-neutral-900 p-5 sm:p-6 rounded-[32px] border border-neutral-200/60 dark:border-neutral-800 shadow-sm mb-8 animate-in slide-in-from-top-4">
      
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
          <Calendar size={20} />
        </div>
        <div>
          <h2 className="text-lg font-black tracking-tight text-neutral-900 dark:text-white">Parámetros de Nómina</h2>
          <p className="text-xs font-medium text-neutral-500">Define el periodo y selecciona el grupo a pagar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">Plantilla</label>
          <select 
            value={props.plantillaId} 
            onChange={(e) => props.setPlantillaId(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm font-bold outline-none focus:border-orange-500 transition-all"
          >
            <option value="">Selecciona un grupo...</option>
            {props.plantillas.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} ({p.dia_pago})</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">Inicio Periodo</label>
          <input 
            type="date" value={props.periodoInicio} onChange={(e) => props.setPeriodoInicio(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm font-bold outline-none focus:border-orange-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">Fin Periodo</label>
          <input 
            type="date" value={props.periodoFin} onChange={(e) => props.setPeriodoFin(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm font-bold outline-none focus:border-orange-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider ml-1">Fecha de Pago</label>
          <input 
            type="date" value={props.fechaPago} onChange={(e) => props.setFechaPago(e.target.value)}
            className="w-full p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm font-bold outline-none focus:border-orange-500"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button 
          onClick={props.onCargar}
          disabled={props.loading || !props.plantillaId}
          className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3.5 rounded-2xl font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 shadow-xl shadow-black/10"
        >
          {props.loading ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} fill="currentColor" />}
          <span>Generar Hoja de Cálculo</span>
        </button>
      </div>

    </div>
  )
}