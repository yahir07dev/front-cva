'use client'

import { useState } from 'react'
import { CheckCircle2, MessageSquare, ArrowLeft, MoreVertical, ListTodo, TrendingUp, User } from 'lucide-react'
import { useFeedback } from '@/src/hooks/useFeedback'
import StatCard from '@/src/components/shared/StatCard'
import ListaEmpleados from './ListaEmpleados'
import MensajeItem from './MensajeItem'
import ChatInput from './ChatInput'
import ModalConfirmacion from '@/src/components/shared/ModalConfirmacion'

interface FeedbackClientProps {
  initialUser: any
  initialEmpleados: any[]
}

export default function FeedbackClient({ initialUser, initialEmpleados }: FeedbackClientProps) {

  // Hook principal de lógica
  const {
    loading,
    canCreate,
    selectedEmp,
    setSelectedEmp,
    empleados,
    comentarios,
    searchTerm,
    setSearchTerm,
    form,
    setForm,
    handleSend,
    handleDelete, // Función que llama al servicio (delete real)
    currentUserId,
    stats,
    scrollRef
  } = useFeedback(initialUser, initialEmpleados)

  // Estado local para manejar el modal de confirmación
  const [mensajeIdParaBorrar, setMensajeIdParaBorrar] = useState<number | null>(null)

  // Función wrapper para confirmar el borrado
  const confirmarBorrado = async () => {
    if (mensajeIdParaBorrar) {
       await handleDelete(mensajeIdParaBorrar)
       setMensajeIdParaBorrar(null)
    }
  }

  return (
    <div className="
      h-full flex flex-col overflow-hidden 
      bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100
    ">
      <div className="flex-1 flex overflow-hidden">

        {/* COLUMNA IZQUIERDA: LISTA EMPLEADOS */}
        {canCreate && (
          <div className={`${selectedEmp ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 shrink-0 border-r border-neutral-200 dark:border-neutral-800/40`}>
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
          flex-1 flex flex-col h-full min-w-0 relative bg-gray-50 dark:bg-neutral-950
          ${!canCreate ? 'flex' : (selectedEmp ? 'flex' : 'hidden md:flex')}
        `}>
          {selectedEmp ? (
            <>
              {/* Header del Chat */}
              <div className="
                flex-none h-20 flex items-center justify-between px-6 
                bg-white dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800/40
                shadow-sm dark:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.3)]
              ">
                <div className="flex items-center gap-4">
                  {canCreate && (
                    <button
                      onClick={() => setSelectedEmp(null)}
                      className="md:hidden p-2 -ml-2 text-neutral-500 dark:text-neutral-400 hover:bg-gray-100 dark:hover:text-neutral-800 rounded-full transition-colors"
                    >
                      <ArrowLeft size={24} />
                    </button>
                  )}

                  {/* Avatar Header */}
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold shadow-md shrink-0 overflow-hidden">
                    {selectedEmp.foto_perfil_url ? (
                        <img 
                            src={selectedEmp.foto_perfil_url} 
                            alt={selectedEmp.nombre} 
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                        />
                    ) : (
                        <span>{selectedEmp.nombre?.[0]}{selectedEmp.apellidos?.[0]}</span>
                    )}
                  </div>
                  
                  <div className="min-w-0">
                    <h3 className="font-bold text-neutral-900 dark:text-neutral-100 leading-tight text-lg truncate">
                      {selectedEmp.nombre} {selectedEmp.apellidos}
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-neutral-500 dark:text-neutral-400">Historial de Feedback</p>
                    </div>
                  </div>
                </div>

                <button className="p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200 rounded-full transition-colors">
                  <MoreVertical size={20} />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="flex-none p-4 bg-white dark:bg-neutral-950 border-b border-neutral-100 dark:border-neutral-800/40">
                <div className="grid grid-cols-3 gap-4">
                  <StatCard
                    icon={ListTodo}
                    label="Total"
                    value={stats.total}
                    accentColor="blue"
                  />
                  <StatCard
                    icon={CheckCircle2}
                    label="Positivos"
                    value={stats.positivos}
                    accentColor="green"
                  />
                  <StatCard
                    icon={TrendingUp}
                    label="Mejora"
                    value={stats.mejora}
                    accentColor="orange"
                  />
                </div>
              </div>

              {/* Área de Mensajes con scroll */}
              <div
                className="
                  flex-1 overflow-y-auto px-4 pb-6 md:px-6 
                  scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent
                  hover:scrollbar-thumb-neutral-400 dark:hover:scrollbar-thumb-neutral-600
                  scrollbar-thumb-rounded-full scrollbar-track-rounded-full
                "
                ref={scrollRef}
              >
                {loading && comentarios.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500/30 border-t-orange-500" />
                  </div>
                ) : (
                  <div className="space-y-4 pt-4">
                    {comentarios.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-40 opacity-60">
                        <MessageSquare size={48} className="mb-3 text-neutral-300 dark:text-neutral-500" />
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">Historial limpio</p>
                      </div>
                    ) : (
                      comentarios.map((msg) => (
                        <MensajeItem 
                            key={msg.id} 
                            mensaje={msg} 
                            currentUserId={currentUserId}
                            // En lugar de llamar directo a handleDelete, abrimos el modal
                            onDelete={(id) => setMensajeIdParaBorrar(id)} 
                        />
                      ))
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
                  loading={loading}
                />
              ) : (
                <div className="
                  flex-none p-4 text-center text-sm text-neutral-400 
                  bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-neutral-800/40
                  italic
                ">
                  Solo lectura
                </div>
              )}
            </>
          ) : (
            // Estado vacío (Solo para Admin)
            <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8 bg-gray-50 dark:bg-neutral-950">
              <div className="h-24 w-24 bg-white dark:bg-neutral-900/70 rounded-full flex items-center justify-center mb-6 shadow-sm border border-neutral-200 dark:border-transparent">
                <User size={48} className="text-neutral-300 dark:text-neutral-600" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">Selecciona un empleado</h3>
              <p className="text-neutral-500 dark:text-neutral-400 max-w-xs">
                Para ver el historial de feedback.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación Global */}
      <ModalConfirmacion
        isOpen={!!mensajeIdParaBorrar}
        onClose={() => setMensajeIdParaBorrar(null)}
        onConfirm={confirmarBorrado}
        titulo="¿Eliminar comentario?"
        descripcion="Estás a punto de eliminar este mensaje permanentemente. Esta acción no se puede deshacer."
        variant="danger"
        textConfirmar="Sí, eliminar"
        loading={loading} // Opcional, si quieres mostrar spinner mientras borra
      />
    </div>
  )
}