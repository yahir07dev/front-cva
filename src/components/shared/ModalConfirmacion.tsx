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
    if (isOpen) setIsVisible(true)
    else {
      const timer = setTimeout(() => setIsVisible(false), 200)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible && !isOpen) return null

  const config = {
    danger: {
      icon: Trash2,
      color: 'text-rose-600 dark:text-rose-400',
      bgIcon: 'bg-rose-100 dark:bg-rose-500/10 ring-rose-500/20',
      btnBg: 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20',
      btnText: 'Sí, eliminar',
      warningBg: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-200'
    },
    success: {
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgIcon: 'bg-emerald-100 dark:bg-emerald-500/10 ring-emerald-500/20',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20',
      btnText: 'Confirmar',
      warningBg: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-200'
    },
    info: {
      icon: Info,
      color: 'text-blue-600 dark:text-blue-400',
      bgIcon: 'bg-blue-100 dark:bg-blue-500/10 ring-blue-500/20',
      btnBg: 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20',
      btnText: 'Entendido',
      warningBg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900/50 text-blue-700 dark:text-blue-200'
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bgIcon: 'bg-amber-100 dark:bg-amber-500/10 ring-amber-500/20',
      btnBg: 'bg-amber-600 hover:bg-amber-700 shadow-amber-900/20',
      btnText: 'Continuar',
      warningBg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-200'
    }
  }

  const style = config[variant]
  const Icon = style.icon

  return (
    <div className={`
      fixed inset-0 z-[100] flex items-center justify-center p-4
      transition-all duration-200
      ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    `}>
      
      <div 
        className="absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      <div className={`
        relative w-full max-w-sm rounded-3xl 
        bg-white dark:bg-neutral-900 
        border border-neutral-200 dark:border-neutral-800 
        shadow-2xl transition-all duration-200
        ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}
      `}>
        
        <button 
          onClick={onClose}
          className="absolute right-5 top-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 text-center">
          <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl ring-1 ${style.bgIcon}`}>
            <Icon className={`h-10 w-10 ${style.color}`} />
          </div>

          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3">
            {titulo}
          </h3>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
            {descripcion}
          </p>

          {variant === 'danger' && (
            <div className={`mb-6 flex items-start gap-3 rounded-xl p-4 text-xs font-medium border ${style.warningBg}`}>
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span className="text-left">Esta acción es permanente y no se podrá recuperar el mensaje.</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="
                rounded-2xl px-4 py-3 text-sm font-bold
                bg-neutral-100 dark:bg-neutral-800 
                text-neutral-600 dark:text-neutral-300
                hover:bg-neutral-200 dark:hover:bg-neutral-700
                transition-all active:scale-95 disabled:opacity-50
              "
            >
              {textCancelar}
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className={`
                rounded-2xl px-4 py-3 text-sm font-bold text-white
                shadow-lg transition-all active:scale-95 disabled:opacity-70
                flex items-center justify-center gap-2
                ${style.btnBg}
              `}
            >
              {loading && <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
              {textConfirmar || style.btnText}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}