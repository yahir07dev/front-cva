'use client'

import { useState, useEffect } from 'react'
import { Star, X } from 'lucide-react'

interface ModalEvaluacionProps {
  isOpen: boolean
  onClose: () => void
  onSave: (rating: number, nota: string) => Promise<void>
  actividadTitulo: string
  initialRating?: number
  initialNota?: string
}

export default function ModalEvaluacion({
  isOpen,
  onClose,
  onSave,
  actividadTitulo,
  initialRating = 5,
  initialNota = ''
}: ModalEvaluacionProps) {
  const [rating, setRating] = useState(initialRating)
  const [nota, setNota] = useState(initialNota)
  const [isSaving, setIsSaving] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setRating(initialRating || 5)
      setNota(initialNota || '')
      // Pequeño retraso para activar la animación de entrada
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
    }
  }, [isOpen, initialRating, initialNota])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(), 200) // Esperar a que termine la animación de salida
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(rating, nota)
      handleClose()
    } catch (error) {
      console.error("Error al guardar evaluación:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center p-4 
        transition-all duration-300 ease-out
        ${isVisible ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-0 pointer-events-none'}
      `}
      onClick={handleClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`
          relative w-full max-w-lg overflow-hidden rounded-3xl 
          bg-white dark:bg-neutral-950 
          shadow-2xl shadow-black/10 dark:shadow-black/50
          transition-all duration-300 ease-out
          ${isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
          }
        `}
      >
        {/* Botón de cerrar X con animación */}
        <button 
          onClick={handleClose}
          className="
            absolute right-5 top-5 z-10
            text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 
            transition-all duration-200 hover:rotate-90 active:scale-75
          "
        >
          <X size={20} />
        </button>

        {/* Header con animación de entrada */}
        <div className="p-8 pb-4">
          <div className="flex flex-col items-center">
            <div className="
              flex h-16 w-16 items-center justify-center rounded-2xl 
              bg-amber-50 dark:bg-amber-500/10
              animate-in fade-in slide-in-from-top-4 duration-500 delay-100
            ">
              <Star className="h-8 w-8 text-amber-500 dark:text-amber-400" fill="currentColor" />
            </div>
            <h2 className="
              mt-4 text-2xl font-bold text-neutral-900 dark:text-neutral-100 text-center
              animate-in fade-in slide-in-from-top-4 duration-500 delay-150
            ">
              Evaluar Tarea
            </h2>
            <p className="
              mt-1 line-clamp-2 text-center text-sm text-neutral-500 dark:text-neutral-400 max-w-xs
              animate-in fade-in slide-in-from-top-4 duration-500 delay-200
            ">
              {actividadTitulo}
            </p>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-8 pt-0 space-y-8">
          {/* Rating estrellas */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-250">
            <label className="block mb-4 text-center text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              Calificación
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`
                    text-5xl transition-all duration-200 
                    hover:scale-110 hover:rotate-3 active:scale-90
                    ${star <= rating 
                      ? 'text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
                      : 'text-neutral-200 dark:text-neutral-800 hover:text-amber-300/50'}
                  `}
                  style={{ transitionDelay: `${star * 50}ms` }}
                  type="button"
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Observaciones */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
            <label className="block mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
              Observaciones / Comentarios
            </label>
            <textarea
              rows={4}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Fortalezas, áreas de mejora..."
              className="
                w-full resize-none rounded-2xl 
                bg-neutral-50 dark:bg-neutral-900/50 
                px-4 py-3 text-sm text-neutral-900 dark:text-neutral-100 
                placeholder:text-neutral-400 dark:placeholder:text-neutral-500 
                focus:outline-none focus:ring-2 focus:ring-orange-500/40 
                transition-all duration-200
                hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-white/5
              "
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-350">
            <button
              onClick={handleClose}
              disabled={isSaving}
              className="
                flex-1 rounded-2xl py-3.5 px-4 text-sm font-bold
                bg-neutral-100 dark:bg-neutral-900 
                text-neutral-600 dark:text-neutral-400 
                hover:bg-neutral-200 dark:hover:bg-neutral-800 
                hover:text-neutral-900 dark:hover:text-neutral-100 
                active:scale-90 transition-all duration-200
                disabled:opacity-50
              "
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="
                group relative flex-[1.5] overflow-hidden rounded-2xl 
                bg-gradient-to-r from-orange-600 to-orange-500 
                py-3.5 px-4 text-sm font-bold text-white 
                shadow-lg shadow-orange-600/20 dark:shadow-orange-600/40 
                hover:shadow-xl hover:shadow-orange-600/30 hover:scale-[1.02]
                active:scale-95 transition-all duration-300
                disabled:opacity-60 disabled:pointer-events-none
              "
            >
              <span className="relative z-10">
                {isSaving ? 'Guardando...' : 'Guardar Evaluación'}
              </span>
              <div className="
                absolute inset-0 -translate-x-full 
                bg-gradient-to-r from-transparent via-white/20 to-transparent 
                transition-transform duration-700 
                group-hover:translate-x-full
              " />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}