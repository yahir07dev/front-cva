'use client'

import { useState, useEffect } from 'react'
import { Star } from 'lucide-react'

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

  // Reseteamos el estado cuando se abre el modal con nuevos datos
  useEffect(() => {
    if (isOpen) {
      setRating(initialRating || 5)
      setNota(initialNota || '')
    }
  }, [isOpen, initialRating, initialNota])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(rating, nota)
      onClose()
    } catch (error) {
      console.error("Error al guardar evaluación:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-gray-900">
        
        {/* Header del modal */}
        <div className="p-6 pb-0">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20">
              <Star className="h-8 w-8 text-amber-500" fill="currentColor" />
            </div>
          </div>
          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white">Evaluar tarea</h2>
          <p className="mt-2 line-clamp-1 text-center text-sm text-gray-600 dark:text-gray-400">
            {actividadTitulo}
          </p>
        </div>

        <div className="p-6">
          {/* Rating (Estrellas) */}
          <div className="mb-6">
            <label className="mb-3 block text-center text-xs font-medium text-gray-700 dark:text-gray-300">
              Calificación
            </label>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-5xl transition-all hover:scale-110 active:scale-95 ${
                    star <= rating ? 'text-amber-400 drop-shadow-lg' : 'text-gray-300 dark:text-gray-700'
                  }`}
                  type="button"
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Observaciones (Textarea) */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-medium text-gray-700 dark:text-gray-300">
              Observaciones
            </label>
            <textarea
              rows={4}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Comentarios, fortalezas, mejoras..."
              className="w-full resize-none rounded-xl bg-gray-50 px-4 py-3 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:ring-2 focus:ring-orange-500 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
            />
          </div>

          {/* Botones de Acción */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSaving}
              className="flex-1 rounded-xl bg-gray-100 px-4 py-3 text-sm font-medium text-gray-700 transition-all hover:bg-gray-200 active:scale-95 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="group relative flex-1 overflow-hidden rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/25 transition-all hover:shadow-xl hover:shadow-orange-500/30 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
            >
              <span className="relative z-10">{isSaving ? 'Guardando...' : 'Guardar'}</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}