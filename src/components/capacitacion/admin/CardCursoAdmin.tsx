//src/components/capacitacion/admin/CardCursoAdmin.tsx
import { CursoCapacitacion } from '@/src/types/capacitacion'
import { Clock, Play, Edit3, Trash2, AlertCircle, CheckCircle2, Users, BarChart3 } from 'lucide-react'

export const getYouTubeThumbnail = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  const videoId = (match && match[2].length === 11) ? match[2] : null;
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
};

interface CardProps {
  curso: CursoCapacitacion;
  onEdit: (curso: CursoCapacitacion) => void;
  onDelete: (id: number) => void;
  onVerReporte: (curso: any) => void; // <--- Esta es la clave
}

export default function CardCursoAdmin({ curso, onEdit, onDelete, onVerReporte }: CardProps) {
  const isActivo = curso.esta_activo;
  const isObligatorio = curso.es_obligatorio;
  const thumbnail = getYouTubeThumbnail(curso.url_youtube);
  const cantidadAsignados = (curso as any).asignacion_cursos?.length || 0;

  return (
    <div className="group relative bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-1.5 border-2 border-transparent hover:border-rose-500/50 shadow-lg hover:shadow-rose-500/20 transition-all duration-300 flex flex-col h-full overflow-hidden">

      {/* Etiquetas Superiores */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 items-start">
        <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-black tracking-wider flex items-center gap-1.5 backdrop-blur-md shadow-lg ${isActivo ? 'bg-emerald-500/90 text-white' : 'bg-neutral-500/90 text-white'
          }`}>
          {isActivo ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
          {isActivo ? 'ACTIVO' : 'INACTIVO'}
        </span>
      </div>

      {/* Portada */}
      <div className="relative h-44 rounded-t-[1.5rem] overflow-hidden flex items-center justify-center bg-neutral-900 group-hover:scale-[1.02] transition-transform duration-500">
        {thumbnail ? (
          <img src={thumbnail} alt="Portada" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-rose-900 to-neutral-900 opacity-50"></div>
        )}
        <div className="relative z-10 w-14 h-14 bg-rose-600/90 rounded-full flex items-center justify-center backdrop-blur-md shadow-lg group-hover:scale-110 transition-transform duration-300">
          <Play className="text-white ml-1" size={24} fill="currentColor" />
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-lg font-extrabold text-neutral-900 dark:text-white line-clamp-1 mb-1">{curso.titulo}</h3>
        <p className="text-neutral-500 dark:text-neutral-400 text-sm line-clamp-2 mb-4 flex-1">
          {curso.descripcion || "Sin descripción proporcionada."}
        </p>

        {/* INFO Y BOTÓN DE REPORTES 👇 */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800/50 px-3 py-1 rounded-lg text-xs font-bold text-neutral-500 dark:text-neutral-400">
            <Clock size={14} className="text-blue-500" /> {curso.duracion_minutos} min
          </div>

          {/* BOTÓN INTERACTIVO PARA VER RESULTADOS */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVerReporte(curso);
            }}
            className="flex items-center gap-1.5 bg-indigo-50 hover:bg-indigo-600 dark:bg-indigo-500/10 dark:hover:bg-indigo-600 px-3 py-1 rounded-lg text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-white dark:hover:text-white transition-all active:scale-95 shadow-sm"
          >
            <BarChart3 size={14} /> {cantidadAsignados} Resultados
          </button>
        </div>

        {/* Acciones */}
        <div className="flex gap-2 mt-auto">

          <button
            onClick={() => onEdit(curso)}
            className="flex-1 flex items-center justify-center gap-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:border-rose-500 dark:hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-neutral-700 dark:text-neutral-300 py-2.5 rounded-xl font-medium transition-all hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(225,29,72,0.15)] active:scale-95"
          >
            <Edit3 size={18} /> Editar
          </button>
         <button 
  onClick={() => onDelete(curso.id!)} 
  className="p-2.5 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 hover:border-red-500 dark:hover:border-red-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-400 dark:text-neutral-500 rounded-xl transition-all hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(239,68,68,0.15)] active:scale-95"
>
  <Trash2 size={20} />
</button>
        </div>
      </div>
    </div>
  )
}