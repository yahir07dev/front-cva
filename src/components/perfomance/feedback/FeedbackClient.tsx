'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, MessageSquare, ArrowLeft, MoreVertical, ListTodo, TrendingUp, User, ShieldAlert } from 'lucide-react'
import { useFeedback } from '@/src/hooks/useFeedback'
import ListaEmpleados from './ListaEmpleados'
import MensajeItem from './MensajeItem'
import ChatInput from './ChatInput'
import ModalConfirmacion from '@/src/components/shared/ModalConfirmacion'
import Image from 'next/image'

interface FeedbackClientProps {
  initialUser: any
  initialEmpleados: any[]
}

export default function FeedbackClient({ initialUser, initialEmpleados }: FeedbackClientProps) {

  const {
    loading,
    canCreate,
    canManage, // Usamos esto para ocultar el avatar
    userEstado,
    selectedEmp,
    setSelectedEmp,
    empleados,
    comentarios,
    searchTerm,
    setSearchTerm,
    form,
    setForm,
    handleSend,
    handleDelete,
    currentUserId,
    stats,
    scrollRef
  } = useFeedback(initialUser, initialEmpleados)

  const [mensajeIdParaBorrar, setMensajeIdParaBorrar] = useState<number | null>(null)
  
  // EFECTO DE AUTO-SELECCIÓN
  useEffect(() => {
    if (!canManage && !selectedEmp && initialUser) {
      const me = empleados.find(e => e.usuario_id === initialUser.id)
      if (me) setSelectedEmp(me)
    }
  }, [canManage, selectedEmp, empleados, initialUser, setSelectedEmp])

  const isBaja = userEstado === 'baja'

  const confirmarBorrado = async () => {
    if (mensajeIdParaBorrar) {
       await handleDelete(mensajeIdParaBorrar)
       setMensajeIdParaBorrar(null)
    }
  }

  const MiniStatCard = ({ icon: Icon, label, value, color, bg }: any) => (
    <div className="
      min-w-[140px] snap-center flex flex-col items-start justify-center p-3 gap-1.5
      rounded-2xl border border-neutral-100 dark:border-0
      bg-white dark:bg-white/[0.02] shadow-sm transition-all duration-300
      md:min-w-0 md:w-full md:p-5 md:gap-3 md:hover:shadow-md md:hover:-translate-y-1
    ">
      <div className="flex items-center gap-3 w-full">
        <div className={`
          p-1.5 rounded-lg transition-all shrink-0
          md:p-3 md:rounded-xl
          ${bg} ${color}
        `}>
          <Icon strokeWidth={2.5} className="h-4 w-4 md:h-6 md:w-6" />
        </div>
        <span className={`
          text-xl font-black truncate transition-all
          md:text-3xl
          ${color}
        `}>{value}</span>
      </div>
      <p className="
        text-[10px] font-bold text-neutral-400 uppercase tracking-wider whitespace-nowrap
        md:text-sm md:text-neutral-500 md:whitespace-normal
      ">{label}</p>
    </div>
  )

  return (
    <div className="h-full flex flex-col bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 overflow-hidden relative">
      
      {isBaja && (
        <div className="flex-none bg-rose-600 text-white px-3 py-1 flex items-center justify-center gap-2 shadow-md z-30 text-[10px] font-bold uppercase tracking-wide">
          <ShieldAlert size={12} className="shrink-0" />
          <span>Cuenta inactiva</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">

        {/* LISTA DE EMPLEADOS */}
        {canManage && (
          <div className={`${selectedEmp ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 shrink-0 z-20 border-r border-neutral-100 dark:border-neutral-800`}>
            <ListaEmpleados
              empleados={empleados}
              selectedId={selectedEmp?.id}
              onSelect={setSelectedEmp}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          </div>
        )}

        {/* ÁREA DE CHAT */}
        <div className={`
          flex-1 flex flex-col h-full min-w-0 relative bg-neutral-50/50 dark:bg-black/20
          ${!canManage ? 'flex' : (selectedEmp ? 'flex' : 'hidden md:flex')}
          ${isBaja ? 'opacity-80' : ''} 
        `}>
          {selectedEmp ? (
            <>
              {/* Header */}
              <div className="flex-none h-14 px-3 flex items-center justify-between bg-white/90 dark:bg-neutral-950/90 backdrop-blur-xl border-b border-neutral-100 dark:border-0 z-20 md:px-6">
                <div className="flex items-center gap-3 min-w-0">
                  
                  {/* Botón Volver (Solo Managers) */}
                  {canManage && (
                    <button
                      onClick={() => setSelectedEmp(null)}
                      className="md:hidden p-1.5 -ml-1 text-neutral-500 active:bg-neutral-100 rounded-full transition-colors"
                    >
                      <ArrowLeft size={18} />
                    </button>
                  )}

                  {/* 🔴 CAMBIO AQUÍ: El avatar solo se muestra si 'canManage' es true */}
                  {canManage && (
                    <div className="relative h-8 w-8 rounded-full overflow-hidden bg-neutral-200 dark:bg-neutral-800 shrink-0 ring-1 ring-neutral-200 dark:ring-neutral-800">
                      {selectedEmp.foto_perfil_url ? (
                          <Image 
                              src={selectedEmp.foto_perfil_url} 
                              alt={selectedEmp.nombre} 
                              fill
                              className="object-cover"
                          />
                      ) : (
                          <div className="h-full w-full flex items-center justify-center text-[10px] font-bold text-neutral-500">
                              {selectedEmp.nombre?.[0]}
                          </div>
                      )}
                    </div>
                  )}
                  
                  <div className="min-w-0 flex flex-col justify-center">
                    <h3 className="font-bold text-xs text-neutral-900 dark:text-white truncate leading-none mb-0.5 md:text-sm">
                      {selectedEmp.nombre} {selectedEmp.apellidos}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <p className="text-[9px] font-medium text-neutral-400 dark:text-neutral-500 truncate leading-none md:text-xs">
                         {canManage ? 'Historial activo' : 'Mi Historial'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Menú de opciones (Solo Managers) */}
                {canManage && (
                  <button className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors">
                    <MoreVertical size={16} />
                  </button>
                )}
              </div>

              {/* STATS */}
              <div className="flex-none pt-3 pb-2 px-3 bg-neutral-50/50 dark:bg-transparent z-10 md:px-6 md:py-6">
                <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x pb-2 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:pb-0 px-1">
                  <MiniStatCard 
                    icon={ListTodo} 
                    label="Total Feedback" 
                    value={stats.total} 
                    color="text-blue-600 dark:text-blue-400" 
                    bg="bg-blue-100 dark:bg-blue-500/10"
                  />
                  <MiniStatCard 
                    icon={CheckCircle2} 
                    label="Positivos" 
                    value={stats.positivos} 
                    color="text-emerald-600 dark:text-emerald-400" 
                    bg="bg-emerald-100 dark:bg-emerald-500/10"
                  />
                  <MiniStatCard 
                    icon={TrendingUp} 
                    label="A Mejorar" 
                    value={stats.mejora} 
                    color="text-orange-600 dark:text-orange-400" 
                    bg="bg-orange-100 dark:bg-orange-500/10"
                  />
                </div>
              </div>

              {/* LISTA MENSAJES */}
              <div
                className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-4 pb-4 scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-700 md:px-6"
                ref={scrollRef}
              >
                {loading && comentarios.length === 0 ? (
                  <div className="flex h-full items-center justify-center">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-orange-500 border-t-transparent" />
                  </div>
                ) : (
                  <div className="space-y-1 md:space-y-2"> 
                    {comentarios.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-48 opacity-40">
                        <MessageSquare size={28} className="mb-2 text-neutral-400" />
                        <p className="text-[10px] text-neutral-500 uppercase tracking-widest">Sin historial</p>
                      </div>
                    ) : (
                      comentarios.map((msg) => (
                        <MensajeItem 
                            key={msg.id} 
                            mensaje={msg} 
                            currentUserId={currentUserId}
                            onDelete={canManage && !isBaja ? (id) => setMensajeIdParaBorrar(id) : undefined} 
                        />
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* INPUT */}
              {canCreate && !isBaja ? (
                <div className="flex-none z-30 w-full bg-white dark:bg-neutral-950 border-t border-neutral-100 dark:border-0 pb-safe">
                  <ChatInput
                    form={form}
                    setForm={setForm}
                    onSend={handleSend}
                    loading={loading}
                  />
                </div>
              ) : null}
            </>
          ) : (
            /* Estado vacío (Solo Managers) */
            <div className="hidden md:flex flex-col items-center justify-center h-full text-center p-8 text-neutral-400">
              <div className="h-20 w-20 bg-neutral-100 dark:bg-neutral-900 rounded-full flex items-center justify-center mb-4">
                <User size={32} className="opacity-50" />
              </div>
              <p className="text-sm font-medium">Selecciona un miembro del equipo</p>
            </div>
          )}
        </div>
      </div>

      <ModalConfirmacion
        isOpen={!!mensajeIdParaBorrar}
        onClose={() => setMensajeIdParaBorrar(null)}
        onConfirm={confirmarBorrado}
        titulo="¿Borrar feedback?"
        descripcion="Esta acción es irreversible."
        variant="danger"
        textConfirmar="Borrar"
        loading={loading}
      />
    </div>
  )
}