// src/types/performance.ts

// 1. Ajustamos la ruta para que apunte al archivo que acabas de crear
import { Database } from './types_db' 

export type Actividad = Database['public']['Tables']['actividades']['Row']
export type ActividadInsert = Database['public']['Tables']['actividades']['Insert']
export type ActividadUpdate = Database['public']['Tables']['actividades']['Update']

export type ComentarioRendimiento = Database['public']['Tables']['comentarios_rendimiento']['Row']
export type ComentarioInsert = Database['public']['Tables']['comentarios_rendimiento']['Insert']

export type AsignacionActividad = Database['public']['Tables']['asignacion_actividades']['Row']

export type Empleado = Database['public']['Tables']['empleados']['Row']

// Enums
export type EstadoActividad = Database['public']['Enums']['estado_actividad']
export type PrioridadActividad = Database['public']['Enums']['prioridad_actividad']
export type TipoComentario = Database['public']['Enums']['tipo_comentario']

/**
 * Tipo complejo: Actividad con sus relaciones.
 * Se utiliza para las consultas que hacen "join" con otras tablas
 * como el nombre del área o los empleados asignados.
 */
export interface ActividadConRelaciones extends Actividad {
  asignacion_actividades?: (AsignacionActividad & {
    empleados?: {
      nombre: string;
      apellidos: string;
      foto_perfil_url: string | null;
    } | null;
  })[];
  areas?: {
    nombre: string;
  } | null;
}