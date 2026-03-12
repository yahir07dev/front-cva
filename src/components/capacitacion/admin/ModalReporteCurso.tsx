'use client'

import { X, Award, Clock, AlertCircle, Search, User } from 'lucide-react'
import { useState } from 'react'
import { getDetalleEvaluacion } from '@/src/services/capacitacion/capacitacionService'
import ModalDetalleExamenAdmin from './ModalDetalleExamenAdmin'

interface ReporteProps {
  isOpen: boolean;
  onClose: () => void;
  curso: any;
}

export default function ModalReporteCurso({ isOpen, onClose, curso }: ReporteProps) {
  const [busqueda, setBusqueda] = useState('');
  const [detalleExamen, setDetalleExamen] = useState<any>(null);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<any>(null);
  const [loadingDetalle, setLoadingDetalle] = useState<number | null>(null);

  if (!isOpen || !curso) return null;

  const asignaciones = curso.asignacion_cursos || [];

  const filtrados = asignaciones.filter((asig: any) => {
    const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados;
    const nombreCompleto = `${emp?.nombre || ''} ${emp?.apellidos || ''}`.toLowerCase();
    return nombreCompleto.includes(busqueda.toLowerCase());
  });

  const verRevisionExamen = async (asig: any, emp: any) => {
    const cursoId = curso?.id;
    // ✅ Ahora usamos asig.empleado_id que sí viene en el select del servicio
    const empleadoId = asig?.empleado_id;

    if (!cursoId || !empleadoId) {
      console.error("Faltan IDs críticos:", { cursoId, empleadoId });
      alert("No se puede cargar el detalle: ID de curso o empleado no encontrado.");
      return;
    }

    setLoadingDetalle(asig.id);
    try {
      const data = await getDetalleEvaluacion(cursoId, empleadoId);
      if (data) {
        setDetalleExamen(data);
        setEmpleadoSeleccionado(emp);
      } else {
        alert("Este empleado terminó el curso pero no hay registro detallado de sus respuestas.");
      }
    } catch (err) {
      console.error("Error al obtener detalle:", err);
      alert("Ocurrió un error al consultar los resultados en la base de datos.");
    } finally {
      setLoadingDetalle(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-4xl bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-300">

        {/* HEADER */}
        <div className="p-6 sm:p-8 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-white dark:bg-neutral-900 z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-xl">
              <Award size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-neutral-900 dark:text-white">Reporte de Calificaciones</h2>
              <p className="text-neutral-500 dark:text-neutral-400 text-sm line-clamp-1">{curso.titulo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded-full transition-colors text-neutral-500 hover:text-rose-600">
            <X size={24} />
          </button>
        </div>

        {/* BUSCADOR */}
        <div className="px-8 py-4 bg-neutral-50/50 dark:bg-black/20">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-neutral-400" size={18} />
            <input
              type="text"
              placeholder="Buscar por nombre de empleado..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-white dark:bg-neutral-800 border-2 border-neutral-100 dark:border-neutral-800 rounded-2xl pl-12 pr-4 py-3 outline-none focus:border-blue-500 transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        {/* LISTA DE EMPLEADOS */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
          <div className="grid gap-3">
            {filtrados.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center gap-3">
                <AlertCircle className="text-neutral-300" size={48} />
                <p className="text-neutral-500 font-medium">No se encontraron registros de asignación.</p>
              </div>
            ) : (
              filtrados.map((asig: any) => {
                const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados;
                const completado = asig.estado === 'completado';
                const enProgreso = asig.estado === 'en_progreso';

                // ✅ La calificación ahora viene directamente del servicio (inyectada desde evaluaciones_resultados)
                const calificacion = typeof asig.calificacion === 'number' ? asig.calificacion : null;
                const notaMostrada = calificacion !== null ? Math.round(calificacion) : null;
                const aprobado = notaMostrada !== null && notaMostrada >= 80;

                return (
                  <div
                    key={asig.id}
                    className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-[1.5rem] border border-neutral-100 dark:border-neutral-800/50 group transition-all hover:bg-white dark:hover:bg-neutral-800 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-neutral-700 flex items-center justify-center border border-neutral-200 dark:border-neutral-600 overflow-hidden shrink-0">
                        {emp?.foto_perfil_url ? (
                          <img src={emp.foto_perfil_url} className="w-full h-full object-cover" alt="Avatar" />
                        ) : (
                          <User size={20} className="text-neutral-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900 dark:text-white">
                          {emp?.nombre || 'Sin nombre'} {emp?.apellidos || ''}
                        </p>
                        <span className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 ${
                          completado ? 'text-emerald-500' : enProgreso ? 'text-blue-500' : 'text-neutral-400'
                        }`}>
                          {completado ? 'Completado' : enProgreso ? 'En Progreso' : 'Pendiente'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Burbuja de Nota */}
                      <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center border-2 transition-colors ${
                        completado && notaMostrada !== null
                          ? (aprobado
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600'
                              : 'bg-rose-500/10 border-rose-500 text-rose-600')
                          : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-400'
                      }`}>
                        <span className="text-[9px] font-black uppercase leading-none mb-1">Nota</span>
                        <span className="text-lg font-black">
                          {completado && notaMostrada !== null ? notaMostrada : '—'}
                        </span>
                      </div>

                      {/* Botón de Inspección */}
                      {completado && (
                        <button
                          onClick={() => verRevisionExamen(asig, emp)}
                          disabled={loadingDetalle === asig.id}
                          className="p-3.5 bg-white dark:bg-neutral-700 hover:bg-blue-600 dark:hover:bg-blue-600 hover:text-white rounded-2xl shadow-sm border border-neutral-200 dark:border-neutral-600 transition-all active:scale-90 disabled:opacity-50 group/btn"
                          title="Ver examen detallado"
                        >
                          {loadingDetalle === asig.id ? (
                            <Clock className="animate-spin" size={20} />
                          ) : (
                            <Search size={20} className="group-hover/btn:scale-110 transition-transform" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 bg-neutral-50 dark:bg-black/20 border-t border-neutral-100 dark:border-neutral-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-10 py-3.5 rounded-2xl font-bold transition-all active:scale-95 shadow-xl hover:bg-black dark:hover:bg-neutral-100"
          >
            Cerrar Reporte
          </button>
        </div>
      </div>

      {/* MODAL DE DETALLE */}
      <ModalDetalleExamenAdmin
        isOpen={!!detalleExamen}
        onClose={() => setDetalleExamen(null)}
        examen={detalleExamen}
        curso={curso}
        empleado={empleadoSeleccionado}
      />
    </div>
  );
}