'use client'

import { useState } from 'react'
import { ArrowRightLeft, Users, Search, CheckCircle2 } from 'lucide-react'

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
    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm h-full flex flex-col">
      <div className="p-6 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3 mb-4">
          {/* Icono de cabecera ya estaba en azul, perfecto */}
          <div className="p-2 bg-blue-500/10 rounded-xl text-blue-600">
            <Users size={20} />
          </div>
          <h3 className="font-bold text-lg">Asignación</h3>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input 
            type="text"
            placeholder="Buscar..."
            // CAMBIO: focus:ring-blue-500/40 (Antes Orange)
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-background border border-border text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-y-auto scrollbar-thin flex-1 max-h-[600px]">
        {filteredEmpleados.map((emp) => (
          <div key={`${emp.id}-${emp.area_id}`} className="flex items-center justify-between p-4 border-b border-border/50 hover:bg-muted/50 transition-colors group">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative">
                {/* CAMBIO: Avatar border/bg a BLUE */}
                <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-600 font-bold text-xs overflow-hidden border border-blue-500/20">
                  {emp.foto_perfil_url ? (
                    <img src={emp.foto_perfil_url} className="h-full w-full object-cover" referrerPolicy="no-referrer" alt="" />
                  ) : (
                    <span>{emp.nombre.charAt(0)}</span>
                  )}
                </div>
                {successId === emp.id && (
                  <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-0.5 animate-in zoom-in">
                    <CheckCircle2 size={12} />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                {/* CAMBIO: Texto hover a BLUE */}
                <p className="text-sm font-bold truncate group-hover:text-blue-500 transition-colors">{emp.nombre} {emp.apellidos}</p>
                <div className="flex items-center gap-1">
                  <span className={`h-1.5 w-1.5 rounded-full ${emp.area_id ? 'bg-green-500' : 'bg-rose-500'}`} />
                  <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-wider truncate max-w-[120px]">
                    {areas.find(a => a.id === emp.area_id)?.nombre || 'Sin Asignar'}
                  </p>
                </div>
              </div>
            </div>

            <select 
              disabled={isUpdating === emp.id}
              value={emp.area_id?.toString() || "null"}
              onChange={(e) => handleCambioArea(emp.id, e.target.value)}
              // CAMBIO: focus:ring-blue-500/40 (Antes Orange)
              className={`text-[11px] font-bold py-1.5 px-2 pl-2 pr-6 rounded-xl bg-background border border-border outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer appearance-none ${isUpdating === emp.id ? 'opacity-50' : ''}`}
            >
              <option value="null">-- Ninguna --</option>
              {areas.map(area => (
                <option key={area.id} value={area.id.toString()}>{area.nombre}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  )
}