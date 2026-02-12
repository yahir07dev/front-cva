'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { AlertCircle } from 'lucide-react'
import { usePerformance } from '@/src/hooks/usePerformance'
import { ActividadConRelaciones } from '@/src/types/performance'
import { useSession } from '@/src/hooks/useSession'

import ActividadesHeader from './ActividadesHeader'
import CardActividad from './CardActividad'
import ModalEvaluacion from '../shared/ModalEvaluacion'
import ModalConfirmacion from '../shared/ModalConfirmacion'

export default function ActividadesClient({ initialData }: { initialData: ActividadConRelaciones[] }) {
  const supabase = createClient()
  const { session } = useSession() as any 
  
  const [isReady, setIsReady] = useState(false)

  const { 
    actividades, 
    stats, 
    loading, 
    canManage, 
    filtro, 
    setFiltro, 
    recargar 
  } = usePerformance(initialData)

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedActividad, setSelectedActividad] = useState<ActividadConRelaciones | null>(null)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [accionPendiente, setAccionPendiente] = useState<{ id: number, nuevoEstado: string } | null>(null)
  const [idParaEliminar, setIdParaEliminar] = useState<number | null>(null)

  useEffect(() => {
    if (session?.user) {
      setIsReady(true)
    }
  }, [session])

  const handleStatusChange = async (id: number, nuevoEstado: string) => {
    const actividadActual = actividades.find(a => a.id === id);
    const isAssignedToMe = actividadActual?.asignacion_actividades?.some(
      (asig: any) => {
         const emp = asig.empleados || asig.empleado;
         return emp?.usuario_id === session?.user?.id;
      }
    );

    if (canManage && !isAssignedToMe && nuevoEstado !== 'completada') {
      console.warn("Acción denegada");
      return 
    }

    if (nuevoEstado === 'completada' || nuevoEstado === 'revision') {
      setAccionPendiente({ id, nuevoEstado })
      setConfirmModalOpen(true)
      return
    }
    await actualizarEstadoEnBD(id, nuevoEstado)
  }

  const confirmarAccion = async () => {
    if (accionPendiente) {
      await actualizarEstadoEnBD(accionPendiente.id, accionPendiente.nuevoEstado)
      setAccionPendiente(null)
      setConfirmModalOpen(false)
    }
  }

  const handleDelete = (id: number) => {
    setIdParaEliminar(id)
  }

  const confirmarEliminacion = async () => {
    if (idParaEliminar) {
      const { error } = await supabase.from('actividades').delete().eq('id', idParaEliminar)
      if (error) alert('Error al eliminar: ' + error.message)
      else recargar()
      setIdParaEliminar(null)
    }
  }

  const actualizarEstadoEnBD = async (id: number, estado: string) => {
    try {
      const updateData: any = { estado: estado }
      if (estado === 'completada') {
        updateData.fecha_completada = new Date().toISOString()
      }
      
      const { error } = await supabase.from('actividades').update(updateData).eq('id', id)
      if (error) throw error
      await recargar() 
    } catch (error: any) {
      console.error("Error:", error.message)
      alert('Error: ' + error.message)
    }
  }

  const handleGuardarEvaluacion = async (rating: number, nota: string) => {
    if (!selectedActividad || !session?.user?.id) return
    const { error } = await supabase.from('actividades').update({
        calificacion: rating,
        observaciones_evaluacion: nota.trim() || null,
        fecha_evaluada: new Date().toISOString(),
        evaluado_por_id: session.user.id 
      }).eq('id', selectedActividad.id)

    if (error) alert('Error: ' + error.message)
    else {
      setModalOpen(false)
      recargar()
    }
  }

  const openEvaluacionModal = (actividad: ActividadConRelaciones) => {
    setSelectedActividad(actividad)
    setModalOpen(true)
  }

  // --- CORRECCIÓN: El loader debe estar antes del render final, pero después de los hooks ---
  if ((loading && actividades.length === 0) || !isReady) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500/30 border-t-orange-500" />
      </div>
    )
  }

  const getModalTexts = () => {
      if (accionPendiente?.nuevoEstado === 'revision') {
          return {
              title: "¿Solicitar Revisión?",
              desc: "Se notificará a tu supervisor que has terminado. La tarea quedará bloqueada hasta que sea aprobada.",
              variant: "info" as const 
          }
      }
      if (accionPendiente?.nuevoEstado === 'completada') {
           return {
              title: canManage ? "¿Aprobar Tarea?" : "¿Tarea Finalizada?", 
              desc: canManage ? "Al aprobar, confirmas que el trabajo cumple con los requisitos." : "Estás a punto de marcar esta tarea como completada.",
              variant: "success" as const
          }
      }
      return { title: "Confirmar", desc: "¿Estás seguro?", variant: "info" as const }
  }

  const modalContent = getModalTexts()

  return (
    /* h-full y h-[calc...] fuerzan el límite de altura para que el scroll se active */
    <div className="flex flex-col h-[calc(100vh-140px)] overflow-hidden">
      
      {/* Header Fijo */}
      <div className="flex-none mb-6">
        <ActividadesHeader 
          stats={stats} 
          filtro={filtro} 
          setFiltro={setFiltro} 
          canCreate={canManage} 
        />
      </div>

      {/* ÁREA DE SCROLL: Aquí es donde aparece la barrita únicamente para las cards */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-10
                      scrollbar-thin 
                      scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-800 
                      scrollbar-track-transparent">
        
        {actividades.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl bg-white border border-dashed border-gray-20 dark:bg-neutral-950">
            <AlertCircle className="h-10 w-10 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No se encontraron tareas</h3>
            <p className="text-sm text-gray-500">Prueba con otro filtro o crea una nueva.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {actividades.map((act) => (
              <CardActividad 
                key={act.id} 
                actividad={act} 
                canManage={canManage} 
                onStatusChange={handleStatusChange} 
                onDelete={handleDelete} 
                onEvaluar={openEvaluacionModal} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Modales */}
      <ModalEvaluacion 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleGuardarEvaluacion} 
        actividadTitulo={selectedActividad?.titulo || ''} 
        initialRating={selectedActividad?.calificacion || 5} 
        initialNota={selectedActividad?.observaciones_evaluacion || ''} 
      />

      <ModalConfirmacion
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={confirmarAccion}
        titulo={modalContent.title}
        descripcion={modalContent.desc}
        variant={modalContent.variant}
      />

      <ModalConfirmacion
        isOpen={!!idParaEliminar}
        onClose={() => setIdParaEliminar(null)}
        onConfirm={confirmarEliminacion}
        titulo="¿Eliminar Tarea?"
        descripcion="Esta acción borrará la actividad y todas sus asignaciones permanentemente."
        variant="danger"
      />
    </div>
  )
}