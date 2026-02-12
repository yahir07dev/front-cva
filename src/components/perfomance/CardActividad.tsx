'use client'

import { Clock, RotateCw, HelpCircle, CheckCircle2, Trash2, Star, Calendar, Zap, AlertCircle, CircleDot, Eye } from 'lucide-react'
import { ActividadConRelaciones } from '@/src/types/performance'
import { useSession } from '@/src/hooks/useSession'
// Usamos <img> normal para evitar problemas de next/image con Google

interface CardActividadProps {
  actividad: ActividadConRelaciones
  canManage: boolean 
  onStatusChange: (id: number, status: string) => void
  onDelete: (id: number) => void
  onEvaluar: (actividad: ActividadConRelaciones) => void
}

export default function CardActividad({ actividad: act, canManage, onStatusChange, onDelete, onEvaluar }: CardActividadProps) {
  const { session } = useSession() as any
  const currentUserId = session?.user?.id

  const isAssignedToMe = act.asignacion_actividades?.some((asig: any) => {
    const emp = asig.empleados || asig.empleado;
    return emp?.usuario_id === currentUserId;
  });

  const stateStyles: Record<string, { ring: string, btn: string, icon: any, label: string, lightBg: string }> = {
    pendiente: { 
      ring: 'ring-orange-500/40 border-orange-500/20', 
      btn: 'bg-orange-500 shadow-orange-500/40', 
      icon: Clock, 
      label: 'Pendiente',
      lightBg: 'bg-orange-500/10'
    },
    en_progreso: { 
      ring: 'ring-blue-500/40 border-blue-500/20', 
      btn: 'bg-blue-500 shadow-blue-500/40', 
      icon: RotateCw, 
      label: 'En progreso',
      lightBg: 'bg-blue-500/10'
    },
    explicacion_requerida: { 
      ring: 'ring-rose-500/50 border-rose-500/30', 
      btn: 'bg-rose-500 shadow-rose-500/40', 
      icon: HelpCircle, 
      label: 'Requiere ayuda',
      lightBg: 'bg-rose-500/10'
    },
    revision: { 
      ring: 'ring-purple-500/40 border-purple-500/20', 
      btn: 'bg-purple-600 shadow-purple-500/40', 
      icon: Eye, 
      label: 'En Revisión',
      lightBg: 'bg-purple-500/10'
    },
    completada: { 
      ring: 'ring-emerald-500/40 border-emerald-500/20', 
      btn: 'bg-emerald-600 shadow-emerald-500/40', 
      icon: CheckCircle2, 
      label: 'Completada',
      lightBg: 'bg-emerald-500/10'
    },
  }

  const currentStyle = stateStyles[act.estado || 'pendiente'] || stateStyles.pendiente
  const StatusIcon = currentStyle.icon

  const prioridadConfig = {
    alta: { icon: Zap, color: 'rose-500', label: 'Alta' },
    media: { icon: AlertCircle, color: 'amber-500', label: 'Media' },
    baja: { icon: CircleDot, color: 'emerald-500', label: 'Baja' },
  }
  const prioridad = prioridadConfig[act.prioridad as keyof typeof prioridadConfig] || prioridadConfig.baja

  return (
    <div className={`
      group relative flex flex-col justify-between w-full p-4 rounded-xl transition-all duration-500
      min-h-[280px] bg-white/60 dark:bg-neutral-900/40 backdrop-blur-md border ring-2 m-0.5
      shadow-[0_4px_15px_-5px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_25px_-10px_rgba(0,0,0,0.5)]
      hover:-translate-y-1 ${currentStyle.ring} overflow-hidden
    `}>

      {/* 1. Header de la Card */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold ${currentStyle.lightBg} border border-black/5 dark:border-white/5 rounded-lg`}>
          <StatusIcon size={12} className={act.estado === 'explicacion_requerida' ? 'animate-pulse' : ''} />
          {currentStyle.label}
        </span>
        <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-${prioridad.color}/10 text-${prioridad.color}`}>
          <prioridad.icon size={12} />
          {prioridad.label}
        </span>
      </div>

      {/* 2. Cuerpo: Título, Descripción y Avatares */}
      <div className="flex-1 space-y-2 mb-2">
        <h3 className="line-clamp-2 text-base font-bold text-neutral-900 dark:text-neutral-50 group-hover:text-primary transition-colors leading-tight">
          {act.titulo}
        </h3>
        <p className="line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">
          {act.descripcion || 'Sin descripción'}
        </p>

        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
          {/* AVATARES CON FOTO + RESPALDO DE GOOGLE */}
          <div className="flex -space-x-1.5 pl-1">
            {act.asignacion_actividades?.map((a: any, i: number) => {
               const emp = a.empleados || a.empleado;
               
               // LÓGICA DE FOTO INTELIGENTE:
               // 1. Buscamos foto en BD.
               let fotoUrl = emp?.foto_perfil_url;
               
               // 2. Si no hay foto en BD, y el usuario asignado soy YO, usamos la de Google.
               if ((!fotoUrl || fotoUrl.trim() === '') && emp?.usuario_id === currentUserId) {
                   fotoUrl = session?.user?.user_metadata?.avatar_url;
               }

               return (
                <div 
                  key={i} 
                  className="relative h-6 w-6 rounded-full bg-gradient-to-br from-neutral-400 to-neutral-600 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-white dark:ring-neutral-900 overflow-hidden"
                  title={`${emp?.nombre} ${emp?.apellidos}`}
                >
                  {fotoUrl ? (
                    <img 
                      src={fotoUrl} 
                      alt={emp?.nombre || 'U'} 
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  ) : (
                    <span>{emp?.nombre?.[0]?.toUpperCase()}</span>
                  )}
                </div>
               )
            })}
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={12} />
            <time>{new Date(act.created_at || '').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</time>
          </div>
        </div>

        {/* Calificación (si existe) */}
        {(act.calificacion ?? 0) > 0 && (
          <div className="mt-2 rounded-lg bg-amber-500/10 dark:bg-amber-500/5 p-2 border border-amber-500/20">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] font-bold uppercase text-amber-600 dark:text-amber-400">Calificación</span>
              <div className="flex text-amber-500 text-[10px]">
                {'★'.repeat(act.calificacion || 0)}{'☆'.repeat(5 - (act.calificacion || 0))}
              </div>
            </div>
            {act.observaciones_evaluacion && (
              <p className="line-clamp-2 text-[10px] italic text-neutral-600 dark:text-neutral-400 leading-tight">
                "{act.observaciones_evaluacion}"
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. Footer: Botones de Acción */}
      <div className="pt-3 mt-auto border-t border-neutral-100 dark:border-neutral-800/50">
        
        {isAssignedToMe && act.estado !== 'completada' ? (
          <div className="grid grid-cols-4 gap-1.5">
            {[
              { value: 'pendiente', icon: Clock },
              { value: 'en_progreso', icon: RotateCw },
              { value: 'explicacion_requerida', icon: HelpCircle },
              canManage ? { value: 'completada', icon: CheckCircle2 } : { value: 'revision', icon: Eye },
            ].map((opt) => {
              const Icon = opt.icon
              const isActive = act.estado === opt.value
              const optStyle = stateStyles[opt.value]

              return (
                <button
                  key={opt.value}
                  onClick={() => onStatusChange(act.id, opt.value)}
                  className={`
                    flex items-center justify-center rounded-lg p-2 transition-all duration-300 active:scale-90
                    ${isActive 
                      ? `${optStyle.btn} text-white shadow-md scale-105` 
                      : 'bg-neutral-100 dark:bg-neutral-800/60 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }
                  `}
                  title={optStyle.label}
                >
                  <Icon size={16} className={isActive && (opt.value === 'revision' || opt.value === 'explicacion_requerida') ? 'animate-pulse' : ''} />
                </button>
              )
            })}
          </div>
        ) : canManage && act.estado !== 'completada' ? (
          /* MODO ADMIN: APROBAR O VER */
          <div className="flex flex-col gap-2">
            <div className={`flex items-center justify-between px-3 py-2 rounded-lg text-[10px] font-bold border ${currentStyle.lightBg} border-current/10 ${currentStyle.ring.split(' ')[0].replace('ring-', 'text-')}`}>
              <div className="flex items-center gap-1.5">
                <StatusIcon size={12} className={act.estado === 'revision' ? 'animate-pulse' : ''} />
                <span>{act.estado === 'revision' ? 'POR APROBAR' : currentStyle.label.toUpperCase()}</span>
              </div>
              {act.estado === 'revision' && (
                <button
                  onClick={() => onStatusChange(act.id, 'completada')}
                  className="px-3 py-1 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 shadow-sm transition-all active:scale-95"
                >
                  Aprobar
                </button>
              )}
            </div>
          </div>
        ) : (
          /* MODO LECTURA (Completada o no asignada) */
          <div className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-bold text-white shadow-sm ${currentStyle.btn}`}>
            <StatusIcon size={12} />
            <span>{currentStyle.label.toUpperCase()}</span>
          </div>
        )}

        {/* ACCIONES EXTRA (Borrar/Evaluar) */}
        {canManage && (
          <div className="mt-2 flex justify-end gap-1 pt-1">
            <button 
              onClick={() => onDelete(act.id)} 
              className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
              title="Eliminar"
            >
              <Trash2 size={14} />
            </button>
            {act.estado === 'completada' && (
              <button 
                onClick={() => onEvaluar(act)} 
                className="p-1.5 text-neutral-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-lg transition-all"
                title="Evaluar"
              >
                <Star size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}