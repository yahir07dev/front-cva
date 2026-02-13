'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { AlertCircle } from 'lucide-react'
import { usePerformance } from '@/src/hooks/usePerformance'
import { ActividadConRelaciones } from '@/src/types/performance'
import { useSession } from '@/src/hooks/useSession'
import { useRouter } from 'next/navigation'

import ActividadesHeader from './ActividadesHeader'
import CardActividad from './CardActividad'
import ModalEvaluacion from '../shared/ModalEvaluacion'
import ModalConfirmacion from '../shared/ModalConfirmacion'

export default function ActividadesClient({ initialData }: { initialData: ActividadConRelaciones[] }) {
  const supabase = createClient()
  const router = useRouter()
  const { session } = useSession() as any 
  
  const [isReady, setIsReady] = useState(false)
  const [userEstado, setUserEstado] = useState<string>('activo')

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

  // 1. Verificación de seguridad de cuenta
  useEffect(() => {
    const checkUserStatus = async () => {
      if (session?.user?.id) {
        const { data } = await supabase
          .from('empleados')
          .select('estado')
          .eq('usuario_id', session.user.id)
          .single()
        
        if (data) setUserEstado(data.estado)
        setIsReady(true)
      }
    }
    checkUserStatus()
  }, [session, supabase])

  const verifyAccess = () => {
    if (userEstado === 'baja') {
      alert('Tu cuenta está desactivada. Contacta a recursos humanos.')
      return false
    }
    return true
  }

  // 2. Control de cambios de estado con validación de asignación
  const handleStatusChange = async (id: number, nuevoEstado: string) => {
    if (!verifyAccess()) return 

    const actividadActual = actividades.find(a => a.id === id);
    const isAssignedToMe = actividadActual?.asignacion_actividades?.some(
      (asig: any) => {
          const emp = asig.empleados || asig.empleado;
          const empReal = Array.isArray(emp) ? emp[0] : emp;
          return empReal?.usuario_id === session?.user?.id;
      }
    );

    // Solo el administrador o el empleado asignado pueden mover la tarea
    if (!canManage && !isAssignedToMe) return;

    if (nuevoEstado === 'completada' || nuevoEstado === 'revision' || nuevoEstado === 'no_realizada') {
      setAccionPendiente({ id, nuevoEstado })
      setConfirmModalOpen(true)
      return
    }
    await actualizarEstadoEnBD(id, nuevoEstado)
  }

  // 3. Redirección para reasignar tareas vencidas
  const handleReasignar = (actividad: ActividadConRelaciones) => {
    if (!verifyAccess()) return;
    router.push(`/dashboard/rendimiento/actividades/nueva?edit=${actividad.id}`);
  }

  const confirmarAccion = async () => {
    if (!verifyAccess()) return 
    if (accionPendiente) {
      await actualizarEstadoEnBD(accionPendiente.id, accionPendiente.nuevoEstado)
      setAccionPendiente(null)
      setConfirmModalOpen(false)
    }
  }

  const handleDelete = (id: number) => {
    if (!verifyAccess()) return
    setIdParaEliminar(id)
  }

  const confirmarEliminacion = async () => {
    if (!verifyAccess()) return
    if (idParaEliminar) {
      const { error } = await supabase.from('actividades').delete().eq('id', idParaEliminar)
      if (error) alert('Error al eliminar: ' + error.message)
      else recargar()
      setIdParaEliminar(null)
    }
  }

  // 4. Persistencia en Base de Datos
  const actualizarEstadoEnBD = async (id: number, estado: string) => {
    try {
      const updateData: any = { 
        estado: estado,
        updated_at: new Date().toISOString(),
        updated_by: session?.user?.id
      }
      
      // Si se cierra por éxito o por tiempo agotado, registramos la fecha de finalización
      if (estado === 'completada' || estado === 'no_realizada') {
        updateData.fecha_completada = new Date().toISOString()
      }
      
      const { error } = await supabase.from('actividades').update(updateData).eq('id', id)
      if (error) throw error
      await recargar() 
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const handleGuardarEvaluacion = async (rating: number, nota: string) => {
    if (!verifyAccess()) return
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
    if (!verifyAccess()) return
    setSelectedActividad(actividad)
    setModalOpen(true)
  }

  const getModalTexts = () => {
    const estado = accionPendiente?.nuevoEstado;
    if (estado === 'revision') {
      return {
        title: "¿Solicitar Revisión?",
        desc: "Se notificará al supervisor que has terminado el trabajo.",
        variant: "info" as const 
      }
    }
    if (estado === 'completada') {
      return {
        title: canManage ? "¿Aprobar Tarea?" : "¿Tarea Finalizada?", 
        desc: "Se registrará como éxito en el historial de rendimiento.",
        variant: "success" as const
      }
    }
    if (estado === 'no_realizada') {
      return {
        title: "¿Cerrar con Plazo Agotado?",
        desc: "Se marcará como no realizada. Esta acción es definitiva para el reporte.",
        variant: "danger" as const
      }
    }
    return { title: "Confirmar Cambio", desc: "¿Deseas continuar?", variant: "info" as const }
  }

  if ((loading && actividades.length === 0) || !isReady) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-500/30 border-t-orange-500" />
      </div>
    )
  }

  const isUserBaja = userEstado === 'baja'
  const modalContent = getModalTexts()

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] overflow-hidden">
      <div className="flex-none mb-6">
        <ActividadesHeader 
          stats={stats} 
          filtro={filtro} 
          setFiltro={setFiltro} 
          canCreate={isUserBaja ? false : canManage} 
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-10 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
        {actividades.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl bg-white border border-dashed border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-800">
            <AlertCircle className="h-10 w-10 text-neutral-300 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Sección vacía</h3>
            <p className="text-sm text-neutral-500">No hay actividades registradas en esta categoría.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {actividades.map((act) => (
              <CardActividad 
                key={act.id} 
                actividad={act} 
                canManage={isUserBaja ? false : canManage} 
                onStatusChange={handleStatusChange} 
                onDelete={handleDelete} 
                onEvaluar={openEvaluacionModal}
                onReasignar={handleReasignar}
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
        descripcion="Se borrará el registro permanentemente."
        variant="danger"
      />
    </div>
  )
}