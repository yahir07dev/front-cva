'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { 
  format, 
  startOfWeek, 
  startOfMonth, 
  endOfMonth, 
  endOfWeek, 
  eachDayOfInterval, 
  subMonths, 
  addMonths, 
  isSameDay, 
  isSameMonth, 
  parseISO,
  startOfDay
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Flame } from 'lucide-react'
import { ActividadConRelaciones } from '@/src/types/performance'
import { useSession } from '@/src/hooks/useSession'

interface CalendarModalProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date
  onDateSelect: (date: Date) => void
  actividades: ActividadConRelaciones[]
  canManage: boolean 
  stats?: any
}

export default function CalendarModal({ 
  isOpen, 
  onClose, 
  selectedDate, 
  onDateSelect,
  actividades,
  canManage,
  stats
}: CalendarModalProps) {
  const { session } = useSession() as any
  const [viewDate, setViewDate] = useState(selectedDate)
  const [render, setRender] = useState(isOpen)
  
  // Si no puede gestionar, forzamos vista personal
  const [viewMode, setViewMode] = useState<'global' | 'personal'>('personal')
  const [isChanging, setIsChanging] = useState(false)

  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef(0)

  // Efecto para reiniciar el modo de vista al abrir si es manager
  useEffect(() => {
    if (isOpen) {
      setDragY(0)
      setRender(true)
      // Si es admin, puede empezar en global o personal (opcional, aquí lo dejo en personal por defecto)
      if (canManage) setViewMode('global')
    } else {
      const timer = setTimeout(() => {
        setRender(false)
        setDragY(0)
      }, 800)
      return () => clearTimeout(timer)
    }
  }, [isOpen, canManage])

  // --- SELECCIÓN DINÁMICA DE RACHAS ---
  // Aquí está la magia: Elegimos qué datos mostrar según el toggle
  const currentRacha = useMemo(() => {
      if (!stats) return { diasRegistrados: 0, diasPerfectos: 0 };
      
      // Si estamos en modo global, mostramos rachaGlobal (si existe)
      if (viewMode === 'global' && stats.rachaGlobal) {
          return stats.rachaGlobal;
      }
      
      // Si estamos en modo personal (o fallback), mostramos rachaPersonal
      return stats.rachaPersonal || { diasRegistrados: 0, diasPerfectos: 0 };
  }, [stats, viewMode]);


  const handleDragStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    startY.current = clientY
    setIsDragging(true)
  }

  const handleDragMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const deltaY = clientY - startY.current
    if (deltaY > 0) setDragY(deltaY)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    if (dragY > 120) {
      onClose()
    } else {
      setDragY(0)
    }
  }

  const handleModeChange = (mode: 'global' | 'personal') => {
    if (mode === viewMode) return
    setIsChanging(true)
    setTimeout(() => {
      setViewMode(mode)
      setIsChanging(false)
    }, 200)
  }

  // Cálculo de puntos en el calendario (Global vs Personal)
  const dailyData = useMemo(() => {
    // 1. Filtramos la fuente de datos
    const source = viewMode === 'global' 
        ? actividades // Todas
        : actividades.filter(act => 
            act.asignacion_actividades?.some((asig: any) => {
                const emp = asig.empleados || asig.empleado; // Soporte híbrido
                const empReal = Array.isArray(emp) ? emp[0] : emp;
                return empReal?.usuario_id === session?.user?.id;
            })
          ); // Solo mías

    const map: Record<string, { isPerfect: boolean, count: number }> = {};
    const grouped: Record<string, ActividadConRelaciones[]> = {};
    
    source.forEach(act => {
      const fechaRef = act.fecha_limite || act.created_at;
      if (!fechaRef) return;
      const fecha = parseISO(fechaRef as string);
      const key = startOfDay(fecha).toISOString();
      
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(act);
    });

    Object.keys(grouped).forEach(key => {
      const dayActs = grouped[key];
      // Día perfecto = Hay tareas Y todas están completadas
      const allDone = dayActs.length > 0 && dayActs.every(a => a.estado === 'completada');
      map[key] = { isPerfect: allDone, count: dayActs.length };
    });
    
    return map;
  }, [actividades, viewMode, session]);

  if (!render) return null

  const monthDays = eachDayOfInterval({
    start: startOfWeek(startOfMonth(viewDate), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(viewDate), { weekStartsOn: 1 })
  })

  const backdropOpacity = Math.max(0, 1 - dragY / 400)

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end isolate overflow-hidden">
      <div 
        className={`absolute inset-0 bg-black/40 dark:bg-black/80 backdrop-blur-sm transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        style={{ opacity: isDragging ? backdropOpacity : undefined }}
        onClick={onClose} 
      />

      <div 
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
        className={`
          relative w-full bg-white dark:bg-[#09090b] text-neutral-900 dark:text-white rounded-t-[42px] border-t border-neutral-100 dark:border-white/5 shadow-2xl 
          flex flex-col max-h-[95vh] overflow-hidden select-none touch-none
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        `}
        style={{ 
          transition: isDragging ? 'none' : 'transform 800ms cubic-bezier(0.32, 0.72, 0, 1)',
          transform: `translateY(${dragY}px)`
        }}
      >
        
        <div className="w-full flex flex-col items-center pt-6 pb-12 cursor-grab active:cursor-grabbing">
          <div className="w-14 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </div>

        <div className="flex-1 overflow-y-auto px-8 pb-16 text-center scrollbar-hide pointer-events-auto">
          <div className={`transition-all duration-300 ${isChanging ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
            <h2 className="text-2xl font-black tracking-tight mb-6">
              {viewMode === 'global' ? "Rendimiento Equipo" : "Mis Rachas"}
            </h2>
          </div>

          {canManage && (
            <div className="flex justify-center mb-10">
              <div className="relative flex p-1 bg-neutral-100 dark:bg-white/5 rounded-2xl border border-neutral-200 dark:border-white/5 w-64">
                <div 
                  className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white dark:bg-neutral-800 rounded-xl shadow-sm transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1) ${viewMode === 'personal' ? 'translate-x-[calc(100%+0px)]' : 'translate-x-0'}`}
                />
                <button onClick={(e) => { e.stopPropagation(); handleModeChange('global'); }} className={`relative z-10 flex-1 py-2 text-xs font-black transition-colors ${viewMode === 'global' ? 'text-orange-500' : 'text-neutral-400'}`}>Global</button>
                <button onClick={(e) => { e.stopPropagation(); handleModeChange('personal'); }} className={`relative z-10 flex-1 py-2 text-xs font-black transition-colors ${viewMode === 'personal' ? 'text-orange-500' : 'text-neutral-400'}`}>Personal</button>
              </div>
            </div>
          )}

          <div className={`grid grid-cols-2 gap-4 mb-12 transition-all duration-500 ${isChanging ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
             <div className="flex flex-col items-center relative py-4">
              <div className={`absolute top-4 w-24 h-24 bg-yellow-500/10 blur-[40px] rounded-full -z-10 ${currentRacha.diasRegistrados > 0 ? 'animate-pulse-glow' : ''}`} />
              <Flame size={60} className={`transition-all duration-700 ${currentRacha.diasRegistrados > 0 ? 'text-yellow-500 fill-yellow-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] animate-bounce-subtle' : 'text-neutral-300 dark:text-neutral-800'}`} />
              <span className={`text-4xl font-black mt-2 ${currentRacha.diasRegistrados > 0 ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>{currentRacha.diasRegistrados || 0}</span>
              <p className="text-[9px] uppercase tracking-widest font-bold text-neutral-400">Días con Éxito</p>
            </div>
            <div className="flex flex-col items-center relative py-4">
              <div className={`absolute top-4 w-24 h-24 bg-emerald-500/10 blur-[40px] rounded-full -z-10 ${currentRacha.diasPerfectos > 0 ? 'animate-pulse-glow' : ''}`} />
              <Flame size={60} className={`transition-all duration-700 ${currentRacha.diasPerfectos > 0 ? 'text-emerald-500 fill-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-bounce-subtle' : 'text-neutral-300 dark:text-neutral-800'}`} />
              <span className={`text-4xl font-black mt-2 ${currentRacha.diasPerfectos > 0 ? 'text-neutral-900 dark:text-white' : 'text-neutral-400'}`}>{currentRacha.diasPerfectos || 0}</span>
              <p className="text-[9px] uppercase tracking-widest font-bold text-neutral-400">Días Perfectos</p>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-neutral-100 dark:via-white/5 to-transparent mb-12" />

          <div className="max-w-xs mx-auto">
             <div className="flex items-center justify-between mb-10 px-2">
              <button onClick={(e) => { e.stopPropagation(); setViewDate(subMonths(viewDate, 1)); }} className="p-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full text-neutral-400"><ChevronLeft size={24} /></button>
              <h3 className="text-lg font-bold capitalize">{format(viewDate, 'MMMM yyyy', { locale: es })}</h3>
              <button onClick={(e) => { e.stopPropagation(); setViewDate(addMonths(viewDate, 1)); }} className="p-2.5 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full text-neutral-400"><ChevronRight size={24} /></button>
            </div>
            <div className="grid grid-cols-7 mb-6 text-center">
              {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                <span key={i} className="text-[11px] font-black text-neutral-300 dark:text-neutral-700 uppercase tracking-widest">{d}</span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-10 gap-x-2 justify-items-center">
              {monthDays.map((day, i) => {
                const dayKey = startOfDay(day).toISOString();
                const data = dailyData[dayKey];
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, viewDate);
                return (
                  <button key={i} disabled={!isCurrentMonth} onClick={(e) => { e.stopPropagation(); onDateSelect(day); onClose(); }} className={`relative flex flex-col items-center justify-center transition-all duration-300 ${!isCurrentMonth ? 'opacity-0' : 'opacity-100'}`}>
                    {data?.count > 0 && <span className={`absolute -top-5 text-[9px] font-bold ${isSelected ? 'text-orange-500' : 'text-neutral-400'}`}>{data.count}</span>}
                    <span className={`text-lg font-medium ${isSelected ? 'text-orange-500 font-black scale-125' : data?.isPerfect ? 'text-emerald-500 font-bold' : 'text-neutral-400'}`}>{format(day, 'd')}</span>
                    <div className={`mt-2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,1)]' : data?.isPerfect ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,1)] animate-pulse' : 'bg-transparent'}`} />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}