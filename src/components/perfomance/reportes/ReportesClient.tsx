'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Download, TrendingUp, Trophy, Users, MessageSquare, Zap, Star, Search, UserCheck } from 'lucide-react'
import { useReportesData } from '@/src/hooks/useReportesData' // Usamos el hook de procesamiento
import StatCard from '@/src/components/shared/StatCard' // Verifica que StatCard esté aquí

interface ReportesClientProps {
  actividades: any[]
  feedback: any[]
  currentUserId?: string | number
  isAdmin?: boolean
}

export default function ReportesClient({ actividades, feedback, currentUserId, isAdmin }: ReportesClientProps) {
  
  // Usamos el hook de procesamiento con los datos que nos pasa page.tsx
  const { 
    topEmpleados, 
    datosGrafica, 
    filtroNombre, 
    setFiltroNombre, 
    filtroTipo, 
    setFiltroTipo, 
    exportarPDF 
  } = useReportesData(actividades, feedback)

  // --- LÓGICA DE VISUALIZACIÓN ---
  
  // 1. Filtro de visibilidad (Admin ve todo, Empleado solo a sí mismo)
  const listaVisible = useMemo(() => {
    // Convertimos currentUserId a número si viene como string, para comparar con emp.id (que suele ser number)
    const myId = Number(currentUserId)
    
    if (isAdmin) return topEmpleados
    // Si no es admin, filtramos
    return topEmpleados.filter(emp => emp.id === myId)
  }, [topEmpleados, isAdmin, currentUserId])

  // 2. KPIs Dinámicos
  const stats = useMemo(() => {
    const totalGlobal = topEmpleados.length
    
    // Calculamos promedio global seguro
    const promedioGlobal = totalGlobal > 0 
      ? (topEmpleados.reduce((acc, curr) => acc + parseFloat(curr.promedio || '0'), 0) / totalGlobal).toFixed(1)
      : '0.0'

    // Datos Personales (Si soy empleado)
    const myId = Number(currentUserId)
    const misDatos = topEmpleados.find(e => e.id === myId)

    if (!isAdmin && misDatos) {
        // Encontramos mi posición real en el ranking global
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

    // Datos Admin (Vista Global)
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
    <div className="h-full flex flex-col overflow-y-auto bg-gray-50 dark:bg-[#1a1d29] px-4 py-6 sm:px-8 space-y-8 scrollbar-thin">
      
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isAdmin ? 'Analítica de Rendimiento' : 'Mi Reporte de Desempeño'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
            {isAdmin ? 'Panel de control de métricas y talento humano' : 'Resumen de tus objetivos y feedback recibido'}
          </p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3">
            <button 
              onClick={exportarPDF}
              className="group flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-2xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-xl shadow-gray-900/10 dark:shadow-white/10"
            >
              <Download size={18} className="transition-transform group-hover:-translate-y-0.5" />
              <span>Reporte PDF</span>
            </button>
          </div>
        )}
      </div>

      {/* KPIs Dinámicos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={TrendingUp} label={stats.label1} value={stats.val1} 
          gradient="from-orange-500 to-orange-600"
          bgGradient="from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-900/10"
        />
        <StatCard 
          icon={isAdmin ? Users : Users} label={stats.label2} value={stats.val2} 
          gradient="from-blue-500 to-blue-600"
          bgGradient="from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10"
        />
        <StatCard 
          icon={MessageSquare} label={stats.label3} value={stats.val3} 
          gradient="from-purple-500 to-purple-600"
          bgGradient="from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-900/10"
        />
        <StatCard 
          icon={isAdmin ? Trophy : UserCheck} label={stats.label4} value={stats.val4} 
          gradient="from-yellow-500 to-yellow-600"
          bgGradient="from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-900/10"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* GRÁFICA (Todos ven la tendencia global para compararse) */}
        <div className="xl:col-span-2 flex flex-col bg-white dark:bg-[#15171e] rounded-[32px] p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Tendencia Global</h3>
              <p className="text-xs text-gray-400 font-medium mt-1">
                 {isAdmin ? 'Evolución del equipo' : 'Promedio general de la empresa'}
              </p>
            </div>
            
            {isAdmin && (
              <select 
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border-none text-xs font-bold text-gray-600 dark:text-gray-300 outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer"
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
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 500}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11, fontWeight: 500}} domain={[0, 6]} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff' }} />
                <Area type="monotone" dataKey="promedio" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorPromedio)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RANKING O TARJETA PERSONAL */}
        <div className="bg-white dark:bg-[#15171e] rounded-[32px] p-6 shadow-sm border border-gray-100 dark:border-gray-800/50 flex flex-col h-[500px] xl:h-auto relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white dark:from-[#15171e] to-transparent pointer-events-none z-20" />
          
          <div className="mb-6 z-10">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="text-yellow-500 fill-yellow-500" size={20} /> 
              {isAdmin ? 'Leaderboard' : 'Mi Posición'}
            </h3>
            
            {isAdmin && (
              <div className="mt-4 relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-orange-500" size={16} />
                <input 
                  type="text" 
                  placeholder="Filtrar..." 
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border-none text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20 transition-all placeholder:text-gray-400"
                />
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-none pb-20 space-y-3 z-10">
            {listaVisible.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm">
                <p>No hay datos disponibles</p>
              </div>
            ) : (
              listaVisible.map((emp, index) => {
                // Si es admin usamos el index real de la lista visible, si es empleado calculamos su rank real global
                const realRank = isAdmin ? index + 1 : topEmpleados.findIndex(e => e.id === emp.id) + 1
                
                return (
                  <div 
                    key={emp.id} 
                    className="group relative flex items-center justify-between p-3 rounded-2xl bg-gray-50 dark:bg-[#1a1d29] border border-transparent hover:border-orange-500/20 hover:shadow-lg hover:shadow-orange-500/5 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`
                          flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-md
                          ${realRank === 1 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' : 
                            realRank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : 
                            realRank === 3 ? 'bg-gradient-to-br from-orange-300 to-red-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'}
                        `}>
                            {emp.nombre.charAt(0)}{emp.nombre.split(' ')[1]?.charAt(0) || ''}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                          {emp.nombre}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                           {/* Dots de Feedback */}
                           <div className="flex -space-x-1">
                            {emp.feedback.positivo > 0 && <span className="h-2 w-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-[#1a1d29]" />}
                            {emp.feedback.negativo > 0 && <span className="h-2 w-2 rounded-full bg-rose-500 ring-1 ring-white dark:ring-[#1a1d29]" />}
                          </div>
                          <span className="text-[10px] text-gray-400 font-medium">Rank #{realRank}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-gray-900 dark:text-white flex items-center justify-end gap-1">
                        {emp.promedio} <Star size={12} className="fill-orange-500 text-orange-500" />
                      </div>
                      <div className="text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded-md inline-block">
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