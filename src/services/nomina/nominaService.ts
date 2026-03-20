import { createClient } from '@/src/lib/supabase/client';

const supabase = createClient();

export interface NominaConfig {
  sueldo_base: number | null;
  dia_pago: 'Sábado' | 'Domingo' | '' | null;
  recibe_pago_tarjeta: boolean;
}

// Ya NO necesitamos getEmpleadosConfigNomina aquí, el SSR lo hace en page.tsx

export const actualizarConfigNominaEmpleado = async (
  empleadoId: number, 
  config: NominaConfig
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  const { error } = await supabase
    .from('empleados')
    .update({
      sueldo_base: config.sueldo_base,
      dia_pago: config.dia_pago,
      recibe_pago_tarjeta: config.recibe_pago_tarjeta,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq('id', empleadoId);

  if (error) {
    console.error("Error al actualizar nómina:", error.message);
    throw new Error(error.message);
  }
}