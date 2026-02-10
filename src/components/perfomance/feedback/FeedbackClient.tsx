'use client'

import { ArrowLeft, MoreVertical, MessageSquare, ListTodo, CheckCircle2, TrendingUp, User } from 'lucide-react'
import { useFeedback } from '@/src/hooks/useFeedback'
import StatCard from '@/src/components/shared/StatCard' // Asegúrate de que esta ruta sea correcta
import ListaEmpleados from './ListaEmpleados'
import MensajeItem from './MensajeItem'
import ChatInput from './ChatInput'
import { TipoComentario } from '@/src/types/performance'

interface FeedbackClientProps {
  initialUser: any
  initialEmpleados: any[]
}

export default function FeedbackClient({ initialUser, initialEmpleados }: FeedbackClientProps) {
  
  // 1. Extraemos TODO del hook. 
  // El hook ya maneja el estado del formulario, la selección, el scroll y el envío.
  const { 
    loading,         // Carga general (fetching)
    canCreate, 
    selectedEmp, 
    setSelectedEmp,
    empleados,       // Lista completa
    comentarios,     // Ya vienen filtrados por el hook si hay un empleado seleccionado
    searchTerm,
    setSearchTerm,
    form,
    setForm,
    handleSend,
    stats,
    scrollRef
  } = useFeedback(initialUser, initialEmpleados)

  // 2. Filtramos visualmente la lista de empleados (Buscador izquierda)
  // El hook nos da todos, aquí aplicamos el filtro del input de búsqueda.
  const empleadosListados = empleados.filter(e => 
    `${e.nombre} ${e.apellidos}`.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-theme(spacing.32))] flex flex-col overflow-hidden bg-gray-50 dark:bg-[#1a1d29] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800">
      <div className="flex-1 flex overflow-hidden">
        
        {/* COLUMNA IZQUIERDA: LISTA (Solo visible para Admin/Supervisor) */}
        {canCreate && (
          <div className={`${selectedEmp ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-gray-800`}>
            <ListaEmpleados 
              empleados={empleados} 
              selectedId={selectedEmp?.id} 
              onSelect={setSelectedEmp}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
        )}

        {/* COLUMNA DERECHA: CHAT */}
        <div className={`
          flex-1 flex flex-col h-full bg-gray-50 dark:bg-[#0f1117] relative min-w-0
          ${!canCreate ? 'flex' : (selectedEmp ? 'flex' : 'hidden md:flex')}
        `}>
          {selectedEmp ? (
            <>
              {/* Header del Chat */}
              <div className="flex-none h-20 flex items-center justify-between px-6 bg-white dark:bg-[#1a1d29] shadow-sm z-30 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-4">
                  {/* Botón volver (solo móvil admin) */}
                  {canCreate && (
                    <button onClick={() => setSelectedEmp(null)} className="md:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-full">
                      <ArrowLeft size={24} />
                    </button>
                  )}
                  
                  {/* Avatar */}
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-bold shadow-md">
                    {selectedEmp.nombre?.[0]}{selectedEmp.apellidos?.[0]}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white leading-tight text-lg">
                      {selectedEmp.nombre} {selectedEmp.apellidos}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Historial de Feedback</p>
                    </div>
                  </div>
                </div>
                
                <button className="p-2 text-gray-400 hover:text-gray-900 dark:hover:text-white">
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="flex-none p-4 z-20 bg-gray-50 dark:bg-[#0f1117]">
                <div className="grid grid-cols-3 gap-3">
                  <StatCard icon={ListTodo} label="Total" value={stats.total} gradient="from-blue-500 to-blue-600" bgGradient="from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-900/10" />
                  <StatCard icon={CheckCircle2} label="Positivos" value={stats.positivos} gradient="from-emerald-500 to-emerald-600" bgGradient="from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10" />
                  <StatCard icon={TrendingUp} label="Mejora" value={stats.mejora} gradient="from-amber-500 to-amber-600" bgGradient="from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10" />
                </div>
              </div>

              {/* Área de Mensajes */}
              <div className="flex-1 overflow-y-auto px-4 pb-4 md:px-6 scrollbar-thin min-h-0 bg-gray-50 dark:bg-[#0f1117]" ref={scrollRef}>
                {loading && comentarios.length === 0 ? (
                   <div className="flex h-full items-center justify-center">
                     <div className="h-8 w-8 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                   </div>
                ) : (
                  <div className="space-y-4 pt-4">
                    {comentarios.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 opacity-40">
                        <MessageSquare size={48} className="mb-2 text-gray-400" />
                        <p className="text-sm text-gray-500">Historial limpio</p>
                      </div>
                    ) : (
                      comentarios.map((msg) => <MensajeItem key={msg.id} mensaje={msg} />)
                    )}
                  </div>
                )}
              </div>

              {/* Input Area */}
              {canCreate ? (
                <ChatInput 
                  form={form} 
                  setForm={setForm} 
                  onSend={handleSend} 
                  loading={false} // El hook maneja el async, por ahora lo dejamos simple
                />
              ) : (
                <div className="flex-none p-3 text-center text-xs text-gray-400 bg-gray-50 dark:bg-[#1a1d29] border-t border-gray-100 dark:border-gray-800 z-30 pb-6 md:pb-3 italic">
                  Solo lectura
                </div>
              )}
            </>
          ) : (
            // Estado vacío (Solo para Admin)
            <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50/50 dark:bg-[#15171e]">
              <div className="h-24 w-24 bg-white dark:bg-[#1a1d29] rounded-full flex items-center justify-center mb-6 shadow-sm">
                <User size={48} className="text-gray-300 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Selecciona un empleado</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-xs">
                Para ver el historial de feedback.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}