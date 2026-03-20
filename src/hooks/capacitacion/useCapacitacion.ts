import { useState, useEffect, useCallback, useMemo } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { 
  getCursosAction, crearCursoAction, actualizarCursoAction, eliminarCursoAction, 
  guardarProgresoBorradorAction, enviarEvaluacionAction, getDetalleEvaluacionAction 
} from '@/src/actions/capacitacion/capacitacionActions'
import { CursoCapacitacion } from '@/src/types/capacitacion'

interface UseCapacitacionProps {
  initialCursos: any[]
  userId: string
  empleadoId: number
}

export function useCapacitacion({ initialCursos, userId, empleadoId }: UseCapacitacionProps) {
  const [supabase] = useState(() => createClient())
  const [cursos, setCursos] = useState<any[]>(initialCursos)
  const [loading, setLoading] = useState(false) 
  const [filtro, setFiltro] = useState('todos')

  // 1. REALTIME SILENCIOSO
  const reFetchCursos = useCallback(async () => {
    try {
      const data = await getCursosAction()
      setCursos(data)
    } catch (err) {
      console.error('Error re-fetching cursos:', err)
    }
  }, [])

  useEffect(() => {
    const channel = supabase.channel(`cursos-updates-${userId}`) 
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cursos' }, () => reFetchCursos())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'asignacion_cursos' }, () => reFetchCursos())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [supabase, userId, reFetchCursos])

  // 2. FILTROS EN MEMORIA
  const cursosFiltrados = useMemo(() => {
    if (filtro === 'todos') return cursos;
    return cursos.filter(curso => {
        const miAsignacion = curso.asignacion_cursos?.find((asig: any) => {
            const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados;
            return emp?.usuario_id === userId;
        });
        if (filtro === 'completados') return miAsignacion?.estado === 'completado';
        if (filtro === 'pendientes') return miAsignacion?.estado === 'asignado' || miAsignacion?.estado === 'en_progreso';
        return true;
    });
  }, [cursos, filtro, userId]);

  // 3. ENVOLTURAS PARA LAS SERVER ACTIONS (Mutaciones)
  const crearCurso = async (cursoData: CursoCapacitacion, empleadosIds: number[]) => {
    await crearCursoAction(cursoData, empleadosIds);
    await reFetchCursos();
  };

  const editarCurso = async (cursoId: number, cursoData: CursoCapacitacion, empleadosIds: number[]) => {
    await actualizarCursoAction(cursoId, cursoData, empleadosIds);
    await reFetchCursos();
  };

  const eliminarCurso = async (cursoId: number) => {
    await eliminarCursoAction(cursoId);
    setCursos(prev => prev.filter(c => c.id !== cursoId)); // Optimistic UI
  };

  const guardarProgreso = async (cursoId: number, progresoData: any) => {
    await guardarProgresoBorradorAction(cursoId, empleadoId, progresoData);
  };

  const enviarExamen = async (cursoId: number, respuestas: any[], tiempoInicio: string) => {
    const resultado = await enviarEvaluacionAction(cursoId, respuestas, tiempoInicio);
    await reFetchCursos(); 
    return resultado;
  };

  const obtenerDetallesEvaluacion = async (cursoId: number) => {
    return await getDetalleEvaluacionAction(cursoId, empleadoId);
  };

  return {
    cursos: cursosFiltrados,
    loading,
    filtro,
    setFiltro,
    crearCurso,
    editarCurso,
    eliminarCurso,
    guardarProgreso,
    enviarExamen,
    obtenerDetallesEvaluacion
  }
}