// src/components/perfomance/reportes/ReportesClient.tsx
'use client'

import { useMemo, useState } from 'react'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts'
import { 
  Download, TrendingUp, Trophy, Users, UserCheck, ShieldAlert, User, Building 
} from 'lucide-react'

// Hooks y Componentes
import { useReportesData } from '@/src/hooks/perfomance/useReportesData'
import StatsCarousel from './StatsCarousel' 
import RankingList from './RankingList'     
import MiRendimientoDashboard from './MiRendimientoDashboard' 

interface ReportesClientProps {
  topEmpleados: any[] 
  datosGrafica: any[] 
  currentUserId?: string
  isAdmin?: boolean
}

export default function ReportesClient({ 
  topEmpleados, 
  datosGrafica, 
  currentUserId, 
  isAdmin 
}: ReportesClientProps) {
  
  const [vistaAdmin, setVistaAdmin] = useState<'empresa' | 'personal'>(
    isAdmin ? 'empresa' : 'personal'
  )
  
  const { 
    listaFiltrada, 
    filtroNombre, 
    setFiltroNombre, 
    exportarPDF 
  } = useReportesData(topEmpleados)

  const listaVisible = useMemo(() => {
    if (isAdmin) return listaFiltrada 
    return listaFiltrada.filter(emp => emp.id === currentUserId)
  }, [listaFiltrada, isAdmin, currentUserId])

  const misDatos = useMemo(() => {
    return topEmpleados.find(e => e.id === currentUserId)
  }, [topEmpleados, currentUserId])

  const statsList = useMemo(() => {
    const totalGlobal = topEmpleados.length

    const promedioScore = totalGlobal > 0 
      ? Math.round(
          topEmpleados.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalGlobal
        )
      : 0

    return [
      { icon: Users, label: "Score Promedio", value: `${promedioScore} PTS`, accentColor: 'orange' },
      { icon: UserCheck, label: "Total Evaluados", value: totalGlobal, accentColor: 'blue' },
      { icon: Trophy, label: "Mejor Score", value: topEmpleados[0]?.nombre?.split(' ')[0] || 'N/A', accentColor: 'green' }
    ]
  }, [topEmpleados])

  return (
    <div className="h-full flex flex-col bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
      
      {/* HEADER */}
      <div className="flex-none px-4 py-4 sm:px-8 bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800 z-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-neutral-900 dark:text-white tracking-tight">
              {vistaAdmin === 'empresa' ? 'Analítica de Rendimiento' : 'Mi Panel de Rendimiento'}
            </h1>
            <p className="text-xs text-neutral-500 font-medium hidden md:block">
              {vistaAdmin === 'empresa' 
                ? 'Métricas basadas en puntos por tareas y feedback.' 
                : 'Resumen personal de tu efectividad operativa.'}
            </p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            
            {isAdmin && (
              <div className="flex bg-neutral-100 dark:bg-neutral-900 p-1 rounded-xl">
                <button
                  onClick={() => setVistaAdmin('empresa')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    vistaAdmin === 'empresa' 
                      ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' 
                      : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                  }`}
                >
                  <Building size={14} /> <span className="hidden sm:inline">Empresa</span>
                </button>
                <button
                  onClick={() => setVistaAdmin('personal')}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                    vistaAdmin === 'personal' 
                      ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm' 
                      : 'text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
                  }`}
                >
                  <User size={14} /> <span className="hidden sm:inline">Mi Perfil</span>
                </button>
              </div>
            )}

            {isAdmin && vistaAdmin === 'empresa' && (
              <button 
                onClick={exportarPDF}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-neutral-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs shadow-lg active:scale-95 transition-all"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Exportar</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 md:space-y-8 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
        
        {vistaAdmin === 'empresa' ? (
          <>
            <div className="animate-in fade-in slide-in-from-top-4 duration-500">
              <StatsCarousel stats={statsList as any} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-20">
              
              {/* GRÁFICA */}
              <div className="xl:col-span-2 flex flex-col bg-white dark:bg-neutral-900 md:border border-neutral-200 dark:border-neutral-800 rounded-3xl p-5 sm:p-8 shadow-sm h-[350px] md:h-[450px]">
                
                <div className="mb-6">
                  <h3 className="text-lg font-bold flex items-center gap-2 text-neutral-900 dark:text-white">
                    <div className="p-1.5 bg-blue-100 dark:bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400">
                      <TrendingUp size={18} /> 
                    </div>
                    Tendencia de Score Global
                  </h3>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mt-1 ml-1">
                    Efectividad por Mes
                  </p>
                </div>

                {/* ✅ FIX APLICADO AQUÍ */}
                <div className="w-full h-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={datosGrafica}>
                      <defs>
                        <linearGradient id="colorPromedio" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f97316" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#525252" opacity={0.1} />

                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a3a3a3', fontSize: 10 }} 
                        dy={10} 
                      />

                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#a3a3a3', fontSize: 10 }} 
                        width={30} 
                      />

                      <RechartsTooltip 
                        contentStyle={{ 
                          backgroundColor: '#171717', 
                          borderColor: '#262626', 
                          borderRadius: '8px', 
                          fontSize: '12px', 
                          color: '#fff', 
                          padding: '8px' 
                        }} 
                      />

                      <Area 
                        type="monotone" 
                        dataKey="scoreMensual" 
                        stroke="#f97316" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorPromedio)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* RANKING */}
              <div className="h-[450px] xl:h-auto">
                <RankingList 
                  empleados={listaVisible} 
                  isAdmin={true} 
                  filtroNombre={filtroNombre} 
                  setFiltroNombre={setFiltroNombre} 
                />
              </div>
            </div>
          </>
        ) : (
          <div className="max-w-4xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {misDatos ? (
              <MiRendimientoDashboard 
                misDatos={misDatos} 
                totalEmpleados={topEmpleados.length} 
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in zoom-in-95 duration-500 bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-10">
                <ShieldAlert className="h-16 w-16 text-neutral-300 dark:text-neutral-700 mb-6" />
                <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                  Aún no hay datos de tu rendimiento
                </h2>
                <p className="text-neutral-500 font-medium max-w-sm">
                  El sistema necesita que completes tareas o recibas feedback para calcular tu índice de efectividad personal.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}