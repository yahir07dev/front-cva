import { createClient } from '@/src/lib/supabase/client';

const supabase = createClient();

// Interfaz para tipar los datos del préstamo
export interface NuevoPrestamo {
  empleado_id: number;
  monto_total: number;
  observaciones?: string;
}

/**
 * Obtiene todos los préstamos activos e históricos con los datos del empleado.
 */
export const getPrestamos = async () => {
  const { data, error } = await supabase
    .from('prestamos')
    .select(`
      *,
      empleados!prestamos_empleado_id_fkey (
        id, nombre, apellidos, foto_perfil_url, areas!empleados_area_id_fkey(nombre)
      )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error al obtener préstamos:", error.message);
    throw new Error('No se pudieron cargar los préstamos.');
  }
  
  return data || [];
}

/**
 * Obtiene empleados activos para el selector al crear un préstamo.
 */
export const getEmpleadosParaPrestamo = async () => {
  const { data, error } = await supabase
    .from('empleados')
    .select('id, nombre, apellidos, foto_perfil_url')
    .eq('estado', 'activo')
    .is('deleted_at', null)
    .order('nombre', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * LÓGICA CORE: Crea un nuevo préstamo calculando automáticamente cuotas y plazos.
 */
export const crearPrestamo = async (prestamo: NuevoPrestamo) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  // 1. Lógica de negocio (Cálculo de Cuota y Pagos)
  const monto = prestamo.monto_total;
  let cuota_semanal = 0;

  if (monto >= 2000) {
    cuota_semanal = 500;
  } else {
    cuota_semanal = 200;
  }

  // Calculamos el número de pagos (redondeando hacia arriba por si hay decimales)
  const numero_pagos = Math.ceil(monto / cuota_semanal);

  // 2. Inserción en la base de datos
  const { data, error } = await supabase
    .from('prestamos')
    .insert([{
      empleado_id: prestamo.empleado_id,
      monto_total: monto,
      saldo_restante: monto, // Al inicio, el saldo restante es igual al total
      cuota_semanal: cuota_semanal,
      numero_pagos: numero_pagos,
      pagos_realizados: 0,
      fecha_otorgamiento: new Date().toISOString(), // Fecha actual
      estado: 'activo',
      observaciones: prestamo.observaciones || null,
      created_by: user.id
    }])
    .select()
    .single();

  if (error) {
    console.error("Error al crear préstamo:", error.message);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Registra un pago (o una omisión) y actualiza el saldo del préstamo.
 */
export const registrarAbonoPrestamo = async (
  prestamoId: number, 
  montoPagado: number, 
  omitir: boolean = false, 
  motivoOmision: string = ''
) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  // 1. Obtener el saldo actual del préstamo
  const { data: prestamo, error: fetchError } = await supabase
    .from('prestamos')
    .select('saldo_restante, cuota_semanal, pagos_realizados')
    .eq('id', prestamoId)
    .single();

  if (fetchError || !prestamo) throw new Error('Préstamo no encontrado.');
  if (prestamo.saldo_restante <= 0) throw new Error('Este préstamo ya está pagado en su totalidad.');

  // 2. Calcular el nuevo saldo (Evitar cobrar de más si es el último pago)
  let montoAplicar = omitir ? 0 : montoPagado;
  if (montoAplicar > prestamo.saldo_restante) {
    montoAplicar = prestamo.saldo_restante; 
  }

  const nuevoSaldo = prestamo.saldo_restante - montoAplicar;

  // 3. Registrar el historial en 'pagos_prestamo'
  const { error: insertError } = await supabase
    .from('pagos_prestamo')
    .insert([{
      prestamo_id: prestamoId,
      monto_pagado: montoAplicar,
      saldo_anterior: prestamo.saldo_restante,
      saldo_nuevo: nuevoSaldo,
      fecha_pago: new Date().toISOString().split('T')[0], // Solo la fecha (YYYY-MM-DD)
      fue_omitido: omitir,
      motivo_omision: omitir ? motivoOmision : null,
      created_by: user.id
    }]);

  if (insertError) throw new Error('Error al guardar el recibo de pago: ' + insertError.message);

  // 4. Actualizar el Préstamo Maestro (Restar saldo)
  const { error: updateError } = await supabase
    .from('prestamos')
    .update({
      saldo_restante: nuevoSaldo,
      pagos_realizados: prestamo.pagos_realizados + (omitir ? 0 : 1),
      estado: nuevoSaldo <= 0 ? 'completado' : 'activo',
      fecha_finalizacion_real: nuevoSaldo <= 0 ? new Date().toISOString().split('T')[0] : null,
      updated_at: new Date().toISOString(),
      updated_by: user.id
    })
    .eq('id', prestamoId);

  if (updateError) throw new Error('Error al actualizar el saldo del préstamo.');
}

/**
 * Alterna el estado de "Pausar cobro" para la siguiente nómina.
 */
export const togglePausarCobro = async (prestamoId: number, estadoActual: boolean) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  const { error } = await supabase
    .from('prestamos')
    .update({ 
      omitir_siguiente_nomina: !estadoActual,
      updated_by: user.id,
      updated_at: new Date().toISOString()
    })
    .eq('id', prestamoId);

  if (error) throw new Error('Error al pausar/reanudar el cobro del préstamo.');
}