'use client'

import { useMemo } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'
import { Download, TrendingUp, Trophy, Users, Zap, Star, Search, UserCheck, Info, AlertTriangle } from 'lucide-react'
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
    exportarPDF 
  } = useReportesData(actividades)

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
        val1: `${misDatos.promedio || '0.0'} ★`,
        label2: "Promedio Global", 
        val2: `${promedioGlobal} ★`,
        label3: "Ranking Actual",
        val3: `#${myRank}`
      }
    }

    return {
      label1: "Promedio Global",
      val1: `${promedioGlobal} ★`,
      label2: "Total Evaluados",
      val2: totalGlobal,
      label3: "Mejor Desempeño",
      val4: topEmpleados[0]?.nombre?.split(' ')[0] || 'N/A'
    }
  }, [topEmpleados, isAdmin, currentUserId])

  return (
    <div className="h-full flex flex-col overflow-y-auto bg-background text-foreground px-4 py-6 sm:px-8 space-y-8 scrollbar-thin">
      
      {/* Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between animate-in fade-in slide-in-from-top-4 duration-500">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isAdmin ? 'Analítica de Rendimiento' : 'Mi Reporte de Desempeño'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium italic">
            Métricas de cumplimiento: Estrellas obtenidas y efectividad de tareas.
          </p>
        </div>

        {isAdmin && (
          <button 
            onClick={exportarPDF}
            className="group flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-600/20 hover:scale-[1.02] transition-all"
          >
            <Download size={18} className="transition-transform group-hover:-translate-y-0.5" />
            <span>Exportar Análisis PDF</span>
          </button>
        )}
      </div>

      {/* KPI Section - Ahora con 3 columnas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in zoom-in-95 duration-700">
        <StatCard icon={TrendingUp} label={stats.label1} value={stats.val1} accentColor="orange" />
        <StatCard icon={Users} label={stats.label2} value={stats.val2} accentColor="blue" />
        <StatCard icon={isAdmin ? Trophy : UserCheck} label={isAdmin ? "Mejor Desempeño" : stats.label3} value={isAdmin ? stats.val4 : stats.val3} accentColor="orange" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* GRÁFICA DE TENDENCIA */}
        <div className="xl:col-span-2 flex flex-col bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-card relative overflow-hidden">
          <div className="mb-8 z-10">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <TrendingUp size={20} className="text-orange-500" /> 
              Tendencia de Calidad
            </h3>
            <p className="text-xs text-muted-foreground mt-1">Evolución mensual del promedio de estrellas</p>
          </div>

          <div className="h-[320px] w-full z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={datosGrafica}>
                <defs>
                  <linearGradient id="colorPromedio" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 11}} domain={[0, 5.5]} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '12px', fontSize: '12px', color: '#fff' }} 
                />
                <Area type="monotone" dataKey="promedio" stroke="#f97316" strokeWidth={4} fillOpacity={1} fill="url(#colorPromedio)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* RANKING EXCLUSIVO POR EVALUACIONES */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-card flex flex-col h-[520px] xl:h-auto relative overflow-hidden">
          <div className="mb-6 z-10">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Zap className="text-orange-500 fill-orange-500" size={20} /> 
                {isAdmin ? 'Top Desempeño' : 'Mi Posición'}
              </h3>
              <div className="group relative">
                <Info size={16} className="text-muted-foreground cursor-help" />
                <div className="absolute right-0 bottom-full mb-2 w-56 p-2 bg-neutral-900 text-[10px] text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-none shadow-xl border border-white/10 text-center">
                  Score = (Promedio ★ x 10) - Penalizaciones por Incumplimiento.
                </div>
              </div>
            </div>
            
            {isAdmin && (
              <div className="mt-4 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar colaborador..." 
                  value={filtroNombre}
                  onChange={(e) => setFiltroNombre(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-muted/30 border border-border text-sm outline-none focus:ring-2 focus:ring-orange-500/40 transition-all"
                />
              </div>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-3 z-10 pb-4 scrollbar-thin">
            {listaVisible.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-muted-foreground text-sm italic text-center">
                <p>Sin datos que mostrar</p>
              </div>
            ) : (
              listaVisible.map((emp, index) => {
                const rank = isAdmin ? index + 1 : topEmpleados.findIndex(e => e.id === emp.id) + 1;
                const lowScore = (emp.score || 0) < 20;
                
                return (
                  <div key={emp.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-border transition-all group">
                    <div className="flex items-center gap-4">
                      <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white shadow-md overflow-hidden
                        ${rank === 1 ? 'bg-orange-500' : rank === 2 ? 'bg-blue-500' : rank === 3 ? 'bg-amber-500' : 'bg-neutral-600'}`}>
                        {emp.foto_perfil_url ? (
                          <img src={emp.foto_perfil_url} alt="" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                        ) : (
                          <span>{emp.nombre?.charAt(0) || '?'}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold truncate group-hover:text-orange-500 transition-colors">{emp.nombre}</p>
                          {lowScore && (
                            <span title="Rendimiento bajo el promedio">
                              <AlertTriangle size={12} className="text-rose-500 animate-pulse" />
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Ranking #{rank}</span>
                      </div>
                    </div>

                    <div className="text-right flex flex-col items-end gap-1">
                      <div className="text-sm font-black flex items-center justify-end gap-1 text-orange-500">
                        {emp.promedio || '0.0'} <Star size={12} className="fill-orange-500" />
                      </div>
                      
                      <div className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${lowScore ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-background border-border'} inline-block`}>
                        {Math.round(emp.score || 0)} PTS
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