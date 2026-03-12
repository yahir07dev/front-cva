'use client'
import { Plus, GraduationCap, PlayCircle, Users, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { useTheme } from '@/src/context/ThemeContext'
import { useState, useEffect } from 'react'

interface HeaderProps {
  onNuevoCurso: () => void
  stats: { totales: number; activos: number; obligatorios: number }
}

export default function HeaderCapacitacion({ onNuevoCurso, stats }: HeaderProps) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Contenedor principal mejorado (más profundidad sin azul)
  const containerClass = isDark
    ? 'bg-neutral-950/90 backdrop-blur-xl shadow-xl shadow-black/40'
    : 'bg-white/90 backdrop-blur-xl shadow-lg shadow-slate-200/40'

  const textClass = isDark ? 'text-white' : 'text-slate-900'
  const subTextClass = isDark ? 'text-neutral-400' : 'text-slate-600'
  const accentClass = 'text-rose-500'

  // Tarjetas mejoradas: glass más premium, hover con glow rose sutil
  const cardBase = isDark
    ? 'bg-neutral-900/60 backdrop-blur-lg border border-neutral-800/40 shadow-sm shadow-black/20'
    : 'bg-white/85 backdrop-blur-lg border border-slate-200/50 shadow-sm'

  const cardHover = isDark
    ? 'hover:bg-neutral-800/80 hover:border-rose-900/30 hover:shadow-rose-950/20 hover:scale-[1.02]'
    : 'hover:bg-slate-50/90 hover:border-rose-200/60 hover:shadow-rose-100/40 hover:scale-[1.02]'

  const iconBg = isDark
    ? 'bg-neutral-800/70 backdrop-blur-md'
    : 'bg-slate-100/80 backdrop-blur-md'

  const statsItems = [
    { icon: GraduationCap, label: 'Totales', value: stats.totales },
    { icon: PlayCircle, label: 'Activos', value: stats.activos },
    { icon: Users, label: 'Obligatorios', value: stats.obligatorios },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`mb-6 rounded-2xl p-5 sm:p-6 ${containerClass} overflow-hidden`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0.92 }}
            animate={{ scale: 1 }}
            className={`p-3 rounded-xl ${iconBg}`}
          >
            <Sparkles size={24} className={accentClass} />
          </motion.div>
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold tracking-tight ${textClass}`}>
              Academia RRHH
            </h1>
            <p className={`text-sm sm:text-base ${subTextClass} mt-1 opacity-90`}>
              Cursos y desarrollo del equipo
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.04, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNuevoCurso}
          className={`
            group flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-base
            transition-all duration-300
            ${isDark
              ? 'bg-rose-700/90 hover:bg-rose-600 text-white shadow-lg shadow-rose-950/30'
              : 'bg-rose-50 hover:bg-rose-100 text-rose-700 shadow-md hover:shadow-lg border border-rose-200/60'}
          `}
        >
          <Plus 
            size={20} 
            className="transition-transform duration-300 group-hover:rotate-90" 
          />
          Nuevo Curso
        </motion.button>
      </div>

      <div className="mt-6">
        {isMobile ? (
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
            {statsItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.12 * i, duration: 0.45 }}
                className={`flex-shrink-0 w-56 p-5 rounded-2xl ${cardBase} ${cardHover} transition-all duration-300 snap-center`}
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${iconBg}`}>
                    <item.icon size={24} className={accentClass} />
                  </div>
                  <div>
                    <p className={`text-xs font-medium uppercase tracking-wide ${subTextClass} opacity-80`}>
                      {item.label}
                    </p>
                    <p className={`text-3xl font-bold ${textClass} tracking-tight`}>
                      {item.value}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            {statsItems.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i, duration: 0.5 }}
                className={`p-5 rounded-2xl ${cardBase} ${cardHover} transition-all duration-300 flex items-center gap-5`}
              >
                <div className={`p-4 rounded-xl ${iconBg}`}>
                  <item.icon size={28} className={accentClass} />
                </div>
                <div>
                  <p className={`text-sm font-medium uppercase tracking-wide ${subTextClass} opacity-80`}>
                    {item.label}
                  </p>
                  <p className={`text-3xl font-bold ${textClass} tracking-tight`}>
                    {item.value}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}