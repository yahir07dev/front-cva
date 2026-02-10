'use client'

import { Clock, RotateCw, HelpCircle, CheckCircle2, Trash2, Star, User, Calendar, Zap, AlertCircle, CircleDot, Eye } from 'lucide-react'
import { ActividadConRelaciones } from '@/src/types/performance'
import { useSession } from '@/src/hooks/useSession'

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

  // 1. VALIDACIÓN: ¿Soy yo uno de los asignados?
  const isAssignedToMe = act.asignacion_actividades?.some((asig: any) => {
    const emp = asig.empleados || asig.empleado;
    return emp?.usuario_id === currentUserId;
  });

  const isUrgent = act.estado === 'explicacion_requerida';
  const isInReview = act.estado === 'revision';

  // 2. Configuración Visual según Estado
  const statusConfig: Record<string, { icon: any; label: string; bgClass: string; textClass: string }> = {
    pendiente: { 
      icon: Clock, label: 'Pendiente', 
      bgClass: 'bg-gray-100 dark:bg-gray-800/60', textClass: 'text-gray-700 dark:text-gray-300'
    },
    en_progreso: { 
      icon: RotateCw, label: 'En progreso', 
      bgClass: 'bg-blue-100 dark:bg-blue-900/40', textClass: 'text-blue-700 dark:text-blue-300'
    },
    revision: { 
      icon: Eye, label: 'En Revisión', 
      bgClass: 'bg-purple-100 dark:bg-purple-900/40', textClass: 'text-purple-700 dark:text-purple-300'
    },
    explicacion_requerida: { 
      icon: HelpCircle, label: 'Requiere ayuda', 
      bgClass: isUrgent ? 'bg-rose-500 dark:bg-rose-600' : 'bg-rose-100 dark:bg-rose-900/40', textClass: isUrgent ? 'text-white' : 'text-rose-700 dark:text-rose-300'
    },
    completada: { 
      icon: CheckCircle2, label: 'Completada', 
      bgClass: 'bg-emerald-100 dark:bg-emerald-900/40', textClass: 'text-emerald-700 dark:text-emerald-300'
    },
  }
  
  const current = statusConfig[act.estado || 'pendiente'] || statusConfig.pendiente
  const StatusIcon = current.icon

  // Prioridad
  const prioridadConfig = {
    alta: { icon: Zap, color: 'bg-rose-500', label: 'Alta' },
    media: { icon: AlertCircle, color: 'bg-amber-500', label: 'Media' },
    baja: { icon: CircleDot, color: 'bg-emerald-500', label: 'Baja' },
  }
  const prioridad = prioridadConfig[act.prioridad as keyof typeof prioridadConfig] || prioridadConfig.baja
  const PrioIcon = prioridad.icon

  return (
    <div className={`
      group rounded-2xl sm:rounded-3xl transition-all
      ${isUrgent ? 'neon-border-animated overflow-visible' : 'bg-white dark:bg-gray-900 shadow-sm hover:shadow-lg overflow-hidden'}
      ${isInReview ? 'ring-2 ring-purple-500/50 shadow-purple-100 dark:shadow-none' : ''}
    `}>
      
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <span className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium ${current.bgClass} ${current.textClass} ${isUrgent ? 'animate-pulse shadow-lg shadow-rose-500/30 ring-1 ring-white/30' : ''}`}>
            <StatusIcon size={14} className={isUrgent ? 'animate-bounce' : ''} />
            {current.label}
          </span>
          <div className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 ${prioridad.color}/10`}>
            <PrioIcon size={14} className={`${prioridad.color.replace('bg-', 'text-')}`} />
            <span className={`text-xs font-medium ${prioridad.color.replace('bg-', 'text-')}`}>{prioridad.label}</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 pt-0 sm:p-6 sm:pt-0">
        <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900 dark:text-white">{act.titulo}</h3>
        <p className="mb-4 line-clamp-3 text-sm text-gray-600 dark:text-gray-400">{act.descripcion || 'Sin descripción'}</p>

        {/* Empleados */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <User size={14} className="text-gray-600 dark:text-gray-400" />
            </div>
            <div className="flex -space-x-2">
              {act.asignacion_actividades?.map((a: any, i: number) => {
                const emp = a.empleados || a.empleado; 
                return (
                  <div key={i} className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-xs font-bold text-white ring-2 ring-white dark:ring-gray-900 transition-transform hover:scale-110" title={`${emp?.nombre} ${emp?.apellidos}`}>
                    {emp?.nombre?.[0]?.toUpperCase() || '?'}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
              <Calendar size={14} className="text-gray-600 dark:text-gray-400" />
            </div>
            <time>{new Date(act.created_at || '').toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</time>
          </div>
        </div>

        {/* Evaluación */}
        {(act.calificacion ?? 0) > 0 && (
          <div className="mt-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 dark:from-amber-900/20 dark:to-orange-900/10">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-900 dark:text-amber-300">Evaluación</span>
              <div className="flex gap-0.5 text-amber-400">{'★'.repeat(act.calificacion || 0)}{'☆'.repeat(5 - (act.calificacion || 0))}</div>
            </div>
            {act.observaciones_evaluacion && <p className="line-clamp-2 text-xs italic text-gray-700 dark:text-gray-400">"{act.observaciones_evaluacion}"</p>}
          </div>
        )}
      </div>

      {/* Footer de Acciones (LOGICA CORREGIDA) */}
      <div className={`p-4 ${isUrgent ? 'bg-transparent' : 'bg-gray-50 dark:bg-gray-900/50'} rounded-b-[inherit]`}>
        
        {/* =========================================================
            CASO 1: SOY EL TRABAJADOR (Admin O Empleado)
            Si la tarea es mía, muestro botones de acción.
           ========================================================= */}
        {isAssignedToMe && act.estado !== 'completada' ? (
          <div className="grid grid-cols-4 gap-2">
            {[
              { value: 'pendiente', icon: Clock },
              { value: 'en_progreso', icon: RotateCw },
              { value: 'explicacion_requerida', icon: HelpCircle },
              
              // AQUÍ ESTÁ LA MAGIA:
              // Si soy Admin (canManage) -> CHECK (Completar directo)
              // Si soy Empleado -> OJO (Solicitar revisión)
              canManage 
                ? { value: 'completada', icon: CheckCircle2 } 
                : { value: 'revision', icon: Eye }, 

            ].map((opt) => {
              const Icon = opt.icon
              const isActive = act.estado === opt.value
              
              let btnClass = isActive 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25' 
                : 'bg-white text-gray-500 dark:bg-gray-800 dark:text-gray-400';

              if (isActive && opt.value === 'explicacion_requerida') 
                btnClass = 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse ring-2 ring-rose-300';
              
              // Estilo revisión (Empleado)
              if (isActive && opt.value === 'revision') 
                btnClass = 'bg-purple-600 text-white shadow-lg shadow-purple-500/40 ring-2 ring-purple-300';
              
              // Estilo completado (Admin)
              if (isActive && opt.value === 'completada')
                 btnClass = 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'

              return (
                <button 
                  key={opt.value} 
                  onClick={() => onStatusChange(act.id, opt.value)} 
                  className={`flex items-center justify-center rounded-xl p-2.5 transition-all active:scale-95 ${btnClass}`}
                  // Tooltip condicional
                  title={opt.value === 'revision' ? 'Solicitar Revisión' : opt.value === 'completada' ? 'Completar Tarea' : ''}
                >
                  <Icon size={18} className={isActive && (opt.value === 'revision' || opt.value === 'explicacion_requerida') ? 'animate-pulse' : ''} />
                </button>
              )
            })}
          </div>
        ) 
        
        // =========================================================
        // CASO 2: SOY MANAGER OBSERVANDO (No es mi tarea)
        // =========================================================
        : canManage && act.estado !== 'completada' ? (
           <div className="flex justify-between items-center h-10">
             <div className="text-xs text-gray-500 italic flex items-center gap-2">
               {act.estado === 'revision' ? (
                 <span className="flex items-center gap-1 text-purple-600 font-medium animate-pulse">
                    <Eye size={14}/> Esperando aprobación
                 </span>
               ) : 'Supervisando...'}
             </div>
             
             {/* Botón de aprobar (si está en revisión) */}
             {act.estado === 'revision' && (
               <button 
                  onClick={() => onStatusChange(act.id, 'completada')}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/30 hover:bg-emerald-600 transition-all active:scale-95 text-xs font-bold"
               >
                 <CheckCircle2 size={16} />
                 Aprobar Tarea
               </button>
             )}
           </div>
        )

        // CASO 3: Solo visualización (Completada o Empleado viendo tarea ajena)
        : (
          <div className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-medium ${current.bgClass} ${current.textClass}`}>
            <StatusIcon size={16} />
            <span>{current.label}</span>
          </div>
        )}

        {/* Botones de Gestión (Eliminar/Evaluar) - SIEMPRE VISIBLES PARA ADMIN */}
        {canManage && (
          <div className="mt-3 flex justify-end gap-2 border-t border-gray-100 dark:border-gray-800 pt-3">
            <button onClick={() => onDelete(act.id)} className="group/btn flex items-center justify-center rounded-xl bg-gray-50 p-2.5 text-gray-400 hover:text-red-600 dark:bg-gray-800" title="Eliminar">
              <Trash2 size={18} />
            </button>
            {act.estado === 'completada' && (
              <button onClick={() => onEvaluar(act)} className="group/btn flex items-center justify-center rounded-xl bg-amber-50 p-2.5 text-amber-600 hover:bg-amber-100 dark:bg-amber-900/30" title="Evaluar">
                <Star size={18} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}