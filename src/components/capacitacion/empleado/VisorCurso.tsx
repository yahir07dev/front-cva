'use client'

import { useState, useEffect } from 'react'
import { CursoCapacitacion, RespuestaEnvio } from '@/src/types/capacitacion'
import { X, PlayCircle, FileText, CheckCircle2, ChevronRight, Award, Loader2, AlertCircle, XCircle } from 'lucide-react'

const getYouTubeEmbedUrl = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?rel=0&modestbranding=1` : null;
};

interface VisorProps {
  curso: any;
  sessionUserId: string;
  onClose: () => void;
  onSubmitExamen: (cursoId: number, respuestas: RespuestaEnvio[], tiempoInicio: string) => Promise<any>;
  onGuardarProgreso: (cursoId: number, progresoData: any) => Promise<void>;
  onGetDetalles: (cursoId: number) => Promise<any>; // NUEVA PROP
}

export default function VisorCurso({ curso, sessionUserId, onClose, onSubmitExamen, onGuardarProgreso, onGetDetalles }: VisorProps) {
  const [fase, setFase] = useState<'video' | 'examen' | 'resultados' | 'revision'>('video')
  const [respuestas, setRespuestas] = useState<Record<number, number>>({})
  const [tiempoInicio, setTiempoInicio] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [resultadoFinal, setResultadoFinal] = useState<any>(null)
  
  const [detallesRevision, setDetallesRevision] = useState<any>(null) // Guarda el desglose

  const embedUrl = getYouTubeEmbedUrl(curso.url_youtube)

  useEffect(() => {
    const listaAsignaciones = curso.asignacion_cursos || curso.asignaciones || [];
    const miAsignacion = listaAsignaciones.find((asig: any) => {
      const emp = Array.isArray(asig.empleados) ? asig.empleados[0] : asig.empleados;
      return emp?.usuario_id === sessionUserId;
    });

    if (miAsignacion) {
      if (miAsignacion.estado === 'completado') {
        setFase('resultados');
        // Cargamos los detalles automáticamente si ya estaba completado
        onGetDetalles(curso.id).then(res => {
          if (res) setResultadoFinal(res);
        });
      } else if (miAsignacion.notas_empleado) {
        try {
          const draft = JSON.parse(miAsignacion.notas_empleado);
          if (draft.fase) setFase(draft.fase);
          if (draft.respuestas) setRespuestas(draft.respuestas);
        } catch(e) {}
      }
    }
  }, [curso, sessionUserId, onGetDetalles]);

  const avanzarAExamen = () => {
    setFase('examen')
    if (!tiempoInicio) setTiempoInicio(new Date().toISOString())
    onGuardarProgreso(curso.id, { fase: 'examen', respuestas })
  }

  const handleSeleccionarOpcion = (preguntaId: number, opcionId: number) => {
    const nuevasRespuestas = { ...respuestas, [preguntaId]: opcionId }
    setRespuestas(nuevasRespuestas)
    onGuardarProgreso(curso.id, { fase: 'examen', respuestas: nuevasRespuestas })
  }

  const handleEnviar = async () => {
    const totalPreguntas = curso.preguntas?.length || 0;
    if (Object.keys(respuestas).length < totalPreguntas) {
      alert("Por favor, responde todas las preguntas antes de enviar tu evaluación.")
      return
    }

    setLoading(true)
    try {
      const formatoRespuestas = Object.entries(respuestas).map(([pId, oId]) => ({
        pregunta_id: parseInt(pId), opcion_elegida_id: oId
      }))

      // Al enviar, el backend nos devuelve la evaluacion. Luego pedimos el detalle para la revisión.
      await onSubmitExamen(curso.id, formatoRespuestas, tiempoInicio)
      const detalle = await onGetDetalles(curso.id)
      setResultadoFinal(detalle)
      setFase('resultados')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-100/95 dark:bg-neutral-950/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
      
      {/* HEADER */}
      <div className="h-16 sm:h-20 px-4 sm:px-8 bg-white/50 dark:bg-black/50 border-b border-neutral-200/50 dark:border-neutral-800/50 flex items-center justify-between shrink-0 shadow-sm z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500 text-white rounded-xl shadow-lg shadow-rose-500/30">
            {fase === 'video' ? <PlayCircle size={24} /> : fase === 'examen' ? <FileText size={24} /> : <Award size={24} />}
          </div>
          <div>
            <p className="text-xs font-bold text-rose-500 uppercase tracking-widest">
              {fase === 'video' ? 'Material de Estudio' : (fase === 'examen' ? 'Evaluación' : 'Resultados')}
            </p>
            <h2 className="text-lg font-bold text-neutral-900 dark:text-white line-clamp-1">{curso.titulo}</h2>
          </div>
        </div>
        <button onClick={onClose} className="p-2.5 bg-neutral-200/50 hover:bg-rose-500 hover:text-white dark:bg-neutral-800/50 text-neutral-600 dark:text-neutral-400 dark:hover:bg-rose-600 dark:hover:text-white rounded-full transition-all">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-8 pb-32 scrollbar-thin scrollbar-thumb-rose-200 dark:scrollbar-thumb-rose-900/50">
        <div className="max-w-4xl mx-auto">
          
          {fase === 'video' && (
            <div className="animate-in slide-in-from-bottom-8 duration-500">
              <div className="aspect-video w-full bg-black rounded-[2rem] overflow-hidden shadow-2xl shadow-rose-500/10 border border-neutral-200 dark:border-neutral-800 relative">
                {embedUrl ? <iframe src={embedUrl} className="w-full h-full" allowFullScreen></iframe> : <div className="flex justify-center items-center h-full text-white">Video no disponible</div>}
              </div>
              <div className="mt-8 bg-white dark:bg-neutral-900 rounded-[2rem] p-6 sm:p-8 flex items-center justify-between shadow-lg">
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">¿Terminaste de ver el video?</h3>
                </div>
                <button onClick={avanzarAExamen} className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-4 rounded-2xl font-bold text-lg flex gap-2 shadow-lg hover:scale-105 active:scale-95 transition-all">
                  Ir al Examen <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {fase === 'examen' && (
            <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-right-8 duration-500">
              {/* CÓDIGO DEL EXAMEN (El que ya tienes, no cambia nada) */}
              <div className="text-center mb-10">
                <h3 className="text-3xl font-extrabold text-neutral-900 dark:text-white mb-2">Pon a prueba tus conocimientos</h3>
              </div>

              {curso.preguntas?.map((pregunta: any, index: number) => (
                <div key={pregunta.id} className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-[2rem] shadow-sm border border-neutral-200 dark:border-neutral-800">
                  <h4 className="text-lg sm:text-xl font-bold mb-6 flex gap-3">
                    <span className="text-rose-500 bg-rose-50 dark:bg-rose-500/10 w-8 h-8 rounded-full flex items-center justify-center shrink-0">{index + 1}</span> 
                    {pregunta.texto_pregunta}
                  </h4>
                  <div className="space-y-3 pl-0 sm:pl-11">
                    {pregunta.opciones_pregunta?.map((opcion: any) => {
                      const isSelected = respuestas[pregunta.id] === opcion.id;
                      return (
                        <div key={opcion.id} onClick={() => handleSeleccionarOpcion(pregunta.id, opcion.id)} className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/10' : 'border-neutral-200 dark:border-neutral-800'}`}>
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected ? 'border-rose-500 bg-rose-500 text-white' : 'border-neutral-300 dark:border-neutral-600'}`}>
                            {isSelected && <CheckCircle2 size={16} />}
                          </div>
                          <span className={`font-medium ${isSelected ? 'text-rose-900 dark:text-rose-200' : 'text-neutral-700 dark:text-neutral-300'}`}>{opcion.texto_opcion}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              <div className="pt-8 flex justify-center">
                <button onClick={handleEnviar} disabled={loading} className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-12 py-4 rounded-2xl font-bold flex gap-3">
                  {loading ? 'Calificando...' : 'Finalizar Evaluación'}
                </button>
              </div>
            </div>
          )}

          {fase === 'resultados' && (
            <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center mt-10">
              {resultadoFinal ? (
                <>
                  <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-8 shadow-2xl ${resultadoFinal.aprobado ? 'bg-emerald-500 shadow-emerald-500/40' : 'bg-rose-500 shadow-rose-500/40'}`}>
                    <Award size={64} className="text-white" />
                  </div>
                  <h3 className="text-4xl font-extrabold mb-2 text-center">{resultadoFinal.aprobado ? '¡Felicidades, aprobaste!' : 'Sigue practicando'}</h3>
                  <p className="text-neutral-500 text-lg mb-8 text-center max-w-md">Has obtenido {resultadoFinal.respuestas_correctas} respuestas correctas de {resultadoFinal.preguntas_totales}.</p>
                  
                  <div className="bg-white dark:bg-neutral-900 p-8 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-xl w-full max-w-sm text-center mb-10">
                    <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-1">Calificación Final</p>
                    <p className={`text-6xl font-black ${resultadoFinal.aprobado ? 'text-emerald-500' : 'text-rose-500'}`}>{resultadoFinal.calificacion}<span className="text-3xl">%</span></p>
                  </div>
                  
                  <div className="flex gap-4">
                    <button onClick={() => setFase('revision')} className="bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 px-8 py-4 rounded-2xl font-bold transition-all">
                      Revisar mis respuestas
                    </button>
                    <button onClick={onClose} className="bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 px-8 py-4 rounded-2xl font-bold transition-all">
                      Volver
                    </button>
                  </div>
                </>
              ) : (
                <Loader2 className="animate-spin text-rose-500 w-12 h-12" />
              )}
            </div>
          )}

          {/* NUEVA FASE 4: REVISIÓN DE RESPUESTAS */}
          {fase === 'revision' && resultadoFinal && (
            <div className="space-y-6 sm:space-y-8 animate-in slide-in-from-right-8 duration-500">
              <div className="flex items-center justify-between mb-8 bg-white dark:bg-neutral-900 p-6 rounded-[2rem] border border-neutral-200 dark:border-neutral-800 shadow-sm">
                <div>
                  <h3 className="text-2xl font-extrabold text-neutral-900 dark:text-white">Revisión del Examen</h3>
                  <p className="text-neutral-500">Comprueba en qué acertaste y en qué fallaste.</p>
                </div>
                <button onClick={() => setFase('resultados')} className="bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-6 py-2 rounded-xl font-bold">
                  Regresar
                </button>
              </div>

              {curso.preguntas?.map((pregunta: any, index: number) => {
                // Buscamos qué respondió el empleado en esta pregunta
                const miRespuesta = resultadoFinal.respuestas_empleado?.find((r: any) => r.pregunta_id === pregunta.id);

                return (
                  <div key={pregunta.id} className="bg-white dark:bg-neutral-900 p-6 sm:p-8 rounded-[2rem] shadow-sm border border-neutral-200 dark:border-neutral-800 relative overflow-hidden">
                    {/* Indicador lateral visual de Correcto/Incorrecto */}
                    <div className={`absolute left-0 top-0 bottom-0 w-2 ${miRespuesta?.es_correcta ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                    
                    <h4 className="text-lg font-bold mb-6 flex gap-3 pl-4">
                      <span className="text-neutral-400">{index + 1}.</span> {pregunta.texto_pregunta}
                    </h4>
                    
                    <div className="space-y-3 pl-4 sm:pl-9">
                      {pregunta.opciones_pregunta?.map((opcion: any) => {
                        const isSelected = miRespuesta?.opcion_elegida_id === opcion.id;
                        const isCorrectAnswer = opcion.es_correcta;

                        // Lógica de colores para la revisión
                        let colorClass = 'border-neutral-200 dark:border-neutral-800 opacity-60'; // Normal ignorada
                        if (isSelected && isCorrectAnswer) colorClass = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 scale-[1.01] opacity-100'; // Correcta elegida
                        if (isSelected && !isCorrectAnswer) colorClass = 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-900 dark:text-rose-100 scale-[1.01] opacity-100'; // Incorrecta elegida
                        if (!isSelected && isCorrectAnswer) colorClass = 'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 opacity-100 border-dashed'; // Correcta que no eligió

                        return (
                          <div key={opcion.id} className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${colorClass}`}>
                            <div className="shrink-0">
                              {isSelected && isCorrectAnswer && <CheckCircle2 className="text-emerald-500" />}
                              {isSelected && !isCorrectAnswer && <XCircle className="text-rose-500" />}
                              {!isSelected && isCorrectAnswer && <CheckCircle2 className="text-emerald-500/50" />}
                              {!isSelected && !isCorrectAnswer && <div className="w-6 h-6 rounded-full border-2 border-neutral-300 dark:border-neutral-700"></div>}
                            </div>
                            <span className="font-medium">{opcion.texto_opcion}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}