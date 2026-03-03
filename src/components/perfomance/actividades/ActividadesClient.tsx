'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { AlertCircle } from 'lucide-react'
import { usePerformance } from '@/src/hooks/usePerformance'
import { ActividadConRelaciones } from '@/src/types/performance'
import { useSession } from '@/src/hooks/useSession'
import { useRouter } from 'next/navigation'
import { isSameDay, parseISO, isValid, startOfDay, endOfDay } from 'date-fns'

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
    canManage, // Este valor (true para admin) es el que faltaba pasar
    filtro, 
    setFiltro, 
    recargar 
  } = usePerformance(initialData)

  const [modalOpen, setModalOpen] = useState(false)
  const [selectedActividad, setSelectedActividad] = useState<ActividadConRelaciones | null>(null)
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [accionPendiente, setAccionPendiente] = useState<{ id: number, nuevoEstado: string } | null>(null)
  const [idParaEliminar, setIdParaEliminar] = useState<number | null>(null)

  // 1. Verificación de seguridad + Recarga forzada
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

  // FILTRO DE FECHAS
  const actividadesDelDia = useMemo(() => {
    return actividades.filter(act => {
      if (filtro !== 'todas' && act.estado !== filtro) return false;

      const fechaReferencia = (act as any).fecha_limite || act.created_at;
      if (!fechaReferencia) return false;
      
      const fechaObj = parseISO(fechaReferencia);
      if (!isValid(fechaObj)) return false;

      return isSameDay(fechaObj, selectedDate);
    })
  }, [actividades, selectedDate, filtro])

  const verifyAccess = () => {
    if (userEstado === 'baja') {
      alert('Tu cuenta está desactivada. Contacta a recursos humanos.')
      return false
    }
    return true
  }

  const handleStatusChange = async (id: number, nuevoEstado: string) => {
    if (!verifyAccess()) return 

    const actividadActual = actividades.find(a => a.id === id);
    const isAssignedToMe = actividadActual?.asignacion_actividades?.some(
      (asig: any) => {
          const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados;
          return emp?.usuario_id === session?.user?.id;
      }
    );

    if (!canManage && !isAssignedToMe) {
        alert("No tienes permiso para modificar esta tarea.");
        return;
    }

    if (nuevoEstado === 'completada' || nuevoEstado === 'revision' || nuevoEstado === 'no_realizada') {
      setAccionPendiente({ id, nuevoEstado })
      setConfirmModalOpen(true)
      return
    }
    await actualizarEstadoEnBD(id, nuevoEstado)
  }

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

  const actualizarEstadoEnBD = async (id: number, estado: string) => {
    try {
      const updateData: any = { 
        estado: estado,
        updated_at: new Date().toISOString(),
        updated_by: session?.user?.id
      }
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
    if (estado === 'revision') return { title: "¿Solicitar Revisión?", desc: "Se notificará al supervisor.", variant: "info" as const }
    if (estado === 'completada') return { title: canManage ? "¿Aprobar Tarea?" : "¿Tarea Finalizada?", desc: "Se registrará como éxito.", variant: "success" as const }
    if (estado === 'no_realizada') return { title: "¿Cerrar con Plazo Agotado?", desc: "Se marcará como no realizada.", variant: "danger" as const }
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
      
      {/* SECCIÓN SUPERIOR */}
      <div className="flex-none mb-4 z-20 relative">
        <DateHeader 
          selectedDate={selectedDate} 
          onDateChange={setSelectedDate} 
          onCalendarClick={() => setIsCalendarModalOpen(true)}
        />
        <div className="mt-4">
          {/* 🔥 CORRECCIÓN: Pasamos canManage al header */}
          <ActividadesHeader 
            stats={stats} 
            filtro={filtro} 
            setFiltro={setFiltro} 
            canCreate={isUserBaja ? false : canManage} 
            canManage={canManage}
          />
        </div>
      </div>

      {/* LISTA DE TAREAS */}
      <div className="flex-1 overflow-y-auto min-h-0 pr-2 pb-10 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
        
        {actividadesDelDia.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center rounded-3xl bg-white border border-dashed border-neutral-200 dark:bg-neutral-900/50 dark:border-neutral-800">
            <AlertCircle className="h-10 w-10 text-neutral-300 mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-white">Sin actividades</h3>
            <p className="text-sm text-neutral-500">No hay tareas para el día seleccionado.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
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

      {/* MODALES */}
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