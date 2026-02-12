'use client'

import { CheckCircle2, AlertCircle, XCircle, MessageSquare, Calendar, Trash2 } from 'lucide-react'
import { TipoComentario } from '@/src/types/performance'

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
    autor_id?: string // UUID del autor en la tabla comentarios
  }
  currentUserId?: string
  onDelete?: (id: number) => void
}

export default function MensajeItem({ mensaje, currentUserId, onDelete }: MensajeItemProps) {
  
  // Lógica de estilos (tuya original)
  const getStyle = (t: string | null | undefined) => {
    switch (t) {
      case 'positivo':
        return {
          icon: CheckCircle2,
          color: 'text-emerald-600 dark:text-emerald-400',
          bgIcon: 'bg-emerald-100 dark:bg-emerald-600/15 ring-1 ring-emerald-500/20',
          badge: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
          borderColor: 'border-emerald-200 dark:border-emerald-500/40'
        }
      case 'mejora':
        return {
          icon: AlertCircle,
          color: 'text-amber-600 dark:text-amber-400',
          bgIcon: 'bg-amber-100 dark:bg-amber-600/15 ring-1 ring-amber-500/20',
          badge: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
          borderColor: 'border-amber-200 dark:border-amber-500/40'
        }
      case 'negativo':
        return {
          icon: XCircle,
          color: 'text-rose-600 dark:text-rose-400',
          bgIcon: 'bg-rose-100 dark:bg-rose-600/15 ring-1 ring-rose-500/20',
          badge: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300',
          borderColor: 'border-rose-200 dark:border-rose-500/40'
        }
      default:
        return {
          icon: MessageSquare,
          color: 'text-orange-600 dark:text-orange-400',
          bgIcon: 'bg-orange-100 dark:bg-orange-600/15 ring-1 ring-orange-500/20',
          badge: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
          borderColor: 'border-orange-200 dark:border-orange-500/40'
        }
    }
  }

  const style = getStyle(mensaje.tipo)
  const Icon = style.icon
  const fecha = mensaje.created_at 
    ? new Date(mensaje.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Fecha desconocida'

  // Determinar si puedo borrar (soy el autor)
  const isMyMessage = mensaje.autor?.usuario_id === currentUserId || mensaje.autor_id === currentUserId;

  // Lógica de Foto del Autor
  const autorNombre = mensaje.autor?.nombre || 'Usuario';
  const autorApellido = mensaje.autor?.apellidos || '';
  const fotoUrl = mensaje.autor?.foto_perfil_url;

  return (
    <div className={`
      relative w-full rounded-2xl p-5 transition-all duration-300 group
      bg-white dark:bg-neutral-900/70 backdrop-blur-md
      border ${style.borderColor}
      shadow-[0_8px_25px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_25px_-10px_rgba(0,0,0,0.5)]
      hover:shadow-[0_12px_35px_-12px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_12px_35px_-12px_rgba(0,0,0,0.6)]
      hover:-translate-y-0.5
    `}>
      
      {/* Header del Mensaje */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
            
          {/* Avatar del Autor */}
          <div className="relative h-10 w-10 rounded-full overflow-hidden ring-2 ring-white dark:ring-neutral-800 shadow-sm bg-neutral-200 flex items-center justify-center shrink-0">
             {fotoUrl ? (
                <img 
                  src={fotoUrl} 
                  alt={autorNombre}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
             ) : (
                <span className="text-xs font-bold text-neutral-500">
                    {autorNombre[0]}{autorApellido[0]}
                </span>
             )}
             
             {/* Icono pequeño del tipo de mensaje superpuesto */}
             <div className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-white dark:bg-neutral-900`}>
                <div className={`p-1 rounded-full ${style.bgIcon} ${style.color}`}>
                    <Icon size={10} strokeWidth={3} />
                </div>
             </div>
          </div>

          {/* Info Autor y Título */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                {autorNombre} {autorApellido}
            </span>
            <h4 className="font-bold text-neutral-800 dark:text-neutral-100 text-sm leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {mensaje.titulo || 'Sin Asunto'}
            </h4>
          </div>
        </div>

        {/* Fecha y Acciones */}
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] text-neutral-400 dark:text-neutral-500 bg-neutral-50 dark:bg-neutral-800/30 px-2 py-1 rounded-md border border-neutral-100 dark:border-neutral-800">
                <Calendar size={10} />
                <span>{fecha}</span>
            </div>
            
            {/* Botón Eliminar (Solo si es mi mensaje) */}
            {isMyMessage && onDelete && (
                <button 
                    onClick={() => onDelete(mensaje.id)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Eliminar comentario"
                >
                    <Trash2 size={14} />
                </button>
            )}
        </div>
      </div>

      {/* Cuerpo del mensaje */}
      <div className="pl-[52px]"> {/* Indentación para alinear con el texto del header */}
          <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md mb-2 inline-block ${style.badge}`}>
            {mensaje.tipo || 'General'}
          </span>
          <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed whitespace-pre-wrap">
            {mensaje.descripcion}
          </p>
      </div>
    </div>
  )
}