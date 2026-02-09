'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle } from 'lucide-react'
import { usePerformance } from '@/hooks/usePerformance'
import { ActividadConRelaciones } from '@/types/performance'
import { useSession } from '@/hooks/useSession'

import ActividadesHeader from './ActividadesHeader'
import CardActividad from './CardActividad'
import ModalEvaluacion from './ModalEvaluacion'
import ModalConfirmacion from './ModalConfirmacion'

export default function ActividadesClient({ initialData }: { initialData: ActividadConRelaciones[] }) {
  const supabase = createClient()
  const { session } = useSession() as any
  
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
  const [idParaCompletar, setIdParaCompletar] = useState<number | null>(null)
  const [idParaEliminar, setIdParaEliminar] = useState<number | null>(null)

  // --- LÓGICA CAMBIO DE ESTADO ---
  const handleStatusChange = async (id: number, nuevoEstado: string) => {
    // 1. Buscamos la tarea
    const actividadActual = actividades.find(a => a.id === id);
    
    // 2. Verificamos asignación (igual que en la Card, para doble seguridad)
    const isAssignedToMe = actividadActual?.asignacion_actividades?.some(
      (asig: any) => {
         const emp = asig.empleados || asig.empleado;
         return emp?.usuario_id === session?.user?.id;
      }
    );

    // 3. Bloqueo de seguridad: Si eres Admin pero NO es tuya, no te dejo editar.
    if (canManage && !isAssignedToMe) {
      console.warn("Acción denegada: No puedes cambiar el estado de una tarea ajena.");
      return 
    }

    if (nuevoEstado === 'completada') {
      setIdParaCompletar(id)
      setConfirmModalOpen(true)
      return
    }
    await actualizarEstadoEnBD(id, nuevoEstado)
  }

  const confirmarCompletado = async () => {
    if (idParaCompletar) {
      await actualizarEstadoEnBD(idParaCompletar, 'completada')
      setIdParaCompletar(null)
      setConfirmModalOpen(false)
    }
  }

  // --- LÓGICA ELIMINAR ---
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
      
      const { error } = await supabase
        .from('actividades')
        .update(updateData)
        .eq('id', id)

      if (error) throw error
      await recargar() 
      
    } catch (error: any) {
      console.error("Error en actualizarEstadoEnBD:", error.message)
      alert('Error de permisos o conexión: ' + error.message)
    }
  }

  // --- LÓGICA DE EVALUACIÓN ---
  const handleGuardarEvaluacion = async (rating: number, nota: string) => {
    if (!selectedActividad || !session?.user?.id) return

    const { error } = await supabase.from('actividades').update({
        calificacion: rating,
        observaciones_evaluacion: nota.trim() || null,
        fecha_evaluada: new Date().toISOString(),
        evaluado_por_id: session.user.id 
      }).eq('id', selectedActividad.id)

    if (error) alert('Error al evaluar: ' + error.message)
    else {
      setModalOpen(false)
      recargar()
    }
  }

  const openEvaluacionModal = (actividad: ActividadConRelaciones) => {
    setSelectedActividad(actividad)
    setModalOpen(true)
  }

  if (loading && actividades.length === 0) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500/30 border-t-orange-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full space-y-6">
      <ActividadesHeader 
        stats={stats} 
        filtro={filtro} 
        setFiltro={setFiltro} 
        canCreate={canManage} 
      />

      <div className="flex-1 min-h-0">
        {actividades.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl bg-white border border-dashed border-gray-200 dark:bg-gray-900 dark:border-gray-800">
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
        onConfirm={confirmarCompletado}
        titulo="¿Tarea Finalizada?"
        descripcion="Estás a punto de marcar esta tarea como completada. Se notificará a tu supervisor."
        variant="success"
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