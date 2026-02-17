'use client'

import { CheckCircle2, AlertCircle, XCircle, MessageSquare, Trash2 } from 'lucide-react'
import { TipoComentario } from '@/src/types/performance'
import Image from 'next/image'

interface MensajeItemProps {
  mensaje: {
    id: number
    titulo?: string | null
    descripcion: string
    tipo?: TipoComentario | null
    created_at?: string | null
    autor?: { 
        usuario_id?: string,
        nombre?: string, 
        apellidos?: string, 
        foto_perfil_url?: string | null 
    }
    autor_id?: string 
  }
  currentUserId?: string
  onDelete?: (id: number) => void
}

export default function MensajeItem({ mensaje, currentUserId, onDelete }: MensajeItemProps) {
  
  // Estilos simplificados (Solo color de texto y puntos)
  const getTheme = (t: string | null | undefined) => {
    switch (t) {
      case 'positivo':
        return { icon: CheckCircle2, color: 'text-emerald-500', dot: 'bg-emerald-500' }
      case 'mejora':
        return { icon: AlertCircle, color: 'text-amber-500', dot: 'bg-amber-500' }
      case 'negativo':
        return { icon: XCircle, color: 'text-rose-500', dot: 'bg-rose-500' }
      default:
        return { icon: MessageSquare, color: 'text-blue-500', dot: 'bg-blue-500' }
    }
  }

  const theme = getTheme(mensaje.tipo)
  const fecha = mensaje.created_at 
    ? new Date(mensaje.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
    : ''

  const isMyMessage = mensaje.autor?.usuario_id === currentUserId || mensaje.autor_id === currentUserId;
  const autorNombre = mensaje.autor?.nombre || 'Usuario';
  const fotoUrl = mensaje.autor?.foto_perfil_url;

  return (
    <div className="group relative w-full flex gap-4 p-4 rounded-[20px] hover:bg-neutral-50 dark:hover:bg-white/[0.02] transition-colors duration-200">
      
      {/* 1. Avatar (Lado Izquierdo) */}
      <div className="flex-shrink-0">
        <div className="relative h-10 w-10 rounded-2xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 shadow-sm">
          {fotoUrl ? (
            <Image 
              src={fotoUrl} 
              alt={autorNombre}
              fill
              className="object-cover"
              sizes="40px"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-xs font-bold text-neutral-400">
              {autorNombre[0]}
            </div>
          )}
        </div>
      </div>

      {/* 2. Contenido del Mensaje */}
      <div className="flex-1 min-w-0 pt-0.5">
        
        {/* Header: Autor + Fecha + Tipo */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-900 dark:text-white truncate">
              {autorNombre} {mensaje.autor?.apellidos}
            </span>
            <span className="text-[10px] text-neutral-400 font-medium">•</span>
            <span className="text-[10px] text-neutral-400 font-medium">{fecha}</span>
          </div>
          
          {/* Badge Minimalista (Punto + Texto) */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-neutral-100 dark:bg-white/5">
            <div className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
            <span className={`text-[9px] font-bold uppercase tracking-wider ${theme.color}`}>
              {mensaje.tipo || 'General'}
            </span>
          </div>
        </div>

        {/* Título (si existe) */}
        {mensaje.titulo && (
          <h4 className="text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
            {mensaje.titulo}
          </h4>
        )}

        {/* Cuerpo del Texto */}
        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap">
          {mensaje.descripcion}
        </p>

        {/* Botón Eliminar (Flotante al hacer hover) */}
        {isMyMessage && onDelete && (
          <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={() => onDelete(mensaje.id)}
              className="p-2 text-neutral-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
            >
              <Trash2 size={14} strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}