'use client'

import { useState } from 'react'
import { Users, Check, Search, Building2 } from 'lucide-react'
import Image from 'next/image'

interface SelectorEmpleadosProps {
  empleados: any[]
  asignados: string[]
  onToggle: (id: string) => void
}

export default function SelectorEmpleados({ empleados, asignados, onToggle }: SelectorEmpleadosProps) {
  
  const [searchTerm, setSearchTerm] = useState('')

  const getInitials = (nombre: string, apellidos: string) => 
    `${nombre?.[0] || ''}${apellidos?.[0] || ''}`.toUpperCase()

  const getAreaName = (emp: any) => {
    if (!emp.areas) return ''
    if (Array.isArray(emp.areas)) return emp.areas[0]?.nombre || ''
    return emp.areas.nombre || ''
  }

  const filteredEmpleados = empleados.filter(emp => {
    const nombreCompleto = `${emp.nombre} ${emp.apellidos}`.toLowerCase()
    const area = getAreaName(emp).toLowerCase()
    const term = searchTerm.toLowerCase()
    return nombreCompleto.includes(term) || area.includes(term)
  })

  return (
    <div className="
      flex flex-col overflow-hidden rounded-3xl 
      bg-white/70 dark:bg-neutral-950/50 backdrop-blur-md 
      border border-neutral-200/30 dark:border-neutral-800/30 
      shadow-sm transition-all duration-300
      h-[520px]  {/* altura fija como tenías */}
    ">
      {/* Header fijo */}
      <div className="shrink-0 px-6 pt-5 pb-4 border-b border-neutral-200/20 dark:border-neutral-800/20 bg-transparent flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-500/10 dark:bg-orange-600/15">
              <Users size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white tracking-tight">
                Asignar equipo
              </h2>
              <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                Selecciona responsables
              </p>
            </div>
          </div>
          {asignados.length > 0 && (
            <div className="
              flex h-6 min-w-[24px] items-center justify-center rounded-full 
              bg-orange-600 text-white text-xs font-bold px-2.5
              animate-in zoom-in
            ">
              {asignados.length}
            </div>
          )}
        </div>

        {/* Buscador */}
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-orange-500 transition-colors" size={16} />
          <input 
            type="text"
            placeholder="Buscar por nombre o área..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full pl-10 pr-4 py-2.5 rounded-xl 
              bg-white/60 dark:bg-neutral-800/50 
              border border-neutral-200/40 dark:border-neutral-800/40
              text-sm font-medium outline-none 
              focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20
              transition-all placeholder:text-neutral-400/70
            "
          />
        </div>
      </div>

      {/* Lista scrollable - ocupa todo el espacio restante */}
      <div className="
        flex-1 overflow-y-auto scrollbar-thin 
        scrollbar-thumb-orange-300/50 dark:scrollbar-thumb-orange-700/50 
        scrollbar-track-transparent hover:scrollbar-thumb-orange-400/70
        p-4 sm:p-6
      ">
        {filteredEmpleados.length > 0 ? (
          <div className="grid gap-3">
            {filteredEmpleados.map((emp) => {
              const isSelected = asignados.includes(emp.id.toString())
              const rolNombre = Array.isArray(emp.roles) ? emp.roles[0]?.nombre : emp.roles?.nombre
              const areaNombre = getAreaName(emp)
              const fotoUrl = emp.foto_perfil_url?.trim() ? emp.foto_perfil_url : null

              return (
                <button
                  key={emp.id}
                  type="button"
                  onClick={() => onToggle(emp.id.toString())}
                  className={`
                    group relative flex items-center gap-3 rounded-2xl p-4 text-left transition-all duration-300
                    active:scale-[0.98]
                    ${isSelected 
                      ? 'bg-orange-600/10 border border-orange-500/30 shadow-sm' 
                      : 'bg-white/50 dark:bg-neutral-950/40 border border-neutral-200/30 dark:border-neutral-800/30 hover:bg-orange-50 dark:hover:bg-orange-950/20 hover:border-orange-400/40'}
                  `}
                >
                  {/* Avatar */}
                  <div className={`
                    relative h-10 w-10 shrink-0 rounded-xl overflow-hidden transition-all
                    ${isSelected 
                      ? 'ring-2 ring-orange-500/50 scale-105' 
                      : 'ring-1 ring-neutral-200/50 dark:ring-neutral-800/50 group-hover:ring-orange-400/40'}
                  `}>
                    {fotoUrl ? (
                      <Image 
                        src={fotoUrl} 
                        alt={emp.nombre} 
                        fill 
                        className="object-cover transition-transform group-hover:scale-110" 
                        sizes="40px"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs font-bold bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 uppercase">
                        {getInitials(emp.nombre, emp.apellidos)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className={`
                      truncate text-sm font-semibold leading-tight
                      ${isSelected ? 'text-orange-700 dark:text-orange-300' : 'text-neutral-900 dark:text-neutral-100'}
                    `}>
                      {emp.nombre} {emp.apellidos}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                      <span className="truncate">{rolNombre || 'Empleado'}</span>
                      {areaNombre && (
                        <>
                          <span className="opacity-50">•</span>
                          <span className="flex items-center gap-1 truncate text-orange-600 dark:text-orange-400">
                            <Building2 size={10} /> {areaNombre}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Check */}
                  <div className={`
                    flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all duration-300
                    ${isSelected 
                      ? 'bg-orange-600 text-white scale-100 opacity-100 shadow-md' 
                      : 'bg-neutral-200/50 dark:bg-neutral-800/50 text-transparent scale-75 opacity-0 group-hover:scale-90 group-hover:opacity-40'}
                  `}>
                    <Check size={14} strokeWidth={3} />
                  </div>
                </button>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="h-12 w-12 rounded-full bg-neutral-100 dark:bg-neutral-800/50 flex items-center justify-center mb-4">
              <Search size={20} className="text-neutral-400" />
            </div>
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
              No se encontraron resultados
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Prueba con otro nombre o área
            </p>
          </div>
        )}
      </div>
    </div>
  )
}