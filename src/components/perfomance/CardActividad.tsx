'use client'

import { useState, useEffect } from 'react'
import { Clock, RotateCw, HelpCircle, CheckCircle2, Trash2, Star, Calendar, Zap, AlertCircle, CircleDot, Eye, Timer, AlertTriangle, RefreshCw, XCircle } from 'lucide-react'
import { ActividadConRelaciones } from '@/src/types/performance'
import { useSession } from '@/src/hooks/useSession'

interface CardActividadProps {
  actividad: ActividadConRelaciones
  canManage: boolean 
  onStatusChange: (id: number, status: string) => void
  onDelete: (id: number) => void
  onEvaluar: (actividad: ActividadConRelaciones) => void
  onReasignar: (actividad: ActividadConRelaciones) => void
}

export default function CardActividad({ 
  actividad: act, 
  canManage, 
  onStatusChange, 
  onDelete, 
  onEvaluar,
  onReasignar 
}: CardActividadProps) {
  const { session } = useSession() as any
  const currentUserId = session?.user?.id
  
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (!act.fecha_limite || act.estado === 'completada' || (act.estado as string) === 'no_realizada') {
        setIsExpired(false);
        return;
    }

    const calculateTime = () => {
      const ahora = new Date();
      const limite = new Date(act.fecha_limite as string);
      const diferencia = limite.getTime() - ahora.getTime();

      if (diferencia <= 1000) {
        setIsExpired(true);
        setTimeLeft("Plazo vencido");
        return;
      }

      setIsExpired(false); 

      const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
      const horas = Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));

      if (dias > 0) setTimeLeft(`${dias}d ${horas}h`);
      else if (horas > 0) setTimeLeft(`${horas}h ${minutos}m`);
      else setTimeLeft(`${minutos}m restantes`);
    };

    calculateTime();
    const timer = setInterval(calculateTime, 10000); 
    return () => clearInterval(timer);
  }, [act.fecha_limite, act.estado]);

  const isAssignedToMe = act.asignacion_actividades?.some((asig: any) => {
    const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados;
    return emp?.usuario_id === currentUserId;
  });

  const esNoRealizada = isExpired && !['completada', 'no_realizada', 'revision'].includes(act.estado || '');

  // AJUSTE: Se añadió el color de texto para el hover del título según el estado
  const stateStyles: Record<string, { ring: string, btn: string, icon: any, label: string, lightBg: string, textColor: string }> = {
    pendiente: { 
      ring: esNoRealizada ? 'ring-rose-500 border-rose-500' : 'ring-orange-500/40 border-orange-500/20', 
      btn: 'bg-orange-500 shadow-orange-500/40', 
      icon: Clock, 
      label: esNoRealizada ? 'Vencida' : 'Pendiente',
      lightBg: esNoRealizada ? 'bg-rose-500/10' : 'bg-orange-500/10',
      textColor: esNoRealizada ? 'group-hover:text-rose-600' : 'group-hover:text-orange-600'
    },
    en_progreso: { 
      ring: esNoRealizada ? 'ring-rose-500 border-rose-500' : 'ring-blue-500/40 border-blue-500/20', 
      btn: 'bg-blue-500 shadow-blue-500/40', 
      icon: RotateCw, 
      label: esNoRealizada ? 'Retrasada' : 'En progreso',
      lightBg: esNoRealizada ? 'bg-rose-500/10' : 'bg-blue-500/10',
      textColor: esNoRealizada ? 'group-hover:text-rose-600' : 'group-hover:text-blue-600'
    },
    explicacion_requerida: { 
      ring: 'ring-rose-500/50 border-rose-500/30', 
      btn: 'bg-rose-500 shadow-rose-500/40', 
      icon: HelpCircle, 
      label: 'Requiere ayuda',
      lightBg: 'bg-rose-500/10',
      textColor: 'group-hover:text-rose-600'
    },
    revision: { 
      ring: 'ring-purple-500/40 border-purple-500/20', 
      btn: 'bg-purple-600 shadow-purple-500/40', 
      icon: Eye, 
      label: 'En Revisión',
      lightBg: 'bg-purple-500/10',
      textColor: 'group-hover:text-purple-600'
    },
    completada: { 
      ring: 'ring-emerald-500/40 border-emerald-500/20', 
      btn: 'bg-emerald-600 shadow-emerald-500/40', 
      icon: CheckCircle2, 
      label: 'Completada',
      lightBg: 'bg-emerald-500/10',
      textColor: 'group-hover:text-emerald-600'
    },
    no_realizada: { 
      ring: 'ring-neutral-500 border-neutral-400', 
      btn: 'bg-neutral-600 shadow-neutral-600/40', 
      icon: XCircle, 
      label: 'No Realizada',
      lightBg: 'bg-neutral-500/10',
      textColor: 'group-hover:text-neutral-600'
    },
  }

  const currentStyle = stateStyles[act.estado || 'pendiente'] || stateStyles.pendiente;
  const StatusIcon = currentStyle.icon;

  const prioridadConfig = {
    alta: { icon: Zap, color: 'rose-500', label: 'Alta' },
    media: { icon: AlertCircle, color: 'amber-500', label: 'Media' },
    baja: { icon: CircleDot, color: 'emerald-500', label: 'Baja' },
  }
  const prioridad = prioridadConfig[act.prioridad as keyof typeof prioridadConfig] || prioridadConfig.baja

  return (
    <div className={`
      group relative flex flex-col justify-between w-full p-4 rounded-xl transition-all duration-300
      min-h-[320px] bg-white dark:bg-neutral-900 border ring-2 m-0.5
      shadow-sm hover:-translate-y-1 active:scale-[0.98] ${currentStyle.ring} overflow-hidden
    `}>
      
      {esNoRealizada && (
        <div className="absolute top-0 left-0 w-full bg-rose-600 text-white text-[10px] font-bold py-1 flex items-center justify-center gap-1 z-20 animate-pulse">
          <AlertTriangle size={12} /> PLAZO AGOTADO
        </div>
      )}

      {/* 1. Header */}
      <div className={`flex items-start justify-between gap-2 mb-3 ${esNoRealizada ? 'mt-5' : ''}`}>
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold ${currentStyle.lightBg} border border-black/5 dark:border-white/5 rounded-lg transition-colors`}>
          <StatusIcon size={12} className={(act.estado === 'explicacion_requerida' || esNoRealizada) ? 'animate-pulse' : ''} />
          {currentStyle.label}
        </span>
        <span className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-${prioridad.color}/10 text-${prioridad.color}`}>
          <prioridad.icon size={12} />
          {prioridad.label}
        </span>
      </div>

      {/* 2. Cuerpo */}
      <div className="flex-1 space-y-2 mb-2">
        {/* AJUSTE: El título cambia de color al estado en hover/active (active: para móviles) */}
        <h3 className={`line-clamp-2 text-base font-bold text-neutral-900 dark:text-neutral-50 transition-colors duration-300 leading-tight ${currentStyle.textColor} group-active:text-opacity-80`}>
          {act.titulo}
        </h3>
        <p className="line-clamp-2 text-xs text-neutral-600 dark:text-neutral-400">
          {act.descripcion || 'Sin descripción'}
        </p>

        {!isExpired && !['completada', 'no_realizada', 'revision'].includes(act.estado || '') && act.fecha_limite && (
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-1 rounded-md w-fit">
            <Timer size={13} />
            {timeLeft}
          </div>
        )}

        <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1">
          <div className="flex -space-x-1.5">
            {act.asignacion_actividades?.map((asig: any, i: number) => {
               const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados;
               let fotoUrl = emp?.foto_perfil_url;
               if ((!fotoUrl || fotoUrl.trim() === '') && emp?.usuario_id === currentUserId) {
                   fotoUrl = session?.user?.user_metadata?.avatar_url;
               }
               return (
                <div key={i} className="group/avatar relative">
                  <div className="relative h-7 w-7 rounded-full bg-neutral-100 border-2 border-white dark:border-neutral-900 overflow-hidden shadow-sm transition-transform group-hover/avatar:scale-110 group-hover/avatar:z-10">
                    {fotoUrl ? (
                      <img src={fotoUrl} alt="U" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[9px] font-bold bg-neutral-500 text-white">
                        {emp?.nombre?.[0]}
                      </div>
                    )}
                  </div>
                  {/* AJUSTE: Tooltip de nombre que aparece en hover/click */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 text-white text-[9px] rounded shadow-lg opacity-0 pointer-events-none group-hover/avatar:opacity-100 transition-opacity z-20 whitespace-nowrap">
                    {emp?.nombre} {emp?.apellidos}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-neutral-900" />
                  </div>
                </div>
               )
            })}
          </div>
          <div className="flex items-center gap-1 font-medium">
            <Calendar size={12} />
            <time>{new Date(act.fecha_limite || act.created_at || '').toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>
          </div>
        </div>

        {(act.calificacion ?? 0) > 0 && (
          <div className="mt-2 rounded-lg bg-amber-500/10 p-2 border border-amber-500/20">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9px] font-bold uppercase text-amber-600">Evaluación</span>
              <div className="flex text-amber-500 text-[10px]">
                {'★'.repeat(act.calificacion || 0)}{'☆'.repeat(5 - (act.calificacion || 0))}
              </div>
            </div>
            {act.observaciones_evaluacion && <p className="line-clamp-2 text-[10px] italic text-neutral-500 leading-tight">"{act.observaciones_evaluacion}"</p>}
          </div>
        )}
      </div>

      {/* 3. Footer */}
      <div className="pt-3 mt-auto border-t border-neutral-100 dark:border-neutral-800/50">
        
        {esNoRealizada ? (
          canManage ? (
            <div className="flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => onReasignar(act)} className="flex items-center justify-center gap-2 py-2 rounded-lg bg-blue-600 text-white text-[10px] font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-md"><RefreshCw size={14} /> Reasignar</button>
                <button onClick={() => onStatusChange(act.id, 'no_realizada')} className="flex items-center justify-center gap-2 py-2 rounded-lg bg-neutral-800 text-white text-[10px] font-bold hover:bg-black transition-all active:scale-95"><XCircle size={14} /> Finalizar</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold animate-pulse"><XCircle size={14} /> TIEMPO AGOTADO</div>
          )
        ) : (
          isAssignedToMe && act.estado !== 'completada' && (act.estado as string) !== 'no_realizada' ? (
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { value: 'pendiente', icon: Clock },
                { value: 'en_progreso', icon: RotateCw },
                { value: 'explicacion_requerida', icon: HelpCircle },
                canManage 
                  ? { value: 'completada', icon: CheckCircle2 } 
                  : { value: 'revision', icon: Eye },
              ].map((opt) => {
                const Icon = opt.icon;
                const isActive = act.estado === opt.value;
                const optStyle = stateStyles[opt.value];
                return (
                  <button
                    key={opt.value}
                    onClick={() => onStatusChange(act.id, opt.value)}
                    className={`flex items-center justify-center rounded-lg p-2 transition-all duration-300 active:scale-90 ${isActive ? `${optStyle.btn} text-white scale-105` : 'bg-neutral-100 dark:bg-neutral-800/60 text-neutral-400 hover:bg-neutral-200'}`}
                    title={optStyle.label}
                  >
                    <Icon size={16} className={isActive && (opt.value === 'revision' || opt.value === 'explicacion_requerida') ? 'animate-pulse' : ''} />
                  </button>
                )
              })}
            </div>
          ) : (
            <div className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] font-bold text-white shadow-sm transition-all ${currentStyle.btn}`}>
              <StatusIcon size={12} />
              <span>{currentStyle.label.toUpperCase()}</span>
            </div>
          )
        )}

        {canManage && (
          <div className="mt-2 flex justify-end gap-1 pt-1 border-t border-neutral-100 dark:border-neutral-800/30">
            <button onClick={() => onDelete(act.id)} className="p-1.5 text-neutral-400 hover:text-red-500 rounded-lg transition-all" title="Eliminar"><Trash2 size={14} /></button>
            {((act.estado as string) === 'completada' || (act.estado as string) === 'no_realizada') && (
              <button onClick={() => onEvaluar(act)} className="p-1.5 text-neutral-400 hover:text-amber-500 rounded-lg transition-all" title="Evaluar"><Star size={14} /></button>
            )}
            {canManage && act.estado === 'revision' && (
               <button onClick={() => onStatusChange(act.id, 'completada')} className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Aprobar"><CheckCircle2 size={14} /></button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}