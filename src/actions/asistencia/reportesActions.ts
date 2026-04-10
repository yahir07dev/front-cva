'use server'

import { createClient } from '@/src/lib/supabase/server'

export async function getEmpleadosAsistenciaAction() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("empleados")
    .select("id, nombre, apellidos")
    .eq('estado', 'activo') // Traemos solo los activos por limpieza
    .order("nombre");
    
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getRegistrosAsistenciaAction(fechaInicio: string, fechaFin: string, tipoFiltro: string, empleadosSeleccionados: number[]) {
  const supabase = await createClient();
  
  let query = supabase
    .from("asistencias")
    .select(`id, accion, fecha, empleado_id, empleados ( nombre, apellidos )`)
    .eq("tipo", tipoFiltro)
    .gte("fecha", `${fechaInicio} 00:00:00`)
    .lte("fecha", `${fechaFin} 23:59:59`)
    .order("fecha", { ascending: true });

  if (empleadosSeleccionados.length > 0) {
    query = query.in("empleado_id", empleadosSeleccionados);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data || [];
}