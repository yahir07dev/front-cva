'use client'

import { useMemo } from 'react'
import { 
  format, 
  addDays, 
  startOfWeek, 
  isSameDay, 
  isToday 
} from 'date-fns'
import { es } from 'date-fns/locale' 
import { Calendar as CalendarIcon } from 'lucide-react'

interface DateHeaderProps {
  selectedDate: Date
  onDateChange: (date: Date) => void
  onCalendarClick: () => void
}

export default function DateHeader({ selectedDate, onDateChange, onCalendarClick }: DateHeaderProps) {
  
  const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i))
  }, [startOfCurrentWeek])

  const getHeaderText = (date: Date) => {
    if (isToday(date)) return 'Hoy'
    return format(date, "d 'de' MMMM", { locale: es })
  }

  return (
    /* bg-transparent: Se une al fondo de la página.
       Sin sombras ni bordes para eliminar el efecto de "cuadro".
    */
    <div className="w-full bg-transparent text-neutral-900 dark:text-white py-6 px-4 transition-all duration-300">
      
      {/* Selector de fecha: Ya no parece un botón, solo icono y texto interactivo */}
      <div className="flex items-center justify-center mb-10">
        <button 
          onClick={onCalendarClick}
          className="flex items-center gap-2 group transition-opacity hover:opacity-70 active:scale-95"
        >
          <CalendarIcon size={20} className="text-neutral-400 dark:text-white/40 group-hover:text-orange-500 transition-colors" />
          <span className="text-lg font-bold capitalize tracking-tight">
            {getHeaderText(selectedDate)}
          </span>
        </button>
      </div>

      {/* Tira de Días: Diseño "Seamless" */}
      <div className="flex justify-between items-center max-w-4xl mx-auto px-2">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate)
          const isHoy = isToday(day)

          return (
            <button
              key={day.toString()}
              onClick={() => onDateChange(day)}
              className={`
                flex flex-col items-center gap-4 group transition-all duration-500
                ${isSelected ? 'scale-110' : 'hover:scale-105 opacity-40 hover:opacity-100'}
              `}
            >
              {/* Círculo de día: En blanco es negro plano, en dark es blanco puro */}
              <div className={`
                w-11 h-11 rounded-2xl flex items-center justify-center text-xs font-black transition-all duration-500
                ${isSelected 
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-black dark:shadow-[0_0_20px_rgba(255,255,255,0.15)]' 
                  : 'bg-neutral-200/40 dark:bg-white/5 group-hover:bg-neutral-300/60 dark:group-hover:bg-white/10'}
              `}>
                {format(day, 'EEEEE', { locale: es }).charAt(0).toUpperCase()}
              </div>
              
              <div className="flex flex-col items-center gap-1.5">
                <span className={`
                  text-lg transition-colors duration-300
                  ${isSelected 
                    ? 'text-orange-500 font-black' 
                    : isHoy 
                      ? 'text-neutral-900 dark:text-white font-bold' 
                      : 'text-neutral-500 dark:text-neutral-500 font-medium'}
                `}>
                   {format(day, 'd')}
                </span>

                {/* Puntito indicador naranja */}
                <div className={`
                  w-1.5 h-1.5 rounded-full transition-all duration-700
                  ${isSelected 
                    ? 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,1)] scale-100' 
                    : 'bg-transparent scale-0'}
                `} />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}