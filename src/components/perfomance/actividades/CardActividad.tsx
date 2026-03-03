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

  const stateStyles: Record<string, { accent: string, btn: string, icon: any, label: string, lightBg: string, textColor: string }> = {
    pendiente: { 
      accent: esNoRealizada ? 'bg-rose-500' : 'bg-orange-500', 
      btn: 'bg-orange-500', 
      icon: Clock, 
      label: esNoRealizada ? 'Vencida' : 'Pendiente',
      lightBg: esNoRealizada ? 'bg-rose-500/10 text-rose-600' : 'bg-orange-500/10 text-orange-600',
      textColor: esNoRealizada ? 'group-hover:text-rose-600' : 'group-hover:text-orange-600'
    },
    en_progreso: { 
      accent: esNoRealizada ? 'bg-rose-500' : 'bg-blue-500', 
      btn: 'bg-blue-500', 
      icon: RotateCw, 
      label: esNoRealizada ? 'Retrasada' : 'En progreso',
      lightBg: esNoRealizada ? 'bg-rose-500/10 text-rose-600' : 'bg-blue-500/10 text-blue-600',
      textColor: esNoRealizada ? 'group-hover:text-rose-600' : 'group-hover:text-blue-600'
    },
    explicacion_requerida: { 
      accent: 'bg-rose-500', 
      btn: 'bg-rose-500', 
      icon: HelpCircle, 
      label: 'Requiere ayuda',
      lightBg: 'bg-rose-500/10 text-rose-600',
      textColor: 'group-hover:text-rose-600'
    },
    revision: { 
      accent: 'bg-purple-500', 
      btn: 'bg-purple-600', 
      icon: Eye, 
      label: 'En Revisión',
      lightBg: 'bg-purple-500/10 text-purple-600',
      textColor: 'group-hover:text-purple-600'
    },
    completada: { 
      accent: 'bg-emerald-500', 
      btn: 'bg-emerald-600', 
      icon: CheckCircle2, 
      label: 'Completada',
      lightBg: 'bg-emerald-500/10 text-emerald-600',
      textColor: 'group-hover:text-emerald-600'
    },
    no_realizada: { 
      accent: 'bg-neutral-500', 
      btn: 'bg-neutral-600', 
      icon: XCircle, 
      label: 'No Realizada',
      lightBg: 'bg-neutral-500/10 text-neutral-600',
      textColor: 'group-hover:text-neutral-600'
    },
  }

  const currentStyle = stateStyles[act.estado || 'pendiente'] || stateStyles.pendiente;
  const StatusIcon = currentStyle.icon;

  const prioridadConfig = {
    alta: { icon: Zap, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    media: { icon: AlertCircle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    baja: { icon: CircleDot, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  }
  const prioridad = prioridadConfig[act.prioridad as keyof typeof prioridadConfig] || prioridadConfig.baja

  return (
    <div className={`
      group relative flex flex-col justify-between w-full p-5 rounded-[32px] transition-all duration-500
      min-h-[340px] bg-white dark:bg-white/[0.02] backdrop-blur-md
      border border-neutral-200/50 dark:border-0
      hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/5 dark:hover:shadow-white/5
      active:scale-[0.98] overflow-hidden
    `}>
      
      {/* Indicador de estado lateral sutil */}
      <div className={`absolute left-0 top-12 bottom-12 w-1 rounded-r-full ${currentStyle.accent} opacity-50 group-hover:opacity-100 transition-opacity`} />

      {esNoRealizada && (
        <div className="absolute top-0 left-0 w-full bg-rose-600 text-white text-[10px] font-black py-1.5 flex items-center justify-center gap-1 z-20 animate-pulse tracking-widest">
          <AlertTriangle size={12} /> PLAZO AGOTADO
        </div>
      )}

      {/* 1. Header */}
      <div className={`flex items-start justify-between gap-2 mb-4 ${esNoRealizada ? 'mt-6' : ''}`}>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider ${currentStyle.lightBg} border border-current/5`}>
          <StatusIcon size={12} strokeWidth={3} className={(act.estado === 'explicacion_requerida' || esNoRealizada) ? 'animate-pulse' : ''} />
          {currentStyle.label}
        </span>
        <span className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${prioridad.bg} ${prioridad.color}`}>
          <prioridad.icon size={12} strokeWidth={3} />
          {act.prioridad}
        </span>
      </div>

      {/* 2. Cuerpo */}
      <div className="flex-1 space-y-3 mb-4">
        <h3 className={`line-clamp-2 text-lg font-black text-neutral-900 dark:text-neutral-50 transition-colors duration-300 leading-snug ${currentStyle.textColor}`}>
          {act.titulo}
        </h3>
        <p className="line-clamp-2 text-xs font-medium text-neutral-500 dark:text-neutral-400/70 leading-relaxed">
          {act.descripcion || 'Sin descripción detallada'}
        </p>

        {!isExpired && !['completada', 'no_realizada', 'revision'].includes(act.estado || '') && act.fecha_limite && (
          <div className="flex items-center gap-2 text-[10px] font-black text-orange-600 dark:text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-xl w-fit border border-orange-500/10">
            <Timer size={14} strokeWidth={3} />
            {timeLeft.toUpperCase()}
          </div>
        )}

        {/* Avatares y Fecha */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex -space-x-2">
            {act.asignacion_actividades?.map((asig: any, i: number) => {
               const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados;
               let fotoUrl = emp?.foto_perfil_url;
               if ((!fotoUrl || fotoUrl.trim() === '') && emp?.usuario_id === currentUserId) {
                   fotoUrl = session?.user?.user_metadata?.avatar_url;
               }
               return (
                <div key={i} className="group/avatar relative">
                  <div className="relative h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-800 border-2 border-white dark:border-neutral-950 overflow-hidden shadow-sm transition-transform group-hover/avatar:scale-110 group-hover/avatar:z-10">
                    {fotoUrl ? (
                      <img src={fotoUrl} alt="U" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[10px] font-black bg-neutral-500 text-white uppercase">
                        {emp?.nombre?.[0]}
                      </div>
                    )}
                  </div>
                </div>
               )
            })}
          </div>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-tighter">
            <Calendar size={13} />
            <time>{new Date(act.fecha_limite || act.created_at || '').toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}</time>
          </div>
        </div>

        {/* Evaluación */}
        {(act.calificacion ?? 0) > 0 && (
          <div className="mt-3 rounded-[20px] bg-amber-500/5 p-3 border border-amber-500/10">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-600/80">Feedback</span>
              <div className="flex text-amber-500 gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={10} fill={i < (act.calificacion || 0) ? "currentColor" : "none"} strokeWidth={3} />
                ))}
              </div>
            </div>
            {act.observaciones_evaluacion && <p className="line-clamp-2 text-[10px] italic text-neutral-500 dark:text-neutral-400 leading-tight">"{act.observaciones_evaluacion}"</p>}
          </div>
        )}
      </div>

      {/* 3. Footer de Acciones */}
      <div className="pt-4 mt-auto border-t border-neutral-100 dark:border-white/5">
        {esNoRealizada ? (
          canManage ? (
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => onReasignar(act)} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"><RefreshCw size={14} strokeWidth={3} /> Reasignar</button>
              <button onClick={() => onStatusChange(act.id, 'no_realizada')} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-neutral-900 dark:bg-white dark:text-black text-white text-[10px] font-black uppercase transition-all active:scale-95"><XCircle size={14} strokeWidth={3} /> Cerrar</button>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2 p-3 rounded-xl bg-rose-500/10 text-rose-600 text-[10px] font-black uppercase tracking-widest animate-pulse border border-rose-500/10"><XCircle size={14} strokeWidth={3} /> Tiempo Agotado</div>
          )
        ) : (
          isAssignedToMe && act.estado !== 'completada' && (act.estado as string) !== 'no_realizada' ? (
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'pendiente', icon: Clock },
                { value: 'en_progreso', icon: RotateCw },
                { value: 'explicacion_requerida', icon: HelpCircle },
                canManage ? { value: 'completada', icon: CheckCircle2 } : { value: 'revision', icon: Eye },
              ].map((opt) => {
                const Icon = opt.icon;
                const isActive = act.estado === opt.value;
                const optStyle = stateStyles[opt.value];
                return (
                  <button
                    key={opt.value}
                    onClick={() => onStatusChange(act.id, opt.value)}
                    className={`flex items-center justify-center rounded-xl p-2.5 transition-all duration-300 active:scale-90 ${isActive ? `${optStyle.btn} text-white shadow-lg` : 'bg-neutral-100 dark:bg-white/5 text-neutral-400 hover:bg-neutral-200 dark:hover:bg-white/10'}`}
                  >
                    <Icon size={18} strokeWidth={isActive ? 3 : 2} className={isActive && (opt.value === 'revision' || opt.value === 'explicacion_requerida') ? 'animate-pulse' : ''} />
                  </button>
                )
              })}
            </div>
          ) : (
            <div className={`flex items-center justify-center gap-2 rounded-xl py-3 text-[10px] font-black text-white shadow-lg transition-all uppercase tracking-widest ${currentStyle.btn}`}>
              <StatusIcon size={14} strokeWidth={3} />
              <span>{currentStyle.label}</span>
            </div>
          )
        )}

        {canManage && (
          <div className="mt-3 flex justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-white/5">
            <button onClick={() => onDelete(act.id)} className="p-2 text-neutral-400 hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"><Trash2 size={16} /></button>
            {((act.estado as string) === 'completada' || (act.estado as string) === 'no_realizada') && (
              <button onClick={() => onEvaluar(act)} className="p-2 text-neutral-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all"><Star size={16} /></button>
            )}
            {canManage && act.estado === 'revision' && (
               <button onClick={() => onStatusChange(act.id, 'completada')} className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all"><CheckCircle2 size={16} /></button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}