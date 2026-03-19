'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { AlertCircle } from 'lucide-react'
import { usePerformance } from '@/src/hooks/perfomance/usePerformance'
import { ActividadConRelaciones } from '@/src/types/performance'
import { useRouter } from 'next/navigation'
import { isSameDay, parseISO, isValid } from 'date-fns'
import { actualizarEstadoActividad } from '@/src/services/perfomance/performanceService'

import ActividadesHeader from './ActividadesHeader'
import CardActividad from './CardActividad'
import ModalEvaluacion from '../../shared/ModalEvaluacion'
import ModalConfirmacion from '../../shared/ModalConfirmacion'
import DateHeader from '@/src/components/shared/DateHeader'
import CalendarModal from '@/src/components/shared/CalendarModal'

// ✅ NUEVO: Recibe toda la metadata por props desde SSR
interface ActividadesClientProps {
  initialData: ActividadConRelaciones[]
  initialUserEstado: string
  initialPermisos: string[]
  sessionUser: any
}

export default function ActividadesClient({
  initialData,
  initialUserEstado,
  initialPermisos,
  sessionUser
}: ActividadesClientProps) {
  const supabase = createClient()
  const router = useRouter()

  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false)

  // ✅ El hook ya no necesita cargar permisos asíncronamente
  const {
    actividades,
    stats,
    canManage,
    filtro,
    setFiltro,
    recargar
  } = usePerformance({ initialData, initialPermisos, sessionUser })

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedActividad, setSelectedActividad] = useState<ActividadConRelaciones | null>(null)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [idParaEliminar, setIdParaEliminar] = useState<number | null>(null)

  const [accionPendiente, setAccionPendiente] = useState<{ id: number, nuevoEstado: string, file?: File | null } | null>(null)
  const [isSavingStatus, setIsSavingStatus] = useState(false)

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
    if (initialUserEstado === 'baja') {
      alert('Tu cuenta está desactivada. Contacta a recursos humanos.')
      return false
    }
    return true
  }

  const handleStatusChange = async (id: number, nuevoEstado: string, file?: File | null) => {
    if (!verifyAccess()) return

    const actividadActual = actividades.find(a => a.id === id)
    const isAssignedToMe = actividadActual?.asignacion_actividades?.some(
      (asig: any) => {
        const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados
        return emp?.usuario_id === sessionUser?.id
      }
    )

    if (!canManage && !isAssignedToMe) {
      alert("No tienes permiso para modificar esta tarea.")
      return
    }

    if (nuevoEstado === 'completada' || nuevoEstado === 'revision' || nuevoEstado === 'no_realizada') {
      setAccionPendiente({ id, nuevoEstado, file })
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
    if (!verifyAccess() || !accionPendiente || !sessionUser?.id) return

    setIsSavingStatus(true)
    try {
      await actualizarEstadoActividad(
        accionPendiente.id,
        accionPendiente.nuevoEstado,
        sessionUser.id,
        accionPendiente.file
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

  const actualizarEstadoEnBD = async (id: number, estado: string, file?: File | null) => {
    if (!sessionUser?.id) return;
    try {
      await actualizarEstadoActividad(id, estado, sessionUser.id, file)
      await recargar()
    } catch (error: any) {
      alert('Error: ' + error.message)
    }
  }

  const handleGuardarEvaluacion = async (rating: number, nota: string) => {
    if (!verifyAccess()) return
    if (!selectedActividad || !sessionUser?.id) return
    const { error } = await supabase.from('actividades').update({
      calificacion: rating,
      observaciones_evaluacion: nota.trim() || null,
      fecha_evaluada: new Date().toISOString(),
      evaluado_por_id: sessionUser.id
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

  const isUserBaja = initialUserEstado === 'baja'
  const modalContent = getModalTexts()

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] overflow-hidden">
      <div className="flex-none mb-2 z-20 relative pt-1">
        <DateHeader selectedDate={selectedDate} onDateChange={setSelectedDate} onCalendarClick={() => setIsCalendarModalOpen(true)} />
        <div className="mt-1">
          <ActividadesHeader stats={stats} filtro={filtro} setFiltro={setFiltro} canCreate={!isUserBaja && canManage} canManage={canManage} />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-10 scrollbar-thin pt-1">
        {actividadesDelDia.length === 0 ? (
          <div className="bg-white/70 dark:bg-neutral-900/70 border border-orange-200/30 rounded-3xl p-8 text-center mt-1">
            <AlertCircle className="mx-auto h-10 w-10 text-orange-400 mb-4" />
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">Sin actividades para este día</h3>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {actividadesDelDia.map((act) => (
              <CardActividad
                key={act.id}
                actividad={act}
                canManage={!isUserBaja && canManage}
                // 👇 NUEVAS PROPS PARA ELIMINAR EL useSession INTERNO:
                userId={sessionUser?.id}
                userAvatar={sessionUser?.user_metadata?.avatar_url}
                // ----------------------------------------------------
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                onEvaluar={openEvaluacionModal}
                onReasignar={handleReasignar}
              />
            ))}
          </div>
        )}
      </div>

      <CalendarModal isOpen={isCalendarModalOpen} onClose={() => setIsCalendarModalOpen(false)} selectedDate={selectedDate} onDateSelect={setSelectedDate} stats={stats} actividades={actividades} canManage={canManage} />
      <ModalEvaluacion isOpen={modalOpen} onClose={() => setModalOpen(false)} onSave={handleGuardarEvaluacion} actividadTitulo={selectedActividad?.titulo || ''} />
      <ModalConfirmacion isOpen={confirmModalOpen} onClose={() => setConfirmModalOpen(false)} onConfirm={confirmarAccion} titulo={modalContent.title} descripcion={modalContent.desc} variant={modalContent.variant} textConfirmar={modalContent.btnText} loading={isSavingStatus} />
      <ModalConfirmacion isOpen={!!idParaEliminar} onClose={() => setIdParaEliminar(null)} onConfirm={confirmarEliminacion} titulo="¿Eliminar Tarea?" descripcion="Acción irreversible." variant="danger" />
    </div>
  )
}