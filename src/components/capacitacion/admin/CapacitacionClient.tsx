'use client'

import { useState, useMemo } from 'react'
import { useCapacitacion } from '@/src/hooks/capacitacion/useCapacitacion'
import { useSession } from '@/src/hooks/useSession'
import { Loader2, BoxSelect, Briefcase, GraduationCap } from 'lucide-react'

// Componentes
import HeaderCapacitacion from '../admin/HeaderCapacitacion'
import CardCursoAdmin from '../admin/CardCursoAdmin'
import ModalCrearCurso from '../admin/ModalCrearCurso'
import ModalReporteCurso from '../admin/ModalReporteCurso' // <--- NUEVO
import CardCursoEmpleado from '../empleado/CardCursoEmpleado'
import VisorCurso from '../empleado/VisorCurso'

export default function CapacitacionClient() {
  const { session } = useSession() as any
  const { 
    cursos, loading, canManage, crearCurso, editarCurso, 
    eliminarCurso, guardarProgreso, enviarExamen, obtenerDetallesEvaluacion 
  } = useCapacitacion()
  
  // Toggle de vista para el Admin
  const [vistaAdmin, setVistaAdmin] = useState<'gestion' | 'mis_cursos'>('gestion')

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [cursoAEditar, setCursoAEditar] = useState<any | null>(null)
  const [cursoJugando, setCursoJugando] = useState<any | null>(null)
  const [cursoParaReporte, setCursoParaReporte] = useState<any | null>(null) // <--- NUEVO

  const stats = useMemo(() => {
    return {
      totales: cursos.length,
      activos: cursos.filter(c => c.esta_activo).length,
      obligatorios: cursos.filter(c => c.es_obligatorio).length
    }
  }, [cursos])

  const modoVistaActual = canManage ? vistaAdmin : 'mis_cursos';

  const cursosAMostrar = useMemo(() => {
    if (modoVistaActual === 'gestion') return cursos;
    
    // Filtrar solo los cursos donde el usuario actual está asignado personalmente
    return cursos.filter(curso => {
      const asignaciones = (curso as any).asignacion_cursos || [];
      return asignaciones.some((a: any) => {
        const emp = Array.isArray(a.empleados) ? a.empleados[0] : a.empleados;
        return emp?.usuario_id === session?.user?.id;
      });
    });
  }, [cursos, modoVistaActual, session?.user?.id]);

  /* Handlers Admin */
  const handleNuevoCurso = () => { setCursoAEditar(null); setIsModalOpen(true); }
  const handleEditarCurso = (curso: any) => { setCursoAEditar(curso); setIsModalOpen(true); }
  const handleEliminarCurso = async (id: number) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este curso?")) {
      await eliminarCurso(id);
    }
  }

  /* Handlers Empleado/Jugador */
  const handleEmpezarCurso = (curso: any) => setCursoJugando(curso);

  if (loading && cursos.length === 0) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-16 w-16 animate-spin text-rose-500" />
        <p className="text-neutral-500 font-bold animate-pulse">Cargando academia...</p>
      </div>
    )
  }

  return (
    <div className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {canManage && modoVistaActual === 'gestion' && (
        <HeaderCapacitacion stats={stats} onNuevoCurso={handleNuevoCurso} />
      )}

      {/* SWITCH DE VISTA PARA ADMINISTRADOR */}
      {canManage && (
        <div className="flex bg-neutral-200 dark:bg-neutral-800/80 p-1.5 rounded-2xl w-fit mb-8 mx-auto sm:mx-0 shadow-inner">
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
        <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm rounded-3xl border-2 border-dashed border-rose-200 dark:border-rose-900/30">
          <BoxSelect size={48} className="text-rose-500 mb-6" />
          <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">No hay cursos disponibles</h3>
          <p className="text-neutral-500 max-w-md mx-auto mb-8">
            {modoVistaActual === 'gestion' ? "Aún no has creado cursos." : "No tienes capacitaciones pendientes."}
          </p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cursosAMostrar.map((curso) => (
            modoVistaActual === 'gestion' ? (
              <CardCursoAdmin 
                key={curso.id} 
                curso={curso} 
                onEdit={handleEditarCurso} 
                onDelete={handleEliminarCurso} 
                onVerReporte={setCursoParaReporte} // <--- PASAMOS LA FUNCIÓN
              />
            ) : (
              <CardCursoEmpleado 
                key={curso.id} 
                curso={curso} 
                onEmpezar={handleEmpezarCurso} 
                sessionUserId={session?.user?.id} 
              />
            )
          ))}
        </div>
      )}

      {/* MODALES */}
      {isModalOpen && (
        <ModalCrearCurso 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          cursoAEditar={cursoAEditar} 
          onSubmit={crearCurso} 
          onEdit={editarCurso} 
        />
      )}

      {cursoParaReporte && (
        <ModalReporteCurso 
          isOpen={!!cursoParaReporte} 
          onClose={() => setCursoParaReporte(null)} 
          curso={cursoParaReporte} 
        />
      )}

      {cursoJugando && (
        <VisorCurso 
          curso={cursoJugando} 
          sessionUserId={session?.user?.id}
          onClose={() => setCursoJugando(null)} 
          onSubmitExamen={enviarExamen}
          onGuardarProgreso={guardarProgreso}
          onGetDetalles={obtenerDetallesEvaluacion} 
        />
      )}
    </div>
  )
}