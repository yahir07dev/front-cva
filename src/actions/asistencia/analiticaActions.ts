'use server'

import { createClient } from '@/src/lib/supabase/server'

export async function getAnaliticaAsistenciaAction(diasRango: number) {
  const supabase = await createClient();
  
  const fechaLimite = new Date();
  fechaLimite.setDate(fechaLimite.getDate() - diasRango);
  const fechaISO = fechaLimite.toISOString();

  const { data: asistencias, error } = await supabase
    .from("asistencias")
    .select(`*, empleados ( nombre, apellidos )`)
    .gte("fecha", fechaISO)
    .order("fecha", { ascending: true });

  if (error) throw new Error(error.message);
  return asistencias || [];
}