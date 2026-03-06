'use client'

import { AlertTriangle, TrendingUp, Target, ShieldAlert, Award, Star, MessageSquareQuote } from 'lucide-react'
import { AreaChart, Area, XAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface MiRendimientoDashboardProps {
  misDatos: any;
  totalEmpleados: number;
}

export default function MiRendimientoDashboard({ misDatos, totalEmpleados }: MiRendimientoDashboardProps) {
  if (!misDatos) return null;

  const enRiesgo = misDatos.enRiesgo;
  const score = Math.round(misDatos.score || 0);
  
  // Datos simulados para la mini gráfica de consistencia (puedes conectarla a datos reales luego)
  const miniChartData = [
    { name: 'S1', val: score - 15 }, { name: 'S2', val: score - 5 }, 
    { name: 'S3', val: score + 10 }, { name: 'Actual', val: score }
  ];

  return (
    <div className="flex flex-col gap-6 w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* 1. TARJETA PRINCIPAL (HERO SCORE) */}
      <div className={`relative overflow-hidden rounded-[32px] p-8 md:p-10 text-white shadow-xl transition-all duration-500 ${
        enRiesgo 
          ? 'bg-gradient-to-br from-rose-500 via-rose-600 to-rose-800 shadow-rose-500/20' 
          : 'bg-gradient-to-br from-neutral-900 via-neutral-800 to-black dark:from-orange-500 dark:via-orange-600 dark:to-orange-800 shadow-orange-500/10'
      }`}>
        
        {/* Decoración de fondo */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold uppercase tracking-widest mb-6">
              {enRiesgo ? <><ShieldAlert size={14}/> Estado Crítico</> : <><Award size={14}/> Estado Operativo</>}
            </div>
            <h2 className="text-4xl md:text-5xl font-black mb-2 tracking-tight">
              {score} <span className="text-xl md:text-2xl font-medium opacity-70">PTS</span>
            </h2>
            <p className={`text-sm md:text-base font-medium max-w-md ${enRiesgo ? 'text-rose-100' : 'text-neutral-300 dark:text-orange-100'}`}>
              {enRiesgo 
                ? '⚠️ Estás por debajo del rendimiento esperado. Mejora tus métricas inmediatamente para evitar sanciones.' 
                : 'Este es tu índice de efectividad actual basado en tus tareas y feedback.'}
            </p>
          </div>

          {/* Mini Gráfica en el Hero */}
          <div className="w-full md:w-64 h-24 bg-white/5 rounded-2xl p-4 backdrop-blur-sm border border-white/10 hidden sm:block">
             <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={miniChartData}>
                  <Area type="monotone" dataKey="val" stroke="#fff" strokeWidth={3} fillOpacity={0.2} fill="#fff" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 2. GRID DE MÉTRICAS DETALLADAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Tareas Exitosas */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="h-10 w-10 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
            <Target size={20} strokeWidth={2.5}/>
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">{misDatos.tareasCompletadas}</p>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">Tareas Exitosas</p>
        </div>

        {/* Tareas Fallidas */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          {misDatos.noRealizadas > 0 && <div className="absolute top-0 right-0 w-2 h-full bg-rose-500 animate-pulse" />}
          <div className="h-10 w-10 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mb-4">
            <AlertTriangle size={20} strokeWidth={2.5}/>
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">{misDatos.noRealizadas}</p>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">No Realizadas</p>
        </div>

        {/* Feedback Score */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className={`h-10 w-10 rounded-2xl flex items-center justify-center mb-4 ${misDatos.puntosFeedback >= 0 ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-500' : 'bg-rose-50 dark:bg-rose-500/10 text-rose-500'}`}>
            <MessageSquareQuote size={20} strokeWidth={2.5}/>
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">
            {misDatos.puntosFeedback > 0 ? '+' : ''}{misDatos.puntosFeedback}
          </p>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">Impacto Feedback</p>
        </div>

        {/* Ranking */}
        <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
          <div className="h-10 w-10 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-500 flex items-center justify-center mb-4">
            <Star size={20} strokeWidth={2.5}/>
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white">
            Top {Math.ceil((1 / totalEmpleados) * 100)}%
          </p>
          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider mt-1">En la empresa</p>
        </div>

      </div>

    </div>
  )
}