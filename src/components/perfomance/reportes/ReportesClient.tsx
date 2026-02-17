'use client'

import { useMemo } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts'
import { Download, TrendingUp, Trophy, Users, UserCheck } from 'lucide-react'
import { useReportesData } from '@/src/hooks/useReportesData'
import StatsCarousel from './StatsCarousel' 
import RankingList from './RankingList'     

interface ReportesClientProps {
  actividades: any[]
  // Eliminamos feedback de la interfaz ya que no se usará más
  currentUserId?: string | number
  isAdmin?: boolean
}

export default function ReportesClient({ actividades, currentUserId, isAdmin }: ReportesClientProps) {
  
  // Llamamos al hook solo con actividades, tal como lo definimos en useReportesData.ts
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
    return topEmpleados.filter(emp => Number(emp.id) === myId)
  }, [topEmpleados, isAdmin, currentUserId])

  const statsList = useMemo(() => {
    const totalGlobal = topEmpleados.length
    const promedioGlobal = totalGlobal > 0 
      ? (topEmpleados.reduce((acc, curr) => acc + parseFloat(curr.promedio || '0'), 0) / totalGlobal).toFixed(1)
      : '0.0'

    const myId = Number(currentUserId)
    const misDatos = topEmpleados.find(e => Number(e.id) === myId)

    // Vista para Empleado Regular
    if (!isAdmin && misDatos) {
      const myRank = topEmpleados.findIndex(e => Number(e.id) === myId) + 1
      return [
        { icon: TrendingUp, label: "Mi Rendimiento", value: `${misDatos.promedio} ★`, accentColor: 'orange' },
        { icon: Users, label: "Promedio Global", value: `${promedioGlobal} ★`, accentColor: 'blue' },
        { icon: Trophy, label: "Ranking Actual", value: `#${myRank}`, accentColor: 'purple' }
      ]
    }

    // Vista para Administrador
    return [
        { icon: Users, label: "Promedio Global", value: `${promedioGlobal} ★`, accentColor: 'orange' },
        { icon: UserCheck, label: "Total Evaluados", value: totalGlobal, accentColor: 'blue' },
        { icon: Trophy, label: "Mejor Desempeño", value: topEmpleados[0]?.nombre?.split(' ')[0] || 'N/A', accentColor: 'green' }
    ]
  }, [topEmpleados, isAdmin, currentUserId]) as any[]

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
      
      {/* 1. Header Fijo */}
      <div className="flex-none px-4 py-4 sm:px-8 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 z-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {isAdmin ? 'Analítica' : 'Mi Reporte'}
            </h1>
            <p className="text-xs text-neutral-500 font-medium hidden md:block">
              Métricas de rendimiento y cumplimiento operativo.
            </p>
          </div>

          {isAdmin && (
            <button 
              onClick={exportarPDF}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs shadow-lg active:scale-95"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Exportar PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Cuerpo Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 md:space-y-8 scrollbar-thin">
        
        {/* KPI Carousel */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
            <StatsCarousel stats={statsList} />
        </div>

        {/* Gráfica y Ranking */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-20">
          
          {/* GRÁFICA */}
          <div className="xl:col-span-2 flex flex-col bg-white dark:bg-neutral-900 md:border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-8 shadow-sm h-[350px] md:h-[450px]">
            <div className="mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                    <TrendingUp size={18} /> 
                </div>
                Tendencia de Calidad
              </h3>
              <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mt-1 ml-1">Histórico Mensual</p>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datosGrafica}>
                  <defs>
                    <linearGradient id="colorPromedio" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#525252" opacity={0.1} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#a3a3a3', fontSize: 10}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#a3a3a3', fontSize: 10}} domain={[0, 5.5]} width={20} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px', fontSize: '12px', color: '#fff', padding: '8px' }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="promedio" 
                    stroke="#f97316" 
                    strokeWidth={3} 
                    fillOpacity={1} 
                    fill="url(#colorPromedio)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RANKING LIST */}
          <div className="h-[450px] xl:h-auto">
            <RankingList 
                empleados={listaVisible} 
                isAdmin={isAdmin || false} 
                filtroNombre={filtroNombre} 
                setFiltroNombre={setFiltroNombre} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}