'use client'

import { useState } from 'react'
import { Users, Search, CheckCircle2, ChevronDown } from 'lucide-react'

interface AreaAssignmentProps {
  empleados: any[]
  areas: any[]
  onUpdate: (empleadoId: number, areaId: number | null) => Promise<void>
}

export default function AreaAssignment({ empleados, areas, onUpdate }: AreaAssignmentProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const [successId, setSuccessId] = useState<number | null>(null)

  const filteredEmpleados = empleados.filter(emp => 
    `${emp.nombre} ${emp.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCambioArea = async (empleadoId: number, nuevaAreaId: string) => {
    if (isUpdating === empleadoId) return;
    setIsUpdating(empleadoId)
    
    try {
      const areaId = nuevaAreaId === "null" ? null : Number(nuevaAreaId)
      await onUpdate(empleadoId, areaId)
      
      setSuccessId(empleadoId)
      setTimeout(() => setSuccessId(null), 2000)
    } catch (error) {
      console.error("Error al asignar:", error)
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 rounded-3xl md:rounded-3xl overflow-hidden shadow-sm">
      
      {/* Header Compacto */}
      <div className="flex-none p-4 border-b border-neutral-100 dark:border-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-blue-500/10 rounded-lg text-blue-600">
            <Users size={16} />
          </div>
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">Personal</h3>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={14} />
          <input 
            type="text"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border-transparent text-sm outline-none focus:bg-white dark:focus:bg-black focus:ring-1 focus:ring-blue-500/30 transition-all"
          />
        </div>
      </div>

      {/* LISTA CON SCROLLBAR VISIBLE */}
      <div className="flex-1 overflow-y-auto max-h-[500px] p-1 space-y-0.5 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent">
        {filteredEmpleados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-neutral-400 text-xs italic">
            <p>Sin resultados</p>
          </div>
        ) : (
          filteredEmpleados.map((emp) => (
            <div 
              key={`${emp.id}-${emp.area_id}`} 
              className="flex items-center justify-between p-2 rounded-xl transition-all hover:bg-neutral-50 dark:hover:bg-white/5"
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                <div className="relative shrink-0">
                  <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-bold text-[10px] overflow-hidden border border-blue-100 dark:border-0">
                    {emp.foto_perfil_url ? (
                      <img src={emp.foto_perfil_url} className="h-full w-full object-cover" referrerPolicy="no-referrer" alt="" />
                    ) : (
                      <span>{emp.nombre.charAt(0)}</span>
                    )}
                  </div>
                  {successId === emp.id && (
                    <div className="absolute -top-0.5 -right-0.5 bg-green-500 text-white rounded-full p-0.5 shadow-sm animate-in zoom-in">
                      <CheckCircle2 size={10} />
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-bold text-neutral-900 dark:text-neutral-200 truncate">
                    {emp.nombre} {emp.apellidos}
                  </p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className={`h-1 w-1 rounded-full ${emp.area_id ? 'bg-blue-500' : 'bg-rose-500'}`} />
                    <p className="text-[9px] text-neutral-500 dark:text-neutral-400 uppercase font-bold tracking-tight truncate max-w-[80px]">
                      {areas.find(a => a.id === emp.area_id)?.nombre || 'S.A.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Selector */}
              <div className="relative ml-2 shrink-0">
                <select 
                  disabled={isUpdating === emp.id}
                  value={emp.area_id?.toString() || "null"}
                  onChange={(e) => handleCambioArea(emp.id, e.target.value)}
                  className={`
                    appearance-none text-[10px] font-bold py-1.5 pl-2 pr-6 rounded-lg
                    bg-neutral-100 dark:bg-neutral-800 border-none outline-none
                    text-neutral-700 dark:text-neutral-300 cursor-pointer
                    focus:ring-1 focus:ring-blue-500/20 transition-all max-w-[100px]
                    ${isUpdating === emp.id ? 'opacity-50' : 'hover:bg-neutral-200 dark:hover:bg-neutral-700'}
                  `}
                >
                  <option value="null">Ninguna</option>
                  {areas.map(area => (
                    <option key={area.id} value={area.id.toString()}>{area.nombre}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}