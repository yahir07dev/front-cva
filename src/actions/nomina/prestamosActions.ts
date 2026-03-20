'use server'

import { createClient } from '@/src/lib/supabase/server'
import { NuevoPrestamo } from '@/src/services/nomina/prestamosService'

// 1. CREAR PRÉSTAMO
export async function crearPrestamoAction(prestamo: NuevoPrestamo) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  const monto = prestamo.monto_total;
  const cuota_semanal = monto >= 2000 ? 500 : 200;
  const numero_pagos = Math.ceil(monto / cuota_semanal);

  const { data, error } = await supabase
    .from('prestamos')
    .insert([{
      empleado_id: prestamo.empleado_id,
      monto_total: monto,
      saldo_restante: monto,
      cuota_semanal: cuota_semanal,
      numero_pagos: numero_pagos,
      pagos_realizados: 0,
      fecha_otorgamiento: new Date().toISOString(),
      estado: 'activo',
      observaciones: prestamo.observaciones || null,
      created_by: user.id
    }])
    .select()
    .single();

  if (error) throw new Error('Error al crear préstamo: ' + error.message);
  return data;
}

// 2. REGISTRAR ABONO
export async function registrarAbonoPrestamoAction(prestamoId: number, montoPagado: number, omitir: boolean = false, motivoOmision: string = '') {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  const { data: prestamo, error: fetchError } = await supabase
    .from('prestamos')
    .select('saldo_restante, cuota_semanal, pagos_realizados')
    .eq('id', prestamoId)
    .single();

  if (fetchError || !prestamo) throw new Error('Préstamo no encontrado.');
  if (prestamo.saldo_restante <= 0) throw new Error('Este préstamo ya está pagado en su totalidad.');

  let montoAplicar = omitir ? 0 : montoPagado;
  if (montoAplicar > prestamo.saldo_restante) {
    montoAplicar = prestamo.saldo_restante; 
  }

  const nuevoSaldo = prestamo.saldo_restante - montoAplicar;

  const { error: insertError } = await supabase.from('pagos_prestamo').insert([{
    prestamo_id: prestamoId,
    monto_pagado: montoAplicar,
    saldo_anterior: prestamo.saldo_restante,
    saldo_nuevo: nuevoSaldo,
    fecha_pago: new Date().toISOString().split('T')[0],
    fue_omitido: omitir,
    motivo_omision: omitir ? motivoOmision : null,
    created_by: user.id
  }]);

  if (insertError) throw new Error('Error al guardar el recibo de pago.');

  const { error: updateError } = await supabase.from('prestamos').update({
    saldo_restante: nuevoSaldo,
    pagos_realizados: prestamo.pagos_realizados + (omitir ? 0 : 1),
    estado: nuevoSaldo <= 0 ? 'completado' : 'activo',
    fecha_finalizacion_real: nuevoSaldo <= 0 ? new Date().toISOString().split('T')[0] : null,
    updated_at: new Date().toISOString(),
    updated_by: user.id
  }).eq('id', prestamoId);

  if (updateError) throw new Error('Error al actualizar el saldo del préstamo.');
}

// 3. PAUSAR / REANUDAR COBRO
export async function togglePausarCobroAction(prestamoId: number, estadoActual: boolean) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  const { error } = await supabase.from('prestamos').update({ 
    omitir_siguiente_nomina: !estadoActual,
    updated_by: user.id,
    updated_at: new Date().toISOString()
  }).eq('id', prestamoId);

  if (error) throw new Error('Error al pausar/reanudar el cobro del préstamo.');
}