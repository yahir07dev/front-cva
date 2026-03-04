import { createClient } from '@/src/lib/supabase/client';

const supabase = createClient();

export interface RenglonNomina {
  empleado_id: number;
  nombre_completo: string;
  foto_perfil_url?: string | null;
  sueldo_base: number;
  sueldo_calculado: number;
  recibe_pago_tarjeta: boolean;
  monto_tarjeta_defecto: number;
  prestamo_activo_id: number | null;
  descuento_prestamo: number;
  descuento_anticipo: number;
  descuento_tarjeta: number;
  pago_neto: number;
}

// 1. Filtramos directamente por el día (Sábado o Domingo)
export const getDatosPorDiaDePago = async (diaPago: string, fechaPago: string) => {
  const { data: empleados, error: empError } = await supabase
    .from('empleados')
    .select('id, nombre, apellidos, foto_perfil_url, sueldo_base, recibe_pago_tarjeta, monto_tarjeta_defecto')
    .eq('estado', 'activo')
    .ilike('dia_pago', `%${diaPago}%`) 
    .is('deleted_at', null);

  if (empError) throw new Error(empError.message);
  if (!empleados || empleados.length === 0) return [];

  const empleadoIds = empleados.map(e => e.id);

  // Escudo Anti-Dobles Pagos
  const fechaObj = new Date(fechaPago + 'T12:00:00');
  const fechaInicioBusqueda = new Date(fechaObj);
  fechaInicioBusqueda.setDate(fechaInicioBusqueda.getDate() - 3);
  const fechaFinBusqueda = new Date(fechaObj);
  fechaFinBusqueda.setDate(fechaFinBusqueda.getDate() + 3);

  const { data: nominasPrevias } = await supabase
    .from('registros_nomina')
    .select('empleado_id')
    .in('empleado_id', empleadoIds)
    .gte('fecha_pago', fechaInicioBusqueda.toISOString().split('T')[0])
    .lte('fecha_pago', fechaFinBusqueda.toISOString().split('T')[0]);

  const idsYaPagados = nominasPrevias?.map(n => n.empleado_id) || [];
  const empleadosFiltrados = empleados.filter(emp => !idsYaPagados.includes(emp.id));

  if (empleadosFiltrados.length === 0) return [];

  const idsFiltrados = empleadosFiltrados.map(e => e.id);

  const { data: prestamos } = await supabase
    .from('prestamos')
    // AÑADIDO: omitir_siguiente_nomina
    .select('id, empleado_id, cuota_semanal, saldo_restante, omitir_siguiente_nomina')
    .eq('estado', 'activo')
    .in('empleado_id', idsFiltrados);

  const renglones: RenglonNomina[] = empleadosFiltrados.map(emp => {
    const prestamo = prestamos?.find(p => p.empleado_id === emp.id);
    let cuotaPrestamo = 0;
    
    // LÓGICA DE PAUSA APLICADA AQUÍ: Si el préstamo existe y NO está pausado, se cobra.
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
      descuento_prestamo: cuotaPrestamo,
      descuento_anticipo: 0,
      descuento_tarjeta: emp.recibe_pago_tarjeta ? tarjetaDefecto : 0,
      pago_neto: sueldo - cuotaPrestamo - (emp.recibe_pago_tarjeta ? tarjetaDefecto : 0),
    };
  });

  return renglones;
}

// 2. Traer a un empleado "prestado" de otro día
export const getEmpleadoParaAgregar = async (empleadoId: number) => {
  const { data: emp, error } = await supabase
    .from('empleados')
    .select('id, nombre, apellidos, foto_perfil_url, sueldo_base, recibe_pago_tarjeta, monto_tarjeta_defecto')
    .eq('id', empleadoId)
    .single();

  if (error || !emp) throw new Error("Empleado no encontrado");

  const { data: prestamo } = await supabase
    .from('prestamos')
    // AÑADIDO: omitir_siguiente_nomina
    .select('id, cuota_semanal, saldo_restante, omitir_siguiente_nomina')
    .eq('empleado_id', emp.id)
    .eq('estado', 'activo')
    .single();

  let cuota = 0;
  // LÓGICA DE PAUSA APLICADA AQUÍ TAMBIÉN
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
    descuento_prestamo: cuota,
    descuento_anticipo: 0,
    descuento_tarjeta: emp.recibe_pago_tarjeta ? tj : 0,
    pago_neto: sueldo - cuota - (emp.recibe_pago_tarjeta ? tj : 0),
  } as RenglonNomina;
}

// 3. Guardar el monto de tarjeta por defecto en el perfil del empleado
export const guardarTarjetaDefecto = async (empleadoId: number, monto: number) => {
  const { error } = await supabase.from('empleados').update({ monto_tarjeta_defecto: monto }).eq('id', empleadoId);
  if (error) throw new Error(error.message);
}

// 4. Obtener todos los empleados para el selector de "Extras" (CON ESCUDO)
export const getTodosEmpleadosExtras = async (fechaPago: string) => {
  const { data, error } = await supabase
    .from('empleados')
    .select('id, nombre, apellidos, dia_pago')
    .eq('estado', 'activo')
    .is('deleted_at', null)
    .order('nombre', { ascending: true });
    
  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return [];

  // Escudo Anti-Dobles Pagos para el Selector
  const fechaObj = new Date(fechaPago + 'T12:00:00');
  const fechaInicio = new Date(fechaObj); 
  fechaInicio.setDate(fechaInicio.getDate() - 3);
  const fechaFin = new Date(fechaObj); 
  fechaFin.setDate(fechaFin.getDate() + 3);

  const empleadoIds = data.map(e => e.id);

  const { data: nominasPrevias } = await supabase
    .from('registros_nomina')
    .select('empleado_id')
    .in('empleado_id', empleadoIds)
    .gte('fecha_pago', fechaInicio.toISOString().split('T')[0])
    .lte('fecha_pago', fechaFin.toISOString().split('T')[0]);

  const idsYaPagados = nominasPrevias?.map(n => n.empleado_id) || [];

  return data.filter(emp => !idsYaPagados.includes(emp.id));
}

// 5. Guardado Final en BD
export const guardarNominaMasiva = async (
  diaPago: string, 
  periodoInicio: string, 
  periodoFin: string, 
  fechaPago: string, 
  renglones: RenglonNomina[]
) => {
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
      
      const { data: prestamo } = await supabase
        .from('prestamos')
        .select('saldo_restante, pagos_realizados, omitir_siguiente_nomina')
        .eq('id', renglon.prestamo_activo_id)
        .single();

      if (prestamo) {
        let nuevoSaldo = prestamo.saldo_restante;
        let pagoRealizadoExitoso = false;

        // Solo restamos el saldo y creamos el recibo si realmente se cobró dinero (> 0)
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

        // Se haya cobrado o no (por si estaba pausado), actualizamos el préstamo
        // para DES-PAUSARLO (omitir_siguiente_nomina: false) y dejarlo listo para la otra semana.
        await supabase.from('prestamos')
          .update({
            saldo_restante: nuevoSaldo,
            pagos_realizados: prestamo.pagos_realizados + (pagoRealizadoExitoso ? 1 : 0),
            estado: nuevoSaldo <= 0 ? 'completado' : 'activo',
            fecha_finalizacion_real: nuevoSaldo <= 0 ? new Date().toISOString().split('T')[0] : null,
            omitir_siguiente_nomina: false // <-- DES-PAUSADO AUTOMÁTICO MAGISTRAL
          })
          .eq('id', renglon.prestamo_activo_id);
      }
    }
  }
}

/**
 * Obtiene un resumen de las nóminas pagadas agrupadas por fecha.
 */
export const getHistorialResumen = async () => {
  const { data, error } = await supabase
    .from('registros_nomina')
    .select('fecha_pago, sueldo_base, pago_neto')
    .is('deleted_at', null)
    .order('fecha_pago', { ascending: false });

  if (error) throw error;

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
 * Obtiene el desglose detallado de todos los empleados pagados en una fecha específica.
 */
export const getDetalleNominaPorFecha = async (fecha: string) => {
  const { data, error } = await supabase
    .from('registros_nomina')
    .select(`
      *,
      empleados ( nombre, apellidos, areas!empleados_area_id_fkey(nombre) )
    `)
    .eq('fecha_pago', fecha)
    .is('deleted_at', null);

  if (error) throw error;
  return data;
}

// 6. Consultar nómina ya guardada (Modo Solo Lectura)
export const getNominaGuardada = async (diaPago: string, fechaPago: string) => {
  const { data, error } = await supabase
    .from('registros_nomina')
    .select(`
      *,
      empleados!inner (id, nombre, apellidos, foto_perfil_url, dia_pago, recibe_pago_tarjeta, monto_tarjeta_defecto) 
    `)
    .eq('fecha_pago', fechaPago)
    .ilike('empleados.dia_pago', `%${diaPago}%`)
    .is('deleted_at', null);

  if (error) throw new Error(error.message);
  if (!data || data.length === 0) return [];

  return data.map(r => ({
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
}