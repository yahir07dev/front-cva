export interface OpcionPregunta {
  id?: number;
  texto_opcion: string;
  es_correcta: boolean;
}

export interface PreguntaCurso {
  id?: number;
  texto_pregunta: string;
  puntaje: number;
  opciones: OpcionPregunta[];
}

export interface CursoCapacitacion {
  id?: number;
  titulo: string;
  descripcion: string;
  url_youtube: string;
  duracion_minutos: number;
  // 👇 Nuevo campo para el límite de tiempo del examen
  tiempo_limite_examen?: number; 
  es_obligatorio: boolean;
  esta_activo: boolean;
  preguntas?: PreguntaCurso[];
  asignaciones?: any[]; // Lista de empleados asignados
}

export interface RespuestaEnvio {
  pregunta_id: number;
  opcion_elegida_id: number;
}