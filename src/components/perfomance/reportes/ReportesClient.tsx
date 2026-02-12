'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Download, TrendingUp, Trophy, Users, MessageSquare, Zap, Star, Search, UserCheck } from 'lucide-react'
import { useReportesData } from '@/src/hooks/useReportesData'
import StatCard from '@/src/components/shared/StatCard'

interface ReportesClientProps {
  actividades: any[]
  feedback: any[]
  currentUserId?: string | number
  isAdmin?: boolean
}

export default function ReportesClient({ actividades, feedback, currentUserId, isAdmin }: ReportesClientProps) {
  
  const { 
    topEmpleados, 
    datosGrafica, 
    filtroNombre, 
    setFiltroNombre, 
    filtroTipo, 
    setFiltroTipo, 
    exportarPDF 
  } = useReportesData(actividades, feedback)

  const listaVisible = useMemo(() => {
    const myId = Number(currentUserId)
    if (isAdmin) return topEmpleados
    return topEmpleados.filter(emp => emp.id === myId)
  }, [topEmpleados, isAdmin, currentUserId])

  const stats = useMemo(() => {
    const totalGlobal = topEmpleados.length
    const promedioGlobal = totalGlobal > 0 
      ? (topEmpleados.reduce((acc, curr) => acc + parseFloat(curr.promedio || '0'), 0) / totalGlobal).toFixed(1)
      : '0.0'

    const myId = Number(currentUserId)
    const misDatos = topEmpleados.find(e => e.id === myId)

    if (!isAdmin && misDatos) {
      const myRank = topEmpleados.findIndex(e => e.id === myId) + 1
      return {
        label1: "Mi Rendimiento",
        val1: `${misDatos.promedio} ★`,
        label2: "Promedio Global", 
        val2: `${promedioGlobal} ★`,
        label3: "Feedback Recibido",
        val3: misDatos.totalFeedback,
        label4: "Ranking Actual",
        val4: `#${myRank}`,
        topPerformer: misDatos.nombre.split(' ')[0]
      }
    }

    return {
      label1: "Promedio Global",
      val1: `${promedioGlobal} ★`,
      label2: "Total Evaluados",
      val2: totalGlobal,
      label3: "Total Feedback",
      val3: topEmpleados.reduce((acc, curr) => acc + curr.totalFeedback, 0),
      label4: "Mejor Desempeño",
      val4: topEmpleados[0]?.nombre?.split(' ')[0] || 'N/A',
      topPerformer: topEmpleados[0]?.nombre?.split(' ')[0] || 'N/A'
    }
  }, [topEmpleados, isAdmin, currentUserId])

  return (
    <div className="
      h-full flex flex-col overflow-y-auto 
      bg-gray-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 px-4 py-6 sm:px-8 space-y-8
      scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent
      hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-600
      scrollbar-thumb-rounded-full scrollbar-track-rounded-full
    ">
      
      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
            {isAdmin ? 'Analítica de Rendimiento' : 'Mi Reporte de Desempeño'}
          </h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1 font-medium">
            {isAdmin ? 'Panel de control de métricas y talento humano' : 'Resumen de tus objetivos y feedback recibido'}
          </p>
        </div>

        {isAdmin && (
          <button 
            onClick={exportarPDF}
            className="
              group flex items-center gap-2 px-6 py-3 
              bg-neutral-900 dark:bg-gradient-to-r dark:from-orange-600 dark:to-orange-500 
              text-white rounded-xl font-semibold text-sm 
              shadow-lg shadow-neutral-900/10 dark:shadow-orange-600/30 
              hover:shadow-xl hover:scale-[1.02]
              active:scale-98 transition-all duration-300
            "
          >
            <Download size={18} className="transition-transform group-hover:-translate-y-0.5" />
            <span>Reporte PDF</span>
          </button>
        )}
      </div>

      {/* KPIs Dinámicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp} label={stats.label1} value={stats.val1} accentColor="orange" />
        <StatCard icon={Users} label={stats.label2} value={stats.val2} accentColor="blue" />
        <StatCard icon={MessageSquare} label={stats.label3} value={stats.val3} accentColor="green" />
        <StatCard icon={isAdmin ? Trophy : UserCheck} label={stats.label4} value={stats.val4} accentColor="orange" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* GRÁFICA */}
        <div className="
          xl:col-span-2 flex flex-col 
          bg-white dark:bg-neutral-900/70 backdrop-blur-md 
          border border-neutral-200 dark:border-neutral-800/40 
          rounded-3xl p-6 sm:p-8 
          shadow-sm dark:shadow-[0_8px_25px_-10px_rgba(0,0,0,0.5)]
          relative overflow-hidden
        ">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
                <TrendingUp size={20} className="text-orange-500 dark:text-orange-400" /> 
                Tendencia Global
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                {isAdmin ? 'Evolución del equipo' : 'Promedio general de la empresa'}
              </p>
            </div>
            
            {isAdmin && (
              <select 
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="
                  px-4 py-2 rounded-xl bg-gray-50 dark:bg-neutral-800/70 border border-neutral-200 dark:border-neutral-700/50 
                  text-sm font-medium text-neutral-600 dark:text-neutral-300 outline-none 
                  focus:ring-2 focus:ring-orange-500/40 cursor-pointer
                  transition-all duration-200
                "
              >
                <option value="todos">Todo Feedback</option>
                <option value="positivo">Positivos</option>
                <option value="negativo">Negativos</option>
              </select>
            )}
          </div>

          <div className="h-[320px] w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosGrafica}>
                <defs>
                  <linearGradient id="colorPromedio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 500}} domain={[0, 6]} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: 'none', 
                    borderRadius: '16px', 
                    color: '#000',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)'
                  }} 
                  // Clase condicional para el tooltip en dark mode vía CSS o config
                />
                <Area type="monotone" dataKey="promedio" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorPromedio)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RANKING O TARJETA PERSONAL */}
        <div className="
          bg-white dark:bg-neutral-900/70 backdrop-blur-md 
          border border-neutral-200 dark:border-neutral-800/40 
          rounded-3xl p-6 
          shadow-sm dark:shadow-[0_8_25px_-10px_rgba(0,0,0,0.5)]
          flex flex-col h-[500px] xl:h-auto relative overflow-hidden
        ">
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white dark:from-neutral-950 to-transparent pointer-events-none z-20" />
          
          <div className="mb-6 z-10">
            <h3 className="text-xl font-bold text-neutral-800 dark:text-neutral-100 flex items-center gap-2">
              <Zap className="text-orange-500 dark:text-orange-400 fill-orange-500 dark:fill-orange-400" size={20} /> 
              {isAdmin ? 'Leaderboard' : 'Mi Posición'}
            </h3>
            
            {isAdmin && (
              <div className="mt-4 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors group-focus-within:text-orange-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Filtrar..." 
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  className="
                    w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-800/50 
                    text-sm font-medium text-neutral-800 dark:text-neutral-100 outline-none 
                    focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500/30 
                    transition-all duration-200 placeholder:text-neutral-400 dark:placeholder:text-neutral-500
                  "
                />
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent hover:scrollbar-thumb-neutral-400 scrollbar-thumb-rounded-full scrollbar-track-rounded-full pb-20 space-y-3 z-10">
            {listaVisible.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-neutral-400 text-sm">
                <p>No hay datos disponibles</p>
              </div>
            ) : (
              listaVisible.map((emp, index) => {
                const realRank = isAdmin ? index + 1 : topEmpleados.findIndex(e => e.id === emp.id) + 1
                
                return (
                  <div 
                    key={emp.id} 
                    className="
                      group relative flex items-center justify-between p-4 rounded-2xl 
                      bg-gray-50 dark:bg-neutral-900/50 hover:bg-neutral-100 dark:hover:bg-neutral-800/60 
                      transition-all duration-300 hover:shadow-sm dark:hover:shadow-orange-600/10
                      border border-transparent hover:border-neutral-200 dark:hover:border-neutral-700
                    "
                  >
                    <div className="flex items-center gap-4">
                      <div className={`
                        flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-md
                        ${realRank === 1 ? 'bg-gradient-to-br from-yellow-500 to-orange-600' : 
                          realRank === 2 ? 'bg-gradient-to-br from-neutral-400 to-neutral-600' : 
                          realRank === 3 ? 'bg-gradient-to-br from-orange-400 to-amber-600' : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-300'}
                      `}>
                        {emp.nombre.charAt(0)}{emp.nombre.split(' ')[1]?.charAt(0) || ''}
                      </div>
                      
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-neutral-800 dark:text-neutral-100 line-clamp-1">
                          {emp.nombre}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex -space-x-1">
                            {emp.feedback.positivo > 0 && <span className="h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-neutral-950" />}
                            {emp.feedback.negativo > 0 && <span className="h-2 w-2 rounded-full bg-rose-500 ring-1 ring-white dark:ring-neutral-950" />}
                          </div>
                          <span className="text-[10px] text-neutral-400 font-medium">Rank #{realRank}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-neutral-800 dark:text-neutral-100 flex items-center justify-end gap-1">
                        {emp.promedio} <Star size={12} className="fill-orange-500 dark:fill-orange-400 text-orange-500 dark:text-orange-400" />
                      </div>
                      <div className="text-[10px] font-bold text-neutral-500 dark:text-neutral-300 bg-neutral-200 dark:bg-neutral-800/70 px-2 py-0.5 rounded-md inline-block">
                        {Math.round(emp.score)} PTS
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}