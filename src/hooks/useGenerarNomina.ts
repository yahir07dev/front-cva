import { useState, useMemo, useEffect } from 'react'
import { 
  getDatosPorDiaDePago, 
  getEmpleadoParaAgregar, 
  guardarTarjetaDefecto, 
  getTodosEmpleadosExtras, 
  guardarNominaMasiva,
  getNominaGuardada,
  RenglonNomina 
} from '@/src/services/generarNominaService'

// NUEVA INTERFAZ PARA LA CALCULADORA (Casos Especiales)
export interface ValoresCalculadora {
  diasNormales: number;
  descanso: number;
  diasExtra: number;
  mediosTurnos: number;
  horas: number;
  diasEspeciales: number;
  precioEspecial: number;
}

export function useGenerarNomina() {
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [renglones, setRenglones] = useState<RenglonNomina[]>([])
  
  // ESTADO: Candado de solo lectura
  const [isReadOnly, setIsReadOnly] = useState(false)
  
  // Listas para los selectores
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState<any[]>([])
  const [fechasDisponibles, setFechasDisponibles] = useState<{ fecha: string, diaSemana: string, etiqueta: string }[]>([])
  
  const [fechaActual, setFechaActual] = useState<string>('')

  // 1. Generar Sábados y Domingos
  useEffect(() => {
    const fechas = [];
    const hoy = new Date();
    const mesPasado = new Date(hoy.getFullYear(), hoy.getMonth() - 1, 1);
    const finMesActual = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);

    for (let d = new Date(mesPasado); d <= finMesActual; d.setDate(d.getDate() + 1)) {
      if (d.getDay() === 6 || d.getDay() === 0) {
        const fechaStr = d.toISOString().split('T')[0];
        const esSabado = d.getDay() === 6;
        fechas.push({
          fecha: fechaStr,
          diaSemana: esSabado ? 'Sábado' : 'Domingo',
          etiqueta: `${esSabado ? 'Sábado' : 'Domingo'}, ${d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}`
        });
      }
    }
    setFechasDisponibles(fechas.reverse());
  }, []);
  
  // 2. Cargar el grupo de empleados y activar/desactivar el candado
  const cargarGrupo = async (fechaPago: string) => {
    if (!fechaPago) return;
    setLoading(true);
    setFechaActual(fechaPago);
    try {
      const fechaObj = new Date(fechaPago + 'T12:00:00'); 
      const diaString = fechaObj.getDay() === 6 ? 'Sábado' : 'Domingo';

      // Verificar si ya existe una nómina guardada para esta fecha y grupo
      const guardados = await getNominaGuardada(diaString, fechaPago);

      if (guardados && guardados.length > 0) {
        // MODO LECTURA
        setRenglones(guardados);
        setIsReadOnly(true);
        setEmpleadosDisponibles([]);
      } else {
        // MODO EDICIÓN
        const [datos, extras] = await Promise.all([
          getDatosPorDiaDePago(diaString, fechaPago),
          getTodosEmpleadosExtras(fechaPago)
        ]);
        setRenglones(datos);
        setEmpleadosDisponibles(extras);
        setIsReadOnly(false);
      }
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  // 3. Agregar Extra
  const agregarEmpleadoExtra = async (empleadoId: number) => {
    if (renglones.find(r => r.empleado_id === empleadoId)) return alert("Ya está en la lista.");
    try {
      const extra = await getEmpleadoParaAgregar(empleadoId);
      setRenglones(prev => [...prev, extra]);
    } catch (e) {
      console.error(e);
    }
  }

  // 4. NUEVA CALCULADORA MATEMÁTICA (Soporta tarifas fijas y días extra de descanso)
  const calcularSueldoAsistencia = (sueldoBase: number, vals: ValoresCalculadora) => {
    const pagoDia = sueldoBase / 7;
    const pagoHora = pagoDia / 8;

    const totalNormales = vals.diasNormales * pagoDia;
    const totalDescanso = vals.descanso * pagoDia;
    const totalDiasExtra = vals.diasExtra * pagoDia; // Días de descanso trabajados (Pedrito)
    const totalMedios = vals.mediosTurnos * (5 * pagoHora); // Medio turno = 5 horas (Juanito/Yahir)
    const totalHoras = vals.horas * pagoHora; 
    const totalEspeciales = vals.diasEspeciales * vals.precioEspecial; // Días pagados a tarifa fija (Yahir)

    const totalBruto = totalNormales + totalDescanso + totalDiasExtra + totalMedios + totalHoras + totalEspeciales;
    
    // Regla de redondeo de 50 en 50
    return Math.round(totalBruto / 50) * 50; 
  }

  // Función actualizada para recibir el objeto ValoresCalculadora
  const aplicarCalculadora = (empleadoId: number, valores: ValoresCalculadora) => {
    setRenglones(prev => prev.map(renglon => {
      if (renglon.empleado_id === empleadoId) {
        const nuevoSueldo = calcularSueldoAsistencia(renglon.sueldo_base, valores);
        return recalcularRenglon({ ...renglon, sueldo_calculado: nuevoSueldo });
      }
      return renglon;
    }))
  }

  // 5. Edición manual
  const handleChangeCelda = (empleadoId: number, campo: keyof RenglonNomina, valor: number) => {
    setRenglones(prev => prev.map(renglon => {
      if (renglon.empleado_id === empleadoId) {
        return recalcularRenglon({ ...renglon, [campo]: valor });
      }
      return renglon;
    }))
  }

  const recalcularRenglon = (renglon: RenglonNomina) => {
    renglon.pago_neto = Number(renglon.sueldo_calculado) - Number(renglon.descuento_prestamo) - Number(renglon.descuento_anticipo) - Number(renglon.descuento_tarjeta);
    return renglon;
  }

  // 6. Tarjeta
  const guardarTarjeta = async (empleadoId: number, monto: number) => {
    try {
      await guardarTarjetaDefecto(empleadoId, monto);
      alert("Monto de tarjeta guardado por defecto.");
    } catch (e) {
      alert("Error al guardar tarjeta.");
    }
  }

  // 7. Guardar Definitivo
  const handleGuardarNomina = async () => {
    if (!fechaActual || renglones.length === 0) return alert("No hay datos para guardar.");
    
    setGuardando(true);
    try {
      const fechaObj = new Date(fechaActual + 'T12:00:00');
      const diaString = fechaObj.getDay() === 6 ? 'Sábado' : 'Domingo';

      const finPeriodo = new Date(fechaObj);
      const inicioPeriodo = new Date(fechaObj);
      inicioPeriodo.setDate(inicioPeriodo.getDate() - 6);

      await guardarNominaMasiva(
        diaString,
        inicioPeriodo.toISOString().split('T')[0],
        finPeriodo.toISOString().split('T')[0],
        fechaActual,
        renglones
      );

      // ACTIVAR CANDADO EN LUGAR DE BORRAR LA TABLA
      setIsReadOnly(true);

    } catch (error: any) {
      alert(error.message);
    } finally {
      setGuardando(false);
    }
  }

  const totales = useMemo(() => {
    return renglones.reduce((acc, curr) => ({
      sueldosGenerados: acc.sueldosGenerados + curr.sueldo_calculado,
      prestamos: acc.prestamos + curr.descuento_prestamo,
      anticipos: acc.anticipos + curr.descuento_anticipo,
      tarjetas: acc.tarjetas + curr.descuento_tarjeta,
      pagoNetoEfectivo: acc.pagoNetoEfectivo + curr.pago_neto,
    }), { sueldosGenerados: 0, prestamos: 0, anticipos: 0, tarjetas: 0, pagoNetoEfectivo: 0 })
  }, [renglones])

  return {
    loading, guardando, renglones, totales, 
    empleadosDisponibles, fechasDisponibles, fechaActual, isReadOnly,
    cargarGrupo, agregarEmpleadoExtra, handleChangeCelda, 
    aplicarCalculadora, guardarTarjeta, handleGuardarNomina
  }
}