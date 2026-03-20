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
    <div className="group relative bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-0 rounded-2xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-500/30">
      
      {/* Botón de Menú Superior */}
      {(permisos.canUpdate || permisos.canDelete) && (
        <div className="absolute right-3 top-3 z-10">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className={`p-1.5 rounded-lg transition-colors ${showMenu ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white' : 'text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white'}`}
          >
            {showMenu ? <X size={18} /> : <MoreVertical size={18} />}
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-0 rounded-xl shadow-xl z-20 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                {permisos.canUpdate && onEdit && (
                  <button 
                    onClick={() => { setShowMenu(false); onEdit(area); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold hover:bg-neutral-50 dark:hover:bg-neutral-700/50 text-neutral-600 dark:text-neutral-300 transition-colors"
                  >
                    <Edit2 size={13} className="text-blue-500" />
                    Editar
                  </button>
                )}
                {permisos.canDelete && onDelete && (
                  <button 
                    onClick={() => { setShowMenu(false); onDelete(area.id); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-bold hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 transition-colors"
                  >
                    <Trash2 size={13} />
                    Eliminar
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Icono y Título en fila para ahorrar espacio vertical */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
            <MapPin size={20} />
          </div>
          <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 group-hover:text-blue-600 transition-colors truncate pr-6">
            {area.nombre}
          </h3>
        </div>

        {/* Descripción con menos margen */}
        <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-2 min-h-[32px] leading-relaxed">
          {area.descripcion || 'Sin descripción disponible.'}
        </p>

        {/* Footer del Encargado más limpio */}
        <div className="flex items-center gap-2.5 pt-4 border-t border-neutral-50 dark:border-0">
          <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center overflow-hidden border border-neutral-200 dark:border-0 shrink-0">
            {area.encargado?.foto_perfil_url ? (
              <img 
                src={area.encargado.foto_perfil_url} 
                className="h-full w-full object-cover" 
                referrerPolicy="no-referrer"
                alt="Encargado"
              />
            ) : (
              <User size={14} className="text-neutral-400" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase text-neutral-400 tracking-widest">Encargado</p>
            <p className="text-[11px] font-bold text-neutral-700 dark:text-neutral-300 truncate">
              {area.encargado ? `${area.encargado.nombre} ${area.encargado.apellidos}` : 'No asignado'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}