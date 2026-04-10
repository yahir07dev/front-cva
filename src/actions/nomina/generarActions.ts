//src/actions/nomina/generarActions.ts
'use server'

import { createClient } from '@/src/lib/supabase/server'
import { RenglonNomina } from '@/src/services/nomina/generarNominaService'

// 1. CARGA MASIVA CONSOLIDADA (Mata el waterfall de 3 queries)
export async function cargarNominaPorFechaAction(fechaPago: string, diaString: string) {
  const supabase = await createClient();

  // A. Verificar si ya existe guardada
  const { data: guardados } = await supabase
    .from('registros_nomina')
    .select('*, empleados!inner (id, nombre, apellidos, foto_perfil_url, dia_pago, recibe_pago_tarjeta, monto_tarjeta_defecto)')
    .eq('fecha_pago', fechaPago)
    .ilike('empleados.dia_pago', `%${diaString}%`)
    .is('deleted_at', null);

  if (guardados && guardados.length > 0) {
    const renglonesGuardados = guardados.map(r => ({
      empleado_id: r.empleado_id,
      nombre_completo: `${r.empleados.nombre} ${r.empleados.apellidos}`,
      foto_perfil_url: r.empleados.foto_perfil_url, 
      sueldo_base: Number(r.sueldo_base),
      sueldo_calculado: Number(r.total_percepciones),
      recibe_pago_tarjeta: r.empleados.recibe_pago_tarjeta,
      monto_tarjeta_defecto: Number(r.empleados.monto_tarjeta_defecto),
      prestamo_activo_id: null,
      descuento_prestamo: Number(r.descuento_prestamo),
      descuento_anticipo: Number(r.descuento_anticipo),
      descuento_tarjeta: Number(r.descuento_tarjeta),
      pago_neto: Number(r.pago_neto),
    })) as RenglonNomina[];

    return { renglones: renglonesGuardados, empleadosExtras: [], isReadOnly: true };
  }

  // B. Si no existe, calculamos todo en paralelo (Día de pago + Extras)
  const [empleadosDiaRes, todosEmpleadosRes] = await Promise.all([
    supabase.from('empleados').select('id, nombre, apellidos, foto_perfil_url, sueldo_base, recibe_pago_tarjeta, monto_tarjeta_defecto').eq('estado', 'activo').ilike('dia_pago', `%${diaString}%`).is('deleted_at', null),
    supabase.from('empleados').select('id, nombre, apellidos, dia_pago').eq('estado', 'activo').is('deleted_at', null).order('nombre', { ascending: true })
  ]);

  const empleadosDia = empleadosDiaRes.data || [];
  const todosEmpleados = todosEmpleadosRes.data || [];

  if (empleadosDia.length === 0) return { renglones: [], empleadosExtras: todosEmpleados, isReadOnly: false };

  // Escudo Anti-Dobles Pagos
  const fechaObj = new Date(fechaPago + 'T12:00:00');
  const fechaInicio = new Date(fechaObj); fechaInicio.setDate(fechaInicio.getDate() - 3);
  const fechaFin = new Date(fechaObj); fechaFin.setDate(fechaFin.getDate() + 3);

  const { data: nominasPrevias } = await supabase
    .from('registros_nomina')
    .select('empleado_id')
    .gte('fecha_pago', fechaInicio.toISOString().split('T')[0])
    .lte('fecha_pago', fechaFin.toISOString().split('T')[0]);

  const idsYaPagados = nominasPrevias?.map(n => n.empleado_id) || [];
  
  // Filtramos
  const empleadosFiltrados = empleadosDia.filter(emp => !idsYaPagados.includes(emp.id));
  const extrasDisponibles = todosEmpleados.filter(emp => !idsYaPagados.includes(emp.id));
  
  if (empleadosFiltrados.length === 0) return { renglones: [], empleadosExtras: extrasDisponibles, isReadOnly: false };

  // Préstamos
  const { data: prestamos } = await supabase
    .from('prestamos')
    .select('id, empleado_id, cuota_semanal, saldo_restante, omitir_siguiente_nomina, pagos_realizados, numero_pagos')
    .eq('estado', 'activo')
    .in('empleado_id', empleadosFiltrados.map(e => e.id));

  const renglonesNuevos: RenglonNomina[] = empleadosFiltrados.map(emp => {
    const prestamo = prestamos?.find(p => p.empleado_id === emp.id);
    let cuotaPrestamo = 0;
    if (prestamo && !prestamo.omitir_siguiente_nomina) {
      cuotaPrestamo = prestamo.cuota_semanal > prestamo.saldo_restante ? prestamo.saldo_restante : prestamo.cuota_semanal;
    }

    const sueldo = Number(emp.sueldo_base || 0);
    const tarjetaDefecto = Number(emp.monto_tarjeta_defecto || 0);

    return {
      empleado_id: emp.id,
      nombre_completo: `${emp.nombre} ${emp.apellidos}`,
      foto_perfil_url: emp.foto_perfil_url,
      sueldo_base: sueldo,
      sueldo_calculado: sueldo,
      recibe_pago_tarjeta: emp.recibe_pago_tarjeta || false,
      monto_tarjeta_defecto: tarjetaDefecto,
      prestamo_activo_id: prestamo ? prestamo.id : null,
      prestamo_pagos_realizados: prestamo ? prestamo.pagos_realizados : 0,
      prestamo_numero_pagos: prestamo ? prestamo.numero_pagos : 0,
      descuento_prestamo: cuotaPrestamo,
      descuento_anticipo: 0,
      descuento_tarjeta: emp.recibe_pago_tarjeta ? tarjetaDefecto : 0,
      pago_neto: sueldo - cuotaPrestamo - (emp.recibe_pago_tarjeta ? tarjetaDefecto : 0),
    };
  });

  return { renglones: renglonesNuevos, empleadosExtras: extrasDisponibles, isReadOnly: false };
}

// 2. OBTENER UN EMPLEADO EXTRA
export async function getEmpleadoExtraAction(empleadoId: number) {
  const supabase = await createClient();
  const { data: emp, error } = await supabase.from('empleados').select('id, nombre, apellidos, foto_perfil_url, sueldo_base, recibe_pago_tarjeta, monto_tarjeta_defecto').eq('id', empleadoId).single();
  if (error || !emp) throw new Error("Empleado no encontrado");

  const { data: prestamo } = await supabase.from('prestamos').select('id, cuota_semanal, saldo_restante, omitir_siguiente_nomina, pagos_realizados, numero_pagos').eq('empleado_id', emp.id).eq('estado', 'activo').single();

  let cuota = 0;
  if (prestamo && !prestamo.omitir_siguiente_nomina) {
    cuota = prestamo.cuota_semanal > prestamo.saldo_restante ? prestamo.saldo_restante : prestamo.cuota_semanal;
  }

  const sueldo = Number(emp.sueldo_base || 0);
  const tj = Number(emp.monto_tarjeta_defecto || 0);

  return {
    empleado_id: emp.id,
    nombre_completo: `${emp.nombre} ${emp.apellidos} (Extra)`,
    foto_perfil_url: emp.foto_perfil_url,
    sueldo_base: sueldo,
    sueldo_calculado: sueldo,
    recibe_pago_tarjeta: emp.recibe_pago_tarjeta || false,
    monto_tarjeta_defecto: tj,
    prestamo_activo_id: prestamo ? prestamo.id : null,
    prestamo_pagos_realizados: prestamo ? prestamo.pagos_realizados : 0,
    prestamo_numero_pagos: prestamo ? prestamo.numero_pagos : 0,
    descuento_prestamo: cuota,
    descuento_anticipo: 0,
    descuento_tarjeta: emp.recibe_pago_tarjeta ? tj : 0,
    pago_neto: sueldo - cuota - (emp.recibe_pago_tarjeta ? tj : 0),
  } as RenglonNomina;
}

// 3. GUARDAR TARJETA DEFECTO
export async function guardarTarjetaAction(empleadoId: number, monto: number) {
  const supabase = await createClient();
  const { error } = await supabase.from('empleados').update({ monto_tarjeta_defecto: monto }).eq('id', empleadoId);
  if (error) throw new Error(error.message);
}

// 4. GUARDAR NÓMINA MASIVA (Adaptado a Server Action)
export async function guardarNominaAction(
  diaPago: string, 
  periodoInicio: string, 
  periodoFin: string, 
  fechaPago: string, 
  renglones: RenglonNomina[]
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Sesión no válida.');

  const registrosAGuardar = renglones.map(r => ({
    empleado_id: r.empleado_id,
    plantilla_id: null, 
    periodo_inicio: periodoInicio,
    periodo_fin: periodoFin,
    fecha_pago: fechaPago,
    sueldo_base: r.sueldo_base,
    total_percepciones: r.sueldo_calculado, 
    descuento_prestamo: r.descuento_prestamo,
    descuento_anticipo: r.descuento_anticipo,
    descuento_tarjeta: r.descuento_tarjeta,
    otros_descuentos: 0,
    total_deducciones: r.descuento_prestamo + r.descuento_anticipo + r.descuento_tarjeta,
    pago_neto: r.pago_neto,
    estado: 'aprobado',
    aprobado_por_id: user.id,
    fecha_aprobacion: new Date().toISOString(),
    observaciones: r.sueldo_calculado !== r.sueldo_base ? 'Sueldo ajustado por faltas/medios turnos' : '',
    created_by: user.id
  }));

  const { data: nominasInsertadas, error: nominaError } = await supabase
    .from('registros_nomina')
    .insert(registrosAGuardar)
    .select('id, empleado_id, descuento_prestamo');

  if (nominaError) throw new Error('Error al guardar la nómina: ' + nominaError.message);

  for (const renglon of renglones) {
    if (renglon.prestamo_activo_id) {
      const nominaGenerada = nominasInsertadas?.find(n => n.empleado_id === renglon.empleado_id);
      const { data: prestamo } = await supabase.from('prestamos').select('saldo_restante, pagos_realizados, omitir_siguiente_nomina').eq('id', renglon.prestamo_activo_id).single();

      if (prestamo) {
        let nuevoSaldo = prestamo.saldo_restante;
        let pagoRealizadoExitoso = false;

        if (renglon.descuento_prestamo > 0) {
          nuevoSaldo = prestamo.saldo_restante - renglon.descuento_prestamo;
          pagoRealizadoExitoso = true;
          await supabase.from('pagos_prestamo').insert([{
            prestamo_id: renglon.prestamo_activo_id,
            nomina_id: nominaGenerada?.id,
            monto_pagado: renglon.descuento_prestamo,
            saldo_anterior: prestamo.saldo_restante,
            saldo_nuevo: nuevoSaldo,
            fecha_pago: fechaPago,
            created_by: user.id
          }]);
        }

        await supabase.from('prestamos')
          .update({
            saldo_restante: nuevoSaldo,
            pagos_realizados: prestamo.pagos_realizados + (pagoRealizadoExitoso ? 1 : 0),
            estado: nuevoSaldo <= 0 ? 'completado' : 'activo',
            fecha_finalizacion_real: nuevoSaldo <= 0 ? new Date().toISOString().split('T')[0] : null,
            omitir_siguiente_nomina: false 
          })
          .eq('id', renglon.prestamo_activo_id);
      }
    }
  }
}

/**
 * Obtiene un resumen de las nóminas pagadas agrupadas por fecha (Server Action).
 */
/**
 * Obtiene un resumen de las nóminas pagadas agrupadas por fecha (Server Action).
 */
export async function getHistorialResumenAction() {
  const supabase = await createClient();
  
  // 🚀 OPTIMIZACIÓN DE PAYLOAD: Solo traemos las dos columnas exactas que usa el .reduce
  const { data, error } = await supabase
    .from('registros_nomina')
    .select('fecha_pago, pago_neto') 
    .is('deleted_at', null)
    .order('fecha_pago', { ascending: false });

  if (error) throw new Error(error.message);
  if (!data) return [];

  // Al correr esto en el backend, el navegador del usuario no tiene que iterar miles de filas
  const grupos = data.reduce((acc: any, curr) => {
    const fecha = curr.fecha_pago;
    if (!acc[fecha]) {
      acc[fecha] = { fecha, total_empleados: 0, monto_total: 0 };
    }
    acc[fecha].total_empleados += 1;
    acc[fecha].monto_total += Number(curr.pago_neto);
    return acc;
  }, {});

  return Object.values(grupos);
}

/**
 * Obtiene el desglose detallado de todos los empleados pagados en una fecha específica (Server Action).
 */
export async function getDetalleNominaPorFechaAction(fecha: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('registros_nomina')
    .select(`
      *,
      empleados ( nombre, apellidos, areas!empleados_area_id_fkey(nombre) )
    `)
    .eq('fecha_pago', fecha)
    .is('deleted_at', null);

  if (error) throw new Error(error.message);
  return data;
}