import { createClient } from '@/src/lib/supabase/client';

const supabase = createClient();

export interface NominaConfig {
  sueldo_base: number | null;
  dia_pago: 'Sábado' | 'Domingo' | '' | null;
  recibe_pago_tarjeta: boolean;
  // NUEVO: Campo para el monto de tarjeta por defecto
  monto_tarjeta_defecto: number | null; 
}
//  NUEVO: Función para obtener la configuración de nómina de un empleado
export const obtenerConfigNominaEmpleado = async (empleadoId: number) => {
  const { data, error } = await supabase
    .from('empleados')
    .select('sueldo_base, dia_pago, recibe_pago_tarjeta, monto_tarjeta_defecto')
    .eq('id', empleadoId)
    .single();

  if (error) {
    console.error("Error al obtener configuración de nómina:", error.message);
    throw new Error(error.message);
  }

  return data as NominaConfig;
};

/**
 * Actualiza la configuración de nómina de un empleado, incluyendo sueldos,
 * días de pago y montos predeterminados de tarjeta.
 */
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
      //  AHORA GUARDAMOS EL MONTO:
      monto_tarjeta_defecto: config.monto_tarjeta_defecto, 
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq('id', empleadoId);

  if (error) {
    console.error("Error al actualizar configuración de nómina:", error.message);
    throw new Error(error.message);
  }
}