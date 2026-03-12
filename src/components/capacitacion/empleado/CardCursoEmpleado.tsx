import { CursoCapacitacion } from '@/src/types/capacitacion'
import { Clock, Play, CheckCircle2, AlertCircle, Award } from 'lucide-react'

// Helper para extraer la miniatura de YouTube en alta calidad
export const getYouTubeThumbnail = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
};

interface CardProps {
  curso: any; // Usamos any o el tipo extendido que incluya asignacion_cursos
  onEmpezar: (curso: any) => void;
  sessionUserId: string;
}

export default function CardCursoEmpleado({ curso, onEmpezar, sessionUserId }: CardProps) {
  const isObligatorio = curso.es_obligatorio;
  const thumbnail = getYouTubeThumbnail(curso.url_youtube);
  
  // Buscar la asignación de este empleado específico (puede venir como asignacion_cursos o asignaciones dependiendo de tu tipado)
  const listaAsignaciones = curso.asignacion_cursos || curso.asignaciones || [];
  const miAsignacion = listaAsignaciones.find((asig: any) => {
    const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados;
    return emp?.usuario_id === sessionUserId;
  });

  const estado = miAsignacion?.estado || 'asignado';
  const isCompletado = estado === 'completado';
  
  // Calcular progreso leyendo el JSON de 'notas_empleado'
  let progreso = 0;
  if (isCompletado) {
    progreso = 100;
  } else if (miAsignacion?.notas_empleado) {
    try {
      const data = JSON.parse(miAsignacion.notas_empleado);
      const totalPreguntas = curso.preguntas?.length || 1;
      
      if (data.fase === 'examen') {
        // Si ya está en el examen: 20% base por haber pasado el video + % de preguntas respondidas
        const respondidas = Object.keys(data.respuestas || {}).length;
        progreso = 20 + ((respondidas / totalPreguntas) * 80);
      } else if (data.fase === 'video') {
        // Si se quedó en el video, le damos un 10% simbólico de avance
        progreso = 10;
      }
    } catch(e) {
      console.error("Error parseando el progreso", e);
    }
  }

  // Asegurarnos que el progreso no sea decimal
  const progresoVisual = Math.round(progreso);

  return (
    <div className={`group relative bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-1.5 border-2 transition-all duration-300 flex flex-col h-full overflow-hidden ${
      isCompletado ? 'border-emerald-500/30 dark:border-emerald-500/50' : 'border-transparent hover:border-rose-500/50 shadow-lg hover:shadow-rose-500/20'
    }`}>
      
      {/* Etiquetas Flotantes Superiores */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start">
        <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5 shadow-lg backdrop-blur-md ${
          isCompletado 
            ? 'bg-emerald-500/90 text-white' 
            : progresoVisual > 0 
              ? 'bg-blue-500/90 text-white' 
              : 'bg-rose-500/90 text-white'
        }`}>
          {isCompletado ? <Award size={12} /> : progresoVisual > 0 ? <Clock size={12} /> : <AlertCircle size={12} />}
          {isCompletado ? 'COMPLETADO' : progresoVisual > 0 ? 'EN PROGRESO' : 'NUEVO'}
        </span>
        
        {isObligatorio && !isCompletado && (
          <span className="px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5 bg-amber-500/90 text-white shadow-lg backdrop-blur-md">
            OBLIGATORIO
          </span>
        )}
      </div>

      {/* Portada / Miniatura del Video */}
      <div className="relative h-44 rounded-t-[1.5rem] overflow-hidden flex items-center justify-center bg-neutral-900 group-hover:scale-[1.02] transition-transform duration-500">
        {thumbnail ? (
          <img 
            src={thumbnail} 
            alt="Portada" 
            className={`absolute inset-0 w-full h-full object-cover transition-all duration-500 ${
              isCompletado ? 'opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-60' : 'opacity-70 group-hover:opacity-90'
            }`} 
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-rose-900 to-neutral-900 opacity-50"></div>
        )}
        
        {/* Botón Circular Central */}
        <div className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg transition-transform duration-300 ${
          isCompletado ? 'bg-emerald-500 text-white' : 'bg-rose-600/90 text-white group-hover:scale-110'
        }`}>
          {isCompletado ? <CheckCircle2 size={28} /> : <Play size={28} fill="currentColor" className="ml-1" />}
        </div>
      </div>

      {/* Contenido (Textos y Acciones) */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white line-clamp-1 mb-1" title={curso.titulo}>
          {curso.titulo}
        </h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm line-clamp-2 mb-4 flex-1">
          {curso.descripcion || "Este curso te ayudará a mejorar tus habilidades."}
        </p>

        {/* Barra de Progreso */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Progreso</span>
            <span className={`text-xs font-black ${
              isCompletado ? 'text-emerald-500' : progresoVisual > 0 ? 'text-blue-500' : 'text-neutral-400'
            }`}>
              {progresoVisual}%
            </span>
          </div>
          <div className="w-full bg-neutral-100 dark:bg-neutral-800 rounded-full h-2 overflow-hidden shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                isCompletado ? 'bg-emerald-500' : progresoVisual > 0 ? 'bg-blue-500' : 'bg-rose-500 w-0'
              }`} 
              style={{ width: `${progresoVisual > 0 ? progresoVisual : 0}%` }}
            ></div>
          </div>
        </div>

        {/* Botón de Acción Inferior */}
        <button 
          onClick={() => onEmpezar(curso)}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all mt-auto flex items-center justify-center gap-2 ${
            isCompletado 
              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20' 
              : progresoVisual > 0
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-95'
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-500/30 hover:scale-[1.02] active:scale-95'
          }`}
        >
          {isCompletado ? (
            'Ver Resultados'
          ) : progresoVisual > 0 ? (
            <><Play size={16} fill="currentColor" /> Continuar Curso</>
          ) : (
            'Empezar Curso'
          )}
        </button>
      </div>
    </div>
  )
}