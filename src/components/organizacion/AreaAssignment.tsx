'use client'

import React, { useState, useMemo } from 'react'
import { Users, Search, CheckCircle2, ChevronDown, Loader2, Check } from 'lucide-react'

interface AreaAssignmentProps {
  empleados: any[]
  areas: any[]
  onUpdate: (empleadoId: number, areaId: number | null) => Promise<void>
}

const AreaAssignment = ({ empleados, areas, onUpdate }: AreaAssignmentProps) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isUpdating, setIsUpdating] = useState<number | null>(null)
  const [successId, setSuccessId] = useState<number | null>(null)
  
  // NUEVO: Controla qué dropdown de empleado está abierto actualmente
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null)

  // 🚀 Micro-optimización: Memorizamos la lista filtrada
  const filteredEmpleados = useMemo(() => {
    if (!searchTerm) return empleados;
    const lowerTerm = searchTerm.toLowerCase()
    return empleados.filter(emp => 
      `${emp.nombre} ${emp.apellidos}`.toLowerCase().includes(lowerTerm)
    )
  }, [empleados, searchTerm])

  const handleCambioArea = async (empleadoId: number, nuevaAreaId: string) => {
    if (isUpdating === empleadoId) return;
    
    // Cerramos el dropdown inmediatamente al seleccionar
    setOpenDropdownId(null);
    setIsUpdating(empleadoId);
    
    try {
      const areaId = nuevaAreaId === "null" ? null : Number(nuevaAreaId)
      await onUpdate(empleadoId, areaId)
      
      setSuccessId(empleadoId)
      setTimeout(() => setSuccessId(null), 2000)
    } catch (error: any) {
      alert("Error al asignar: " + error.message)
    } finally {
      setIsUpdating(null)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-neutral-900 rounded-3xl md:rounded-3xl overflow-hidden shadow-sm border border-neutral-200/50 dark:border-neutral-800">
      
      {/* Header Compacto */}
      <div className="flex-none p-4 border-b border-neutral-100 dark:border-neutral-800/60">
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
            placeholder="Buscar por nombre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border-transparent text-sm outline-none focus:bg-white dark:focus:bg-black focus:ring-1 focus:ring-blue-500/30 transition-all placeholder:text-neutral-400"
          />
        </div>
      </div>

      {/* LISTA CON SCROLLBAR VISIBLE */}
      <div className="flex-1 overflow-y-auto max-h-[500px] p-1 space-y-0.5 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent pb-10">
        {filteredEmpleados.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-neutral-400 text-xs italic">
            <p>Sin resultados</p>
          </div>
        ) : (
          filteredEmpleados.map((emp) => {
            const isDropdownOpen = openDropdownId === emp.id;
            
            return (
              <div 
                key={`${emp.id}-${emp.area_id}`} 
                // Elevamos el z-index de la fila activa para que el dropdown flote sobre las filas de abajo
                className={`flex items-center justify-between p-2 rounded-xl transition-all hover:bg-neutral-50 dark:hover:bg-white/5 group relative ${isDropdownOpen ? 'z-20' : 'z-0'}`}
              >
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 font-bold text-[10px] overflow-hidden border border-blue-100 dark:border-blue-800/30">
                      {emp.foto_perfil_url ? (
                        <img src={emp.foto_perfil_url} className="h-full w-full object-cover" referrerPolicy="no-referrer" alt={emp.nombre} />
                      ) : (
                        <span>{emp.nombre.charAt(0)}</span>
                      )}
                    </div>
                    {successId === emp.id && (
                      <div className="absolute -top-0.5 -right-0.5 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm animate-in zoom-in">
                        <CheckCircle2 size={10} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-neutral-900 dark:text-neutral-200 truncate">
                      {emp.nombre} {emp.apellidos}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${emp.area_id ? 'bg-blue-500' : 'bg-rose-500'}`} />
                      <p className="text-[9px] text-neutral-500 dark:text-neutral-400 uppercase font-bold tracking-tight truncate max-w-[80px]">
                        {areas.find(a => a.id === emp.area_id)?.nombre || 'S.A.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* SELECTOR CUSTOMIZADO */}
                <div className="relative ml-2 shrink-0">
                  {isUpdating === emp.id ? (
                    <div className="h-7 w-[95px] rounded-lg bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center opacity-70">
                      <Loader2 size={14} className="animate-spin text-blue-500" />
                    </div>
                  ) : (
                    <>
                      {/* Botón Trigger (reemplaza al <select>) */}
                      <button
                        onClick={() => setOpenDropdownId(isDropdownOpen ? null : emp.id)}
                        className={`
                          flex items-center justify-between text-[10px] font-bold py-1.5 pl-3 pr-2.5 rounded-lg
                          transition-all w-[100px] outline-none border
                          ${isDropdownOpen 
                            ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-500/30 text-blue-700 dark:text-blue-400' 
                            : 'bg-neutral-100 dark:bg-neutral-800/80 border-transparent text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                          }
                        `}
                      >
                        <span className="truncate mr-1">
                          {emp.area_id ? areas.find(a => a.id === emp.area_id)?.nombre : 'Ninguna'}
                        </span>
                        <ChevronDown size={12} className={`shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-blue-500' : 'text-neutral-400'}`} />
                      </button>

                      {/* Menú Desplegable Flotante */}
                      {isDropdownOpen && (
                        <>
                          {/* Capa invisible para cerrar al dar click afuera */}
                          <div className="fixed inset-0 z-30" onClick={() => setOpenDropdownId(null)} />
                          
                          <div className="absolute right-0 top-full mt-1.5 w-44 z-40 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="max-h-48 overflow-y-auto py-1.5 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
                              
                              {/* Opción NINGUNA */}
                              <button
                                onClick={() => handleCambioArea(emp.id, "null")}
                                className={`
                                  w-full flex items-center justify-between px-3 py-2.5 text-xs text-left transition-colors
                                  ${!emp.area_id ? 'bg-blue-50/80 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold' : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}
                                `}
                              >
                                <span className="truncate">Ninguna</span>
                                {!emp.area_id && <Check size={14} className="text-blue-500 shrink-0" />}
                              </button>

                              {/* Opciones de Áreas */}
                              {areas.map(area => {
                                const isSelected = emp.area_id === area.id;
                                return (
                                  <button
                                    key={area.id}
                                    onClick={() => handleCambioArea(emp.id, area.id.toString())}
                                    className={`
                                      w-full flex items-center justify-between px-3 py-2.5 text-xs text-left transition-colors
                                      ${isSelected ? 'bg-blue-50/80 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold' : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800/50'}
                                    `}
                                  >
                                    <span className="truncate">{area.nombre}</span>
                                    {isSelected && <Check size={14} className="text-blue-500 shrink-0" />}
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

//Prevenimos que React lo re-renderice si solo cambian los filtros de busqueda en el componente padre
export default React.memo(AreaAssignment)