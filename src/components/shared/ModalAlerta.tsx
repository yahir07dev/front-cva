'use client'

import { useEffect, useState } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'

interface ModalAlertaProps {
  isOpen: boolean
  onClose: () => void
  titulo: string
  descripcion: string
  variant?: 'success' | 'danger' | 'info' | 'warning'
  textBoton?: string
}

export default function ModalAlerta({
  isOpen,
  onClose,
  titulo,
  descripcion,
  variant = 'warning',
  textBoton = 'Entendido'
}: ModalAlertaProps) {
  
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible && !isOpen) return null

  const config = {
    danger: {
      icon: XCircle,
      color: 'text-rose-600 dark:text-rose-400',
      bgIcon: 'bg-rose-100 dark:bg-rose-500/10',
      btnBg: 'bg-rose-600 hover:bg-rose-700',
    },
    success: {
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgIcon: 'bg-emerald-100 dark:bg-emerald-500/10',
      btnBg: 'bg-emerald-600 hover:bg-emerald-700',
    },
    info: {
      icon: Info,
      color: 'text-blue-600 dark:text-blue-400',
      bgIcon: 'bg-blue-100 dark:bg-blue-500/10',
      btnBg: 'bg-blue-600 hover:bg-blue-700',
    },
    warning: {
      icon: AlertTriangle,
      color: 'text-amber-600 dark:text-amber-400',
      bgIcon: 'bg-amber-100 dark:bg-amber-500/10',
      btnBg: 'bg-amber-600 hover:bg-amber-700',
    }
  }

  const style = config[variant]
  const Icon = style.icon

  return (
    <div className={`
      fixed inset-0 z-[100] flex items-center justify-center p-4
      transition-all duration-300 ease-out
      ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    `}>
      <div 
        className={`absolute inset-0 transition-all duration-300 ${isOpen ? 'bg-black/40 dark:bg-black/70 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-0'}`} 
        onClick={onClose}
      />

      <div 
        onClick={(e) => e.stopPropagation()}
        className={`
          relative w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-900 
          shadow-2xl transition-all duration-300 ease-out p-8 text-center
          ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'}
        `}
      >
        <button 
          onClick={onClose}
          className="absolute right-5 top-5 z-10 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-all duration-200 hover:rotate-90 active:scale-75"
        >
          <X size={20} />
        </button>

        <div className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl ${style.bgIcon} animate-in zoom-in-50 duration-300`}>
          <Icon className={`h-10 w-10 ${style.color} animate-in fade-in duration-500 delay-100`} />
        </div>

        <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-3 animate-in fade-in slide-in-from-top-4 duration-500 delay-150">
          {titulo}
        </h3>

        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed animate-in fade-in slide-in-from-top-4 duration-500 delay-200">
          {descripcion}
        </p>

        <button
          onClick={onClose}
          className={`
            w-full rounded-2xl px-4 py-3 text-sm font-bold text-white
            shadow-lg transition-all duration-200 hover:scale-[1.02] hover:shadow-xl active:scale-95 
            ${style.btnBg} animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300
          `}
        >
          {textBoton}
        </button>
      </div>
    </div>
  )
}