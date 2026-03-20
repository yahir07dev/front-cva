'use client'

import { useState, useRef, useEffect } from 'react'
import { format, addDays } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, Calendar as CalendarIcon, Check, X } from 'lucide-react'

export default function DateTimePickerModal({ isOpen, onClose, onSelect, currentValue }: any) {
  const [tempDate, setTempDate] = useState(currentValue ? new Date(currentValue) : new Date())
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const startY = useRef(0)

  // Resetear fecha al abrir
  useEffect(() => {
    if (isOpen) {
      setTempDate(currentValue ? new Date(currentValue) : new Date())
      setDragY(0)
    }
  }, [isOpen, currentValue])

  const hours = Array.from({ length: 24 }, (_, i) => i)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5)

  const handleDragStart = (e: any) => {
    startY.current = e.touches ? e.touches[0].clientY : e.clientY
    setIsDragging(true)
  }
  const handleDragMove = (e: any) => {
    if (!isDragging) return
    const currentY = e.touches ? e.touches[0].clientY : e.clientY
    const deltaY = currentY - startY.current
    if (deltaY > 0) setDragY(deltaY)
  }
  const handleDragEnd = () => {
    setIsDragging(false)
    if (dragY > 120) onClose()
    else setDragY(0)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center isolate">
      {/* Overlay con desenfoque */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Contenedor del Modal */}
      <div 
        onMouseDown={handleDragStart} onMouseMove={handleDragMove} onMouseUp={handleDragEnd}
        onTouchStart={handleDragStart} onTouchMove={handleDragMove} onTouchEnd={handleDragEnd}
        className="
          relative w-full sm:max-w-lg 
          bg-white dark:bg-[#0d0d0d] 
          rounded-t-[42px] sm:rounded-[32px] 
          border-t sm:border border-white/10 
          shadow-2xl flex flex-col 
          max-h-[90vh] sm:max-h-[600px]
          transition-transform overflow-hidden
        "
        style={{ 
          transform: `translateY(${dragY}px)`, 
          transition: isDragging ? 'none' : 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)' 
        }}
      >
        {/* Handle solo en móvil */}
        <div className="w-full flex justify-center pt-4 pb-2 sm:hidden cursor-grab active:cursor-grabbing">
          <div className="w-12 h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800" />
        </div>

        {/* Header con botón cerrar en PC */}
        <div className="px-8 pt-6 pb-2 flex items-center justify-between">
          <div className="text-left">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">Definir plazo</h2>
            <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Ajusta entrega</p>
          </div>
          <button onClick={onClose} className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-neutral-400">
            <X size={18} />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="px-8 pb-10 space-y-8 overflow-y-auto scrollbar-hide py-4">
          
          {/* DÍA */}
          <div className="space-y-3">
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
              {[...Array(14)].map((_, i) => {
                const day = addDays(new Date(), i)
                const isSelected = format(day, 'yyyy-MM-dd') === format(tempDate, 'yyyy-MM-dd')
                return (
                  <button key={i} onClick={() => {
                    const newDate = new Date(tempDate)
                    newDate.setFullYear(day.getFullYear(), day.getMonth(), day.getDate())
                    setTempDate(newDate)
                  }} className={`flex-shrink-0 w-16 py-3 rounded-2xl flex flex-col items-center gap-1 transition-all snap-center border ${isSelected ? 'bg-orange-600 border-transparent text-white scale-105 shadow-lg' : 'bg-neutral-100 dark:bg-white/5 border-transparent text-neutral-500'}`}>
                    <span className="text-[9px] font-bold uppercase">{format(day, 'EEE', { locale: es })}</span>
                    <span className="text-base font-bold">{format(day, 'd')}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* HORA Y MINUTOS */}
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-orange-500 ml-1">Hora</label>
              <div className="grid grid-cols-4 gap-2">
                {hours.map(h => (
                  <button key={h} onClick={() => { const newDate = new Date(tempDate); newDate.setHours(h); setTempDate(newDate); }} className={`py-2 rounded-xl text-xs font-bold transition-all ${tempDate.getHours() === h ? 'bg-neutral-900 dark:bg-white text-white dark:text-black' : 'bg-neutral-100 dark:bg-white/5 text-neutral-500 hover:bg-orange-500/10'}`}>
                    {h.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-bold uppercase tracking-widest text-orange-500 ml-1">Minutos</label>
              <div className="grid grid-cols-3 gap-2">
                {minutes.map(m => (
                  <button key={m} onClick={() => { const newDate = new Date(tempDate); newDate.setMinutes(m); setTempDate(newDate); }} className={`py-2 rounded-xl text-xs font-bold transition-all ${tempDate.getMinutes() === m ? 'bg-neutral-900 dark:bg-white text-white dark:text-black' : 'bg-neutral-100 dark:bg-white/5 text-neutral-500 hover:bg-orange-500/10'}`}>
                    {m.toString().padStart(2, '0')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer fijo con botón */}
        <div className="p-6 bg-white dark:bg-[#0d0d0d] border-t border-white/5">
          <button onClick={() => { onSelect(tempDate.toISOString()); onClose(); }} className="w-full py-4 rounded-2xl bg-orange-600 text-white font-bold uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-orange-600/20 active:scale-95 transition-all flex items-center justify-center gap-3">
            <Check size={18} strokeWidth={3} /> Confirmar Plazo
          </button>
        </div>
      </div>
    </div>
  )
}