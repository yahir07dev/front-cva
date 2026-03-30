// types.ts
export interface Asistencia {
  id: number;
  empleado_id: number;
  tipo: string; // Ej: 'jornada', 'comida'
  accion: string; // Ej: 'entrada', 'salida'
  fecha: string;
}

export interface Empleado {
  id: number;
  nombre: string;
  apellidos: string;
  asistencias?: Asistencia[];
}

export interface ReporteFila {
  empleado_id: number;
  nombre_completo: string;
  fecha: string; // YYYY-MM-DD
  entrada_jornada: Date | null;
  salida_comida: Date | null;
  entrada_comida: Date | null;
  salida_jornada: Date | null;
  estatus_puntualidad: "A tiempo" | "Tolerancia" | "Retraso" | "Sin registro";
}
