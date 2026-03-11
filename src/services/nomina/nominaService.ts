import { createClient } from '@/src/lib/supabase/client';

const supabase = createClient();

// Definimos la interfaz para mantener el código tipado y limpio
export interface NominaConfig {
  sueldo_base: number | null;
  dia_pago: 'Sábado' | 'Domingo' | '' | null;
  recibe_pago_tarjeta: boolean;
}

/**
 * Obtiene la lista de empleados activos con su configuración de nómina.
 * Reutilizamos tu patrón de traer roles y áreas de forma segura.
 */
export const getEmpleadosConfigNomina = async () => {
  const { data, error } = await supabase
    .from('empleados')
    .select(`
      id, 
      usuario_id, 
      nombre, 
      apellidos, 
      foto_perfil_url,
      sueldo_base,
      dia_pago,
      recibe_pago_tarjeta,
      estado,
      roles ( nombre ),
      areas!empleados_area_id_fkey ( nombre )  
    `)
    .eq('estado', 'activo') 
    .is('deleted_at', null) 
    .order('nombre', { ascending: true });
  
  if (error) {
    console.error("Error al obtener empleados para nómina:", error.message);
    throw new Error('No se pudieron cargar los datos de los empleados.');
  }
  
  return data || [];
}

/**
 * Actualiza el sueldo, el día de pago y el método de pago de un empleado.
 */
export const actualizarConfigNominaEmpleado = async (
  empleadoId: number, 
  config: NominaConfig
) => {
  // 1. Verificamos sesión (Patrón de seguridad del Módulo 3)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  // 2. Verificamos que quien hace el cambio no esté de baja
  const { data: perfilAutor } = await supabase
    .from('empleados')
    .select('estado')
    .eq('usuario_id', user.id)
    .single();

  if (perfilAutor?.estado === 'baja') { 
    throw new Error('Tu cuenta está desactivada. No puedes hacer modificaciones.');
  }

  // 3. Ejecutamos la actualización
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