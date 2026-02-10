'use client'

import { useState } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { AlertCircle } from 'lucide-react'
import { usePerformance } from '@/src/hooks/usePerformance'
import { ActividadConRelaciones } from '@/src/types/performance'
import { useSession } from '@/src/hooks/useSession'

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
  
  // ESTADOS PARA MODALES
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  
  // Ahora guardamos no solo el ID, sino el NUEVO ESTADO al que se quiere ir
  const [accionPendiente, setAccionPendiente] = useState<{ id: number, nuevoEstado: string } | null>(null)
  
  const [idParaEliminar, setIdParaEliminar] = useState<number | null>(null)

  // --- LÓGICA CAMBIO DE ESTADO ---
  const handleStatusChange = async (id: number, nuevoEstado: string) => {
    // 1. Buscamos la tarea
    const actividadActual = actividades.find(a => a.id === id);
    
    // 2. Verificamos asignación
    const isAssignedToMe = actividadActual?.asignacion_actividades?.some(
      (asig: any) => {
         const emp = asig.empleados || asig.empleado;
         return emp?.usuario_id === session?.user?.id;
      }
    );

    // 3. Bloqueo de seguridad: Si eres Admin pero NO es tuya, no te dejo editar.
    // EXCEPCIÓN: Si eres Admin y vas a APROBAR (completar), sí te dejo aunque no sea tuya.
    if (canManage && !isAssignedToMe && nuevoEstado !== 'completada') {
      console.warn("Acción denegada: No puedes cambiar el estado de una tarea ajena.");
      return 
    }

    // 4. Si el cambio es "Delicado" (Completar o Revisión), pedimos confirmación
    if (nuevoEstado === 'completada' || nuevoEstado === 'revision') {
      setAccionPendiente({ id, nuevoEstado })
      setConfirmModalOpen(true)
      return
    }

    // 5. Si es un cambio normal (pendientes, en progreso...), lo hacemos directo
    await actualizarEstadoEnBD(id, nuevoEstado)
  }

  const confirmarAccion = async () => {
    if (accionPendiente) {
      await actualizarEstadoEnBD(accionPendiente.id, accionPendiente.nuevoEstado)
      setAccionPendiente(null)
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

  // Lógica para textos dinámicos del Modal
  const getModalTexts = () => {
      if (accionPendiente?.nuevoEstado === 'revision') {
          return {
              title: "¿Solicitar Revisión?",
              desc: "Se notificará a tu supervisor que has terminado. La tarea quedará bloqueada hasta que sea aprobada.",
              variant: "info" as const // O 'primary' si tu modal lo soporta
          }
      }
      if (accionPendiente?.nuevoEstado === 'completada') {
           return {
              title: canManage ? "¿Aprobar Tarea?" : "¿Tarea Finalizada?", // Texto diferente si es Admin
              desc: canManage ? "Al aprobar, confirmas que el trabajo cumple con los requisitos." : "Estás a punto de marcar esta tarea como completada.",
              variant: "success" as const
          }
      }
      return { title: "Confirmar", desc: "¿Estás seguro?", variant: "info" as const }
  }

  const modalContent = getModalTexts()

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

      {/* MODAL DINÁMICO (Revisión o Completar) */}
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