'use client'

import { useState, useMemo } from 'react'
import { BoxSelect, Briefcase, GraduationCap } from 'lucide-react'
import { useCapacitacion } from '@/src/hooks/capacitacion/useCapacitacion'
import HeaderCapacitacion from './HeaderCapacitacion'
import CardCursoAdmin from './CardCursoAdmin'
import ModalCrearCurso from './ModalCrearCurso'
import ModalReporteCurso from './ModalReporteCurso' 
import CardCursoEmpleado from '../empleado/CardCursoEmpleado'
import VisorCurso from '../empleado/VisorCurso'
import ModalConfirmacion from '@/src/components/shared/ModalConfirmacion'

interface CapacitacionClientProps {
  initialCursos: any[]
  empleadosDisponibles: any[]
  canManage: boolean
  empleadoId: number
  userId: string
}

export default function CapacitacionClient({ 
  initialCursos, 
  empleadosDisponibles, 
  canManage, 
  empleadoId, 
  userId 
}: CapacitacionClientProps) {
  
  const { 
    cursos, crearCurso, editarCurso, eliminarCurso, 
    guardarProgreso, enviarExamen, obtenerDetallesEvaluacion 
  } = useCapacitacion({ initialCursos, userId, empleadoId })
  
  const [vistaAdmin, setVistaAdmin] = useState<'gestion' | 'mis_cursos'>('gestion')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cursoAEditar, setCursoAEditar] = useState<any | null>(null)
  const [cursoJugando, setCursoJugando] = useState<any | null>(null)
  const [cursoParaReporte, setCursoParaReporte] = useState<any | null>(null) 

  const [cursoAEliminar, setCursoAEliminar] = useState<number | null>(null)
  const [isEliminando, setIsEliminando] = useState(false)

  const stats = useMemo(() => ({
      totales: cursos.length,
      activos: cursos.filter(c => c.esta_activo).length,
      obligatorios: cursos.filter(c => c.es_obligatorio).length
  }), [cursos])

  const modoVistaActual = canManage ? vistaAdmin : 'mis_cursos';

  const cursosAMostrar = useMemo(() => {
    if (modoVistaActual === 'gestion') return cursos;
    return cursos.filter(curso => {
      const asignaciones = curso.asignacion_cursos || [];
      return asignaciones.some((a: any) => {
        const emp = Array.isArray(a.empleados) ? a.empleados[0] : a.empleados;
        return emp?.usuario_id === userId;
      });
    });
  }, [cursos, modoVistaActual, userId]);

  /* Handlers */
  const handleNuevoCurso = () => { setCursoAEditar(null); setIsModalOpen(true); }
  const handleEditarCurso = (curso: any) => { setCursoAEditar(curso); setIsModalOpen(true); }
  const handleEliminarClick = (id: number) => setCursoAEliminar(id)

  const confirmarEliminacion = async () => {
    if (cursoAEliminar === null) return
    setIsEliminando(true)
    try {
      await eliminarCurso(cursoAEliminar)
    } finally {
      setIsEliminando(false)
      setCursoAEliminar(null)
    }
  }

  // Ya no verificamos el "loading" inicial porque el estado viene lleno desde el SSR

  return (
    <div className="min-h-screen pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="mb-8">
        {canManage && modoVistaActual === 'gestion' && (
          <HeaderCapacitacion stats={stats} onNuevoCurso={handleNuevoCurso} />
        )}
      </div>

      {canManage && (
        <div className="flex bg-neutral-200/80 dark:bg-neutral-800/80 p-1.5 rounded-2xl w-fit mb-10 mx-auto sm:mx-0 shadow-inner backdrop-blur-sm">
          <button 
            onClick={() => setVistaAdmin('gestion')} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${vistaAdmin === 'gestion' ? 'bg-white dark:bg-neutral-700 text-rose-600 dark:text-rose-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
          >
            <Briefcase size={18} /> Gestión
          </button>
          <button 
            onClick={() => setVistaAdmin('mis_cursos')} 
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${vistaAdmin === 'mis_cursos' ? 'bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'}`}
          >
            <GraduationCap size={18} /> Mis Cursos
          </button>
        </div>
      )}

      {cursosAMostrar.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-rose-200 dark:border-rose-900/30 mx-4 sm:mx-0">
          <BoxSelect size={48} className="text-rose-500 mb-6" />
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">No hay cursos disponibles</h3>
          <p className="text-neutral-500 max-w-md mx-auto mb-8">
            {modoVistaActual === 'gestion' ? "Aún no has creado cursos." : "No tienes capacitaciones pendientes."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-max px-2 sm:px-0">
          {cursosAMostrar.map((curso) => (
            modoVistaActual === 'gestion' ? (
              <CardCursoAdmin 
                key={curso.id} 
                curso={curso} 
                onEdit={handleEditarCurso} 
                onDelete={handleEliminarClick} 
                onVerReporte={setCursoParaReporte} 
              />
            ) : (
              <CardCursoEmpleado 
                key={curso.id} 
                curso={curso} 
                onEmpezar={setCursoJugando} 
                sessionUserId={userId} 
              />
            )
          ))}
        </div>
      )}

      <ModalCrearCurso 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        cursoAEditar={cursoAEditar} 
        empleadosLista={empleadosDisponibles} // Pasamos la lista pre-cargada
        onSubmit={crearCurso} 
        onEdit={editarCurso} 
      />

      <ModalReporteCurso 
        isOpen={!!cursoParaReporte} 
        onClose={() => setCursoParaReporte(null)} 
        curso={cursoParaReporte} 
      />

      {cursoJugando && (
        <VisorCurso 
          curso={cursoJugando} 
          sessionUserId={userId}
          onClose={() => setCursoJugando(null)} 
          onSubmitExamen={enviarExamen}
          onGuardarProgreso={guardarProgreso}
          onGetDetalles={obtenerDetallesEvaluacion} 
        />
      )}

      <ModalConfirmacion 
        isOpen={cursoAEliminar !== null}
        onClose={() => setCursoAEliminar(null)}
        onConfirm={confirmarEliminacion}
        titulo="¿Eliminar curso?"
        descripcion="Si eliminas este curso, se perderá la información y los empleados asignados ya no podrán acceder a él."
        variant="danger"
        textConfirmar="Sí, eliminar"
        loading={isEliminando}
      />
    </div>
  )
}