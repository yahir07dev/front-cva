'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { AlertCircle, Loader2 } from 'lucide-react'
import { usePerformance } from '@/src/hooks/perfomance/usePerformance'
import { ActividadConRelaciones } from '@/src/types/performance'
import { useSession } from '@/src/hooks/useSession'
import { useRouter } from 'next/navigation'
import { isSameDay, parseISO, isValid } from 'date-fns'

// Importamos el servicio donde pusimos la nueva lógica de subida a Cloudinary
import { actualizarEstadoActividad } from '@/src/services/perfomance/performanceService' 

import ActividadesHeader from './ActividadesHeader'
import CardActividad from './CardActividad'
import ModalEvaluacion from '../../shared/ModalEvaluacion'
import ModalConfirmacion from '../../shared/ModalConfirmacion'
import DateHeader from '@/src/components/shared/DateHeader'
import CalendarModal from '@/src/components/shared/CalendarModal'

export default function ActividadesClient({ initialData }: { initialData: ActividadConRelaciones[] }) {
  const supabase = createClient()
  const router = useRouter()
  const { session } = useSession() as any 
  
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)
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
  const [idParaEliminar, setIdParaEliminar] = useState<number | null>(null)
  
  // 👇 Ahora guardamos también el archivo temporalmente si el usuario mandó uno
  const [accionPendiente, setAccionPendiente] = useState<{ id: number, nuevoEstado: string, file?: File | null } | null>(null)
  const [isSavingStatus, setIsSavingStatus] = useState(false)

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
        await recargar()
      }
    }
    checkUserStatus()
  }, [session, supabase, recargar])

  const actividadesDelDia = useMemo(() => {
    return actividades.filter(act => {
      if (filtro !== 'todas' && act.estado !== filtro) return false

      const fechaReferencia = (act as any).fecha_limite || act.created_at
      if (!fechaReferencia) return false
      
      const fechaObj = parseISO(fechaReferencia)
      if (!isValid(fechaObj)) return false

      return isSameDay(fechaObj, selectedDate)
    })
  }, [actividades, selectedDate, filtro])

  const verifyAccess = () => {
    if (userEstado === 'baja') {
      alert('Tu cuenta está desactivada. Contacta a recursos humanos.')
      return false
    }
    return true
  }

  // 👇 Actualizamos para recibir el archivo
  const handleStatusChange = async (id: number, nuevoEstado: string, file?: File | null) => {
    if (!verifyAccess()) return 

    const actividadActual = actividades.find(a => a.id === id)
    const isAssignedToMe = actividadActual?.asignacion_actividades?.some(
      (asig: any) => {
        const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados
        return emp?.usuario_id === session?.user?.id
      }
    )

    if (!canManage && !isAssignedToMe) {
      alert("No tienes permiso para modificar esta tarea.")
      return
    }

    if (nuevoEstado === 'completada' || nuevoEstado === 'revision' || nuevoEstado === 'no_realizada') {
      setAccionPendiente({ id, nuevoEstado, file }) // <-- Guardamos el archivo
      setConfirmModalOpen(true)
      return
    }
    
    await actualizarEstadoEnBD(id, nuevoEstado, file)
  }

  const handleReasignar = (actividad: ActividadConRelaciones) => {
    if (!verifyAccess()) return
    router.push(`/dashboard/rendimiento/actividades/nueva?edit=${actividad.id}`)
  }

  const confirmarAccion = async () => {
    if (!verifyAccess() || !accionPendiente || !session?.user?.id) return 
    
    setIsSavingStatus(true)
    try {
      await actualizarEstadoActividad(
        accionPendiente.id, 
        accionPendiente.nuevoEstado, 
        session.user.id,
        accionPendiente.file // <-- Le pasamos el archivo al servicio
      )
      await recargar()
    } catch (error: any) {
      alert('Error: ' + error.message)
    } finally {
      setIsSavingStatus(false)
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

  // 👇 Actualizamos esta función para que use el servicio en lugar de consulta directa
  const actualizarEstadoEnBD = async (id: number, estado: string, file?: File | null) => {
    if (!session?.user?.id) return;
    
    try {
      await actualizarEstadoActividad(id, estado, session.user.id, file)
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
    const estado = accionPendiente?.nuevoEstado
    if (estado === 'revision') return { title: "¿Enviar a Revisión?", desc: "Se subirá la foto de evidencia y se notificará al supervisor.", variant: "info" as const, btnText: "Sí, enviar evidencia" }
    if (estado === 'completada') return { title: canManage ? "¿Aprobar Tarea?" : "¿Tarea Finalizada?", desc: "Se registrará como éxito.", variant: "success" as const, btnText: "Sí, confirmar" }
    if (estado === 'no_realizada') return { title: "¿Cerrar con Plazo Agotado?", desc: "Se marcará como no realizada.", variant: "danger" as const, btnText: "Sí, cerrar plazo" } 
    return { title: "Confirmar Cambio", desc: "¿Deseas continuar?", variant: "info" as const, btnText: "Continuar" }
  }

  if ((loading && actividades.length === 0) || !isReady) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-orange-600 dark:text-orange-400" />
      </div>
    )
  }

  const isUserBaja = userEstado === 'baja'
  const modalContent = getModalTexts()

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] overflow-hidden">
      
      {/* Sección superior fija */}
      <div className="flex-none mb-2 z-20 relative pt-1">
        <DateHeader 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
          onCalendarClick={() => setIsCalendarModalOpen(true)}
        />
        <div className="mt-1">
          <ActividadesHeader 
            stats={stats} 
            filtro={filtro} 
            setFiltro={setFiltro} 
            canCreate={isUserBaja ? false : canManage} 
            canManage={canManage}
          />
        </div>
      </div>

      {/* Lista de actividades (scrollable) */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-10 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-700 scrollbar-track-transparent pt-1">
        
        {actividadesDelDia.length === 0 ? (
          <div className="
            bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm
            border border-orange-200/30 dark:border-orange-900/30 
            rounded-3xl p-8 md:p-12 text-center shadow-sm mt-1
          ">
            <AlertCircle className="mx-auto h-10 w-10 text-orange-400 mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              Sin actividades para este día
            </h3>
            <p className="text-base text-neutral-600 dark:text-neutral-400 max-w-md mx-auto">
              No hay tareas programadas o visibles para la fecha seleccionada.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {actividadesDelDia.map((act) => (
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

      {/* Modales */}
      <CalendarModal 
        isOpen={isCalendarModalOpen} 
        onClose={() => setIsCalendarModalOpen(false)} 
        selectedDate={selectedDate} 
        onDateSelect={setSelectedDate}
        stats={stats}
        actividades={actividades}
        canManage={canManage}
      />

      <ModalEvaluacion 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSave={handleGuardarEvaluacion} 
        actividadTitulo={selectedActividad?.titulo || ''} 
      />

      {/* MODAL PARA CAMBIOS DE ESTADO */}
      <ModalConfirmacion
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={confirmarAccion}
        titulo={modalContent.title}
        descripcion={modalContent.desc}
        variant={modalContent.variant}
        textConfirmar={modalContent.btnText} 
        loading={isSavingStatus} // <-- Le pasamos el estado de carga para bloquear el botón si se está subiendo una foto pesada
      />

      {/* MODAL PARA ELIMINAR */}
      <ModalConfirmacion
        isOpen={!!idParaEliminar}
        onClose={() => setIdParaEliminar(null)}
        onConfirm={confirmarEliminacion}
        titulo="¿Eliminar Tarea?"
        descripcion="Se borrará el registro permanentemente. Esta acción no se puede deshacer."
        variant="danger"
      />
    </div>
  )
}