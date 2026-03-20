'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle, Trash2, Info, X } from 'lucide-react'

interface ModalConfirmacionProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  titulo: string
  descripcion: string
  variant?: 'success' | 'danger' | 'info' | 'warning'
  textConfirmar?: string
  textCancelar?: string
  loading?: boolean
}

export default function ModalConfirmacion({
  isOpen,
  onClose,
  onConfirm,
  titulo,
  descripcion,
  variant = 'success',
  textConfirmar,
  textCancelar = 'Cancelar',
  loading = false
}: ModalConfirmacionProps) {
  
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const handleClose = () => {
    onClose()
  }

  if (!isVisible && !isOpen) return null

  const config = {
    danger: {
      icon: Trash2,
      color: 'text-rose-600 dark:text-rose-400',
      bgIcon: 'bg-rose-100 dark:bg-rose-500/10',
      btnBg: 'bg-rose-600 hover:bg-rose-700',
      btnText: 'Sí, eliminar',
      warningBg: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-200'
    },
    success: {
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgIcon: 'bg-emerald-100 dark:bg-emerald-500/10',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700',
      btnText: 'Confirmar',
      warningBg: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-200'
    },
    info: {
      icon: Info,
      color: 'text-blue-600 dark:text-blue-400',
      bgIcon: 'bg-blue-100 dark:bg-blue-500/10',
      btnBg: 'bg-blue-600 hover:bg-blue-700',
      btnText: 'Entendido',
      warningBg: 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-200'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bgIcon: 'bg-amber-100 dark:bg-amber-500/10',
      btnBg: 'bg-amber-600 hover:bg-amber-700',
      btnText: 'Continuar',
      warningBg: 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-200'
    }
  }

  const style = config[variant]
  const finalBtnText = textConfirmar || style.btnText
  
  // Detectar si la acción realmente es de "eliminar"
  const isDeleteAction = finalBtnText.toLowerCase().includes('eliminar')
  
  // Si es danger pero NO es eliminar, cambiamos el bote de basura por una alerta general
  const Icon = (variant === 'danger' && !isDeleteAction) ? AlertTriangle : style.icon

  return (
    <div className={`
      fixed inset-0 z-[100] flex items-center justify-center p-4
      transition-all duration-300 ease-out
      ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    `}>
      
      {/* Backdrop con animación de fade */}
      <div 
        className={`
          absolute inset-0 transition-all duration-300
          ${isOpen 
            ? 'bg-black/40 dark:bg-black/70 backdrop-blur-sm' 
            : 'bg-black/0 backdrop-blur-0'
          }
        `} 
        onClick={handleClose}
      />

      {/* Modal con animaciones */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className={`
          relative w-full max-w-sm rounded-3xl 
          bg-white dark:bg-neutral-900 
          shadow-2xl transition-all duration-300 ease-out
          ${isOpen 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-4'
          }
        `}
      >
        {/* Botón X con animación */}
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

        <div className="p-8 text-center">
          {/* Icono con animación de rebote suave */}
          <div 
            className={`
              mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl ${style.bgIcon}
              animate-in zoom-in-50 duration-300
            `}
          >
            <Icon className={`h-10 w-10 ${style.color} animate-in fade-in duration-500 delay-100`} />
          </div>

          {/* Título con animación */}
          <h3 className={`
            text-2xl font-bold text-neutral-900 dark:text-white mb-3
            animate-in fade-in slide-in-from-top-4 duration-500 delay-150
          `}>
            {titulo}
          </h3>

          {/* Descripción con animación */}
          <p className={`
            text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed
            animate-in fade-in slide-in-from-top-4 duration-500 delay-200
          `}>
            {descripcion}
          </p>

          {/* Advertencia adicional para variante danger dinámica */}
          {variant === 'danger' && (
            <div className={`
              mb-6 flex items-start gap-3 rounded-xl p-4 text-xs font-medium ${style.warningBg}
              animate-in fade-in slide-in-from-bottom-4 duration-500 delay-250
            `}>
              <AlertTriangle className="h-5 w-5 shrink-0 animate-pulse" />
              <span className="text-left">
                {isDeleteAction 
                  ? 'Esta acción es permanente y no se podrá recuperar la información.'
                  : 'Esta acción es permanente. Por favor, confirma que deseas continuar.'}
              </span>
            </div>
          )}

          {/* Botones con animación */}
          <div className={`
            grid grid-cols-2 gap-3
            animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300
          `}>
            <button
              onClick={handleClose}
              disabled={loading}
              className="
                rounded-2xl px-4 py-3 text-sm font-bold
                bg-neutral-100 dark:bg-neutral-800 
                text-neutral-600 dark:text-neutral-300
                hover:bg-neutral-200 dark:hover:bg-neutral-700
                transition-all duration-200 hover:scale-[1.02] active:scale-95 
                disabled:opacity-50 disabled:hover:scale-100
              "
            >
              {textCancelar}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`
                rounded-2xl px-4 py-3 text-sm font-bold text-white
                shadow-lg transition-all duration-200 
                hover:scale-[1.02] hover:shadow-xl active:scale-95 
                disabled:opacity-70 disabled:hover:scale-100
                flex items-center justify-center gap-2
                ${style.btnBg}
              `}
            >
              {loading && (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              )}
              {finalBtnText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}