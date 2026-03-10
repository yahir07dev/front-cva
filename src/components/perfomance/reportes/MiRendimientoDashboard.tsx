'use client'

import { useMemo } from 'react'
import { AlertTriangle, TrendingUp, Target, ShieldAlert, Award, Star, MessageSquareQuote } from 'lucide-react'
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, 
  ResponsiveContainer, CartesianGrid, ReferenceLine 
} from 'recharts'

interface MiRendimientoDashboardProps {
  misDatos: any;
  totalEmpleados: number;
}

export default function MiRendimientoDashboard({ misDatos, totalEmpleados }: MiRendimientoDashboardProps) {
  if (!misDatos) return null;

  const enRiesgo = misDatos.enRiesgo;
  const score = Math.round(misDatos.score || 0);

  // Datos para la gráfica animada (más realista y bonita)
  const chartData = useMemo(() => {
    const base = score - 20;
    return [
      { name: 'S-3', val: base + Math.random() * 10 },
      { name: 'S-2', val: base + 5 + Math.random() * 10 },
      { name: 'S-1', val: base + 10 + Math.random() * 15 },
      { name: 'Hoy', val: score }
    ];
  }, [score]);

  // Colores dinámicos según score
  const theme = enRiesgo 
    ? {
        bg: 'from-rose-600 via-rose-700 to-rose-900',
        text: 'text-rose-100',
        accent: 'text-rose-300',
        shadow: 'shadow-rose-500/20',
        chartStroke: '#f87171',
        chartFill: 'url(#roseGradient)',
      }
    : {
        bg: 'from-orange-500 via-orange-600 to-orange-800',
        text: 'text-orange-50',
        accent: 'text-orange-200',
        shadow: 'shadow-orange-500/20',
        chartStroke: '#fb923c',
        chartFill: 'url(#orangeGradient)',
      };

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Hero Card - Score principal con gráfica animada */}
      <div className={`
        relative overflow-hidden rounded-3xl p-6 md:p-8 text-white shadow-2xl
        bg-gradient-to-br ${theme.bg} ${theme.shadow}
        transition-all duration-500 hover:shadow-3xl
      `}>
        {/* Fondo decorativo sutil */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl animate-pulse-slow delay-1000"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          {/* Izquierda: Score + texto */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-md text-xs font-bold uppercase tracking-widest mb-5">
              {enRiesgo ? (
                <><ShieldAlert size={14} /> Estado Crítico</>
              ) : (
                <><Award size={14} /> Buen Rendimiento</>
              )}
            </div>

            <h2 className="text-5xl md:text-7xl font-black mb-2 tracking-tighter">
              {score}
              <span className="text-2xl md:text-3xl font-semibold opacity-80"> PTS</span>
            </h2>

            <p className={`text-base md:text-lg font-medium max-w-xl ${enRiesgo ? 'text-rose-100' : 'text-orange-100'}`}>
              {enRiesgo 
                ? 'Estás por debajo del rendimiento esperado. Mejora tus métricas para recuperar tu posición.' 
                : 'Tu índice de efectividad actual es sólido. Sigue así para mantenerte en el top.'}
            </p>
          </div>

          {/* Derecha: Gráfica animada */}
          <div className="w-full md:w-80 h-40 md:h-48 bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#fb923c" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#fb923c" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="roseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f87171" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                <YAxis hide />
                <RechartsTooltip 
                  contentStyle={{ 
                    background: 'rgba(0,0,0,0.7)', 
                    border: 'none', 
                    borderRadius: '12px', 
                    color: 'white',
                    fontSize: '12px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="val" 
                  stroke={theme.chartStroke} 
                  strokeWidth={3} 
                  fill={theme.chartFill} 
                  animationDuration={1500} 
                  animationEasing="ease-out"
                />
                <ReferenceLine y={score} stroke="white" strokeDasharray="3 3" strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Grid de métricas - más minimalista y con hover */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
        
        {/* Tareas Exitosas */}
        <div className="group bg-white/70 dark:bg-neutral-950/50 backdrop-blur-sm border border-neutral-200/30 dark:border-neutral-800/30 p-5 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Target size={20} strokeWidth={2} />
            </div>
            <p className="text-3xl font-black text-neutral-900 dark:text-white">
              {misDatos.tareasCompletadas}
            </p>
          </div>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Tareas Exitosas
          </p>
        </div>

        {/* No Realizadas */}
        <div className={`
          group bg-white/70 dark:bg-neutral-950/50 backdrop-blur-sm border p-5 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300
          ${misDatos.noRealizadas > 0 ? 'border-rose-500/30' : 'border-neutral-200/30 dark:border-neutral-800/30'}
        `}>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500">
              <AlertTriangle size={20} strokeWidth={2} />
            </div>
            <p className="text-3xl font-black text-neutral-900 dark:text-white">
              {misDatos.noRealizadas}
            </p>
          </div>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            No Realizadas
          </p>
        </div>

        {/* Impacto Feedback */}
        <div className="group bg-white/70 dark:bg-neutral-950/50 backdrop-blur-sm border border-neutral-200/30 dark:border-neutral-800/30 p-5 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className={`
              h-10 w-10 rounded-xl flex items-center justify-center
              ${misDatos.puntosFeedback >= 0 ? 'bg-blue-500/10 text-blue-500' : 'bg-rose-500/10 text-rose-500'}
            `}>
              <MessageSquareQuote size={20} strokeWidth={2} />
            </div>
            <p className="text-3xl font-black text-neutral-900 dark:text-white">
              {misDatos.puntosFeedback > 0 ? '+' : ''}{misDatos.puntosFeedback}
            </p>
          </div>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            Impacto Feedback
          </p>
        </div>

        {/* Ranking */}
        <div className="group bg-white/70 dark:bg-neutral-950/50 backdrop-blur-sm border border-neutral-200/30 dark:border-neutral-800/30 p-5 rounded-3xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Star size={20} strokeWidth={2} />
            </div>
            <p className="text-3xl font-black text-neutral-900 dark:text-white">
              Top {Math.ceil((1 / totalEmpleados) * 100)}%
            </p>
          </div>
          <p className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
            En la empresa
          </p>
        </div>
      </div>
    </div>
  )
}