'use client'

import { CheckCircle2, AlertCircle, XCircle, MessageSquare, Calendar } from 'lucide-react'
import { TipoComentario } from '@/src/types/performance'

interface MensajeItemProps {
  mensaje: {
    id: number
    titulo?: string | null // Supabase puede devolver null
    descripcion: string
    tipo?: TipoComentario | null
    created_at?: string | null
    // Opcional: si quieres mostrar quién lo envió (el servicio ya lo trae)
    autor?: { email: string }
  }
}

export default function MensajeItem({ mensaje }: MensajeItemProps) {
  
  const getStyle = (t: string | null | undefined) => {
    switch(t) {
      case 'positivo': 
        return { 
          icon: CheckCircle2, 
          color: 'text-emerald-500', 
          bgIcon: 'bg-emerald-500/10', 
          badge: 'text-emerald-700 bg-emerald-50 dark:text-emerald-300 dark:bg-emerald-900/30', 
          borderColor: 'border-emerald-500' 
        }
      case 'mejora': 
        return { 
          icon: AlertCircle, 
          color: 'text-amber-500', 
          bgIcon: 'bg-amber-500/10', 
          badge: 'text-amber-700 bg-amber-50 dark:text-amber-300 dark:bg-amber-900/30', 
          borderColor: 'border-amber-500' 
        }
      case 'negativo': 
        return { 
          icon: XCircle, 
          color: 'text-rose-500', 
          bgIcon: 'bg-rose-500/10', 
          badge: 'text-rose-700 bg-rose-50 dark:text-rose-300 dark:bg-rose-900/30', 
          borderColor: 'border-rose-500' 
        }
      default: 
        return { 
          icon: MessageSquare, 
          color: 'text-blue-500', 
          bgIcon: 'bg-blue-500/10', 
          badge: 'text-blue-700 bg-blue-50 dark:text-blue-300 dark:bg-blue-900/30', 
          borderColor: 'border-blue-500' 
        }
    }
  }

  const style = getStyle(mensaje.tipo)
  const Icon = style.icon
  const fecha = mensaje.created_at 
    ? new Date(mensaje.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Fecha desconocida';

  return (
    <div 
      className={`relative w-full bg-white dark:bg-[#1a1d29] rounded-2xl p-5 shadow-sm border-l-4 transition-all hover:shadow-md group ${style.borderColor}`}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          {/* Icono */}
          <div className={`p-2.5 rounded-xl ${style.bgIcon} ${style.color}`}>
            <Icon size={20} />
          </div>
          
          {/* Título y Badge */}
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white text-base leading-tight">
              {mensaje.titulo || 'Sin Asunto'}
            </h4>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full mt-1 inline-block ${style.badge}`}>
              {mensaje.tipo || 'General'}
            </span>
          </div>
        </div>

        {/* Fecha */}
        <div className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 dark:bg-[#0f1117] px-2 py-1 rounded-lg shrink-0">
          <Calendar size={12} />
          <span>{fecha}</span>
        </div>
      </div>

      {/* Cuerpo del mensaje */}
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap pl-1 border-t border-gray-100 dark:border-gray-800/50 pt-3 mt-1">
        {mensaje.descripcion}
      </p>
    </div>
  )
}