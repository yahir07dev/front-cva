'use client'
import { X, CheckCircle2, XCircle, Info, Trophy } from 'lucide-react'

export default function ModalDetalleExamenAdmin({ isOpen, onClose, examen, curso, empleado }: any) {
  if (!isOpen || !examen || !curso) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header con la nota grandota */}
        <div className="p-6 border-b border-neutral-100 dark:border-neutral-800 flex justify-between items-center bg-neutral-50 dark:bg-black/20">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 ${examen.aprobado ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600' : 'border-rose-500 bg-rose-500/10 text-rose-600'}`}>
               <span className="text-[10px] font-black uppercase leading-none mb-1">Nota</span>
               <span className="text-2xl font-black leading-none">{Math.round(examen.calificacion)}</span>
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-neutral-900 dark:text-white line-clamp-1">Resultados de {empleado?.nombre}</h3>
              <p className="text-sm text-neutral-500 font-medium">Evaluación: {curso.titulo}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Lista de preguntas auditadas */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
          {curso.preguntas?.map((pregunta: any, idx: number) => {
            const rEmpleado = examen.respuestas_empleado?.find((r: any) => r.pregunta_id === pregunta.id);
            
            return (
              <div key={pregunta.id} className="p-6 rounded-3xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-100 dark:border-neutral-800 relative overflow-hidden">
                {/* Indicador lateral de éxito/error */}
                <div className={`absolute left-0 top-0 bottom-0 w-2 ${rEmpleado?.es_correcta ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                
                <h4 className="font-bold text-neutral-900 dark:text-white mb-5 pl-2">
                  <span className="text-neutral-400 mr-2">{idx + 1}.</span> {pregunta.texto_pregunta}
                </h4>

                <div className="space-y-3 pl-2">
                  {pregunta.opciones_pregunta?.map((opc: any) => {
                    const esLaQueEligio = rEmpleado?.opcion_elegida_id === opc.id;
                    const esLaCorrecta = opc.es_correcta;

                    let estilo = "border-transparent opacity-50";
                    if (esLaQueEligio && esLaCorrecta) estilo = "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 opacity-100 shadow-sm";
                    if (esLaQueEligio && !esLaCorrecta) estilo = "border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300 opacity-100 shadow-sm";
                    if (!esLaQueEligio && esLaCorrecta) estilo = "border-emerald-500/40 border-dashed text-emerald-500 opacity-100";

                    return (
                      <div key={opc.id} className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-sm font-semibold transition-all ${estilo}`}>
                        <div className="shrink-0">
                          {esLaQueEligio && (esLaCorrecta ? <CheckCircle2 size={18} /> : <XCircle size={18} />)}
                          {!esLaQueEligio && esLaCorrecta && <Info size={18} />}
                          {!esLaQueEligio && !esLaCorrecta && <div className="w-4 h-4 rounded-full border border-neutral-300 dark:border-neutral-700" />}
                        </div>
                        <span>{opc.texto_opcion}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}