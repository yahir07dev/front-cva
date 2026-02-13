'use client'

import { useState } from 'react'
import { MapPin, User, MoreVertical, Edit2, Trash2, X } from 'lucide-react'

interface AreaCardProps {
  area: {
    id: number
    nombre: string
    descripcion: string | null
    encargado?: {
      nombre: string
      apellidos: string
      foto_perfil_url?: string
    }
  }
  permisos: {
    canUpdate: boolean
    canDelete: boolean
  }
  onEdit?: (area: any) => void
  onDelete?: (id: number) => void
}

export default function AreaCard({ area, permisos, onEdit, onDelete }: AreaCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="group bg-card border border-border rounded-3xl p-6 hover:border-blue-500/50 transition-all duration-300 shadow-sm hover:shadow-xl relative overflow-visible">
      
      <div className="flex justify-between items-start mb-4">
        {/* CAMBIO: Icono ahora usa Blue en lugar de Orange */}
        <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
          <MapPin size={24} />
        </div>

        {(permisos.canUpdate || permisos.canDelete) && (
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className={`p-2 rounded-full transition-colors ${showMenu ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
            >
              {showMenu ? <X size={20} /> : <MoreVertical size={20} />}
            </button>

            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-36 bg-popover border border-border rounded-xl shadow-xl z-20 overflow-hidden animate-in fade-in zoom-in-95 duration-200 py-1">
                  {permisos.canUpdate && onEdit && (
                    <button 
                      onClick={() => { setShowMenu(false); onEdit(area); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold hover:bg-muted text-left transition-colors"
                    >
                      <Edit2 size={14} className="text-blue-500" />
                      Editar
                    </button>
                  )}
                  {permisos.canDelete && onDelete && (
                    <button 
                      onClick={() => { setShowMenu(false); onDelete(area.id); }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs font-bold hover:bg-rose-500/10 text-rose-500 text-left transition-colors"
                    >
                      <Trash2 size={14} />
                      Eliminar
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* CAMBIO: hover:text-blue-500 para el título */}
      <h3 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors truncate">
        {area.nombre}
      </h3>
      <p className="text-sm text-muted-foreground line-clamp-2 mb-6 h-10 leading-relaxed">
        {area.descripcion || 'Sin descripción disponible.'}
      </p>

      <div className="flex items-center gap-3 pt-4 border-t border-border/50">
        <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center overflow-hidden border border-border">
          {area.encargado?.foto_perfil_url ? (
            <img 
              src={area.encargado.foto_perfil_url} 
              className="h-full w-full object-cover" 
              referrerPolicy="no-referrer"
              alt="Encargado"
            />
          ) : (
            <User size={16} className="text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Encargado</p>
          <p className="text-xs font-medium truncate text-foreground">
            {area.encargado ? `${area.encargado.nombre} ${area.encargado.apellidos}` : 'No asignado'}
          </p>
        </div>
      </div>
    </div>
  )
}