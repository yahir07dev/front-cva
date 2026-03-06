'use client'

import { AlertTriangle, Search, Trophy, ArrowDown } from 'lucide-react'
import Image from 'next/image'

interface RankingListProps {
  empleados: any[]
  isAdmin: boolean
  filtroNombre: string
  setFiltroNombre: (val: string) => void
}

export default function RankingList({ empleados, isAdmin, filtroNombre, setFiltroNombre }: RankingListProps) {
  
  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 md:border border-neutral-200 dark:border-0 rounded-3xl overflow-hidden shadow-sm">
      
      {/* Header Ranking */}
      <div className="flex-none p-5 border-b border-neutral-100 dark:border-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
            <div className="p-1.5 bg-orange-100 dark:bg-orange-500/10 rounded-lg text-orange-600 dark:text-orange-400">
              <Trophy size={18} /> 
            </div>
            {isAdmin ? 'Top Score (Puntos)' : 'Mi Posición'}
          </h3>
        </div>
        
        {isAdmin && (
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-orange-500 transition-colors" size={16} />
            <input 
              type="text" 
              placeholder="Buscar colaborador..." 
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border-transparent text-sm outline-none focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
          </div>
        )}
      </div>
      
      {/* Lista Scrollable */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
        {empleados.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-neutral-400 text-sm italic">
            <p>Sin datos disponibles</p>
          </div>
        ) : (
          empleados.map((emp, index) => {
            const rank = isAdmin ? index + 1 : empleados.findIndex(e => e.id === emp.id) + 1;
            const isTop3 = rank <= 3 && !emp.enRiesgo; // Solo es top 3 si su score es positivo
            
            return (
              <div 
                key={emp.id} 
                className={`
                  flex items-center justify-between p-3 rounded-xl transition-all group
                  ${emp.enRiesgo ? 'bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30' : 'hover:bg-neutral-50 dark:hover:bg-white/5'}
                  ${isTop3 && isAdmin ? 'bg-orange-50/30 dark:bg-orange-500/5' : ''}
                `}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Posición o Alerta */}
                  <div className={`
                    flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold
                    ${emp.enRiesgo ? 'bg-rose-100 text-rose-600' :
                      rank === 1 ? 'bg-yellow-400 text-yellow-900' : 
                      rank === 2 ? 'bg-neutral-300 text-neutral-800' : 
                      rank === 3 ? 'bg-amber-600 text-amber-100' : 
                      'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}
                  `}>
                    {emp.enRiesgo ? <ArrowDown size={14} /> : `#${rank}`}
                  </div>

                  {/* Avatar */}
                  <div className="relative h-10 w-10 shrink-0 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-700">
                    {emp.foto_perfil_url ? (
                      <Image src={emp.foto_perfil_url} alt="" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs font-bold text-neutral-500">
                        {emp.nombre?.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Nombre y Alerta */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className={`text-sm font-bold truncate transition-colors ${emp.enRiesgo ? 'text-rose-600 dark:text-rose-400' : 'text-neutral-900 dark:text-neutral-200 group-hover:text-orange-600'}`}>
                        {emp.nombre}
                      </p>
                      {emp.enRiesgo && (
                        <AlertTriangle size={12} className="text-rose-500 animate-pulse" />
                      )}
                    </div>
                    {emp.enRiesgo ? (
                      <p className="text-[9px] text-rose-500 font-bold uppercase tracking-wide truncate">
                        Sanción por bajo rendimiento
                      </p>
                    ) : (
                      <p className="text-[10px] text-neutral-400 font-medium uppercase tracking-wide truncate">
                        {emp.apellidos}
                      </p>
                    )}
                  </div>
                </div>

                {/* Score Total */}
                <div className="text-right">
                  <div className={`text-lg font-black ${emp.enRiesgo ? 'text-rose-600' : 'text-neutral-900 dark:text-white'}`}>
                    {emp.score}
                  </div>
                  <div className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 inline-block ${emp.enRiesgo ? 'bg-rose-100 text-rose-600' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500'}`}>
                    PUNTOS
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}