// src/hooks/nomina/useGenerarNomina.ts
import { useState, useEffect } from 'react' // <- useMemo eliminado de los imports
import { RenglonNomina } from '@/src/services/nomina/generarNominaService'
import { 
  cargarNominaPorFechaAction, 
  getEmpleadoExtraAction, 
  guardarTarjetaAction, 
  guardarNominaAction 
} from '@/src/actions/nomina/generarActions'

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
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState<any[]>([])
  const [fechasDisponibles, setFechasDisponibles] = useState<{ fecha: string, diaSemana: string, etiqueta: string }[]>([])
  const [fechaActual, setFechaActual] = useState<string>('')

  // 1. Fechas pre-calculadas (Sábados y Domingos del mes anterior y actual)
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
  
  // 2. Carga principal de nómina desde el servidor (Action)
  const cargarGrupo = async (fechaPago: string) => {
    if (!fechaPago) return;
    setLoading(true);
    setFechaActual(fechaPago);
    
    try {
      const fechaObj = new Date(fechaPago + 'T12:00:00'); 
      const diaString = fechaObj.getDay() === 6 ? 'Sábado' : 'Domingo';

      const res = await cargarNominaPorFechaAction(fechaPago, diaString);
      
      setRenglones(res.renglones);
      setEmpleadosDisponibles(res.empleadosExtras);
      setIsReadOnly(res.isReadOnly);
    } catch (error: any) {
      alert("Error al cargar datos: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // 3. Funciones de manipulación de la tabla
  const agregarEmpleadoExtra = async (empleadoId: number) => {
    if (renglones.find(r => r.empleado_id === empleadoId)) return alert("Ya está en la lista.");
    try {
      const extra = await getEmpleadoExtraAction(empleadoId);
      setRenglones(prev => [...prev, extra]);
    } catch (e) {
      console.error(e);
    }
  }

  const calcularSueldoAsistencia = (sueldoBase: number, vals: ValoresCalculadora) => {
    const pagoDia = sueldoBase / 7;
    const pagoHora = pagoDia / 8;
    const totalNormales = vals.diasNormales * pagoDia;
    let totalDescanso = vals.descanso === 1 ? pagoDia : vals.descanso === 0.5 ? (5 * pagoHora) : 0;
    const totalDiasExtra = vals.diasExtra * pagoDia; 
    const totalMedios = vals.mediosTurnos * (5 * pagoHora); 
    const totalHoras = vals.horas * pagoHora; 
    const totalEspeciales = vals.diasEspeciales * vals.precioEspecial; 

    const totalBruto = totalNormales + totalDescanso + totalDiasExtra + totalMedios + totalHoras + totalEspeciales;
    return Math.round(totalBruto / 50) * 50; 
  }

  const recalcularRenglon = (renglon: RenglonNomina) => {
    renglon.pago_neto = Number(renglon.sueldo_calculado) - Number(renglon.descuento_prestamo) - Number(renglon.descuento_anticipo) - Number(renglon.descuento_tarjeta);
    return renglon;
  }

  const aplicarCalculadora = (empleadoId: number, valores: ValoresCalculadora) => {
    setRenglones(prev => prev.map(renglon => {
      if (renglon.empleado_id === empleadoId) {
        const nuevoSueldo = calcularSueldoAsistencia(renglon.sueldo_base, valores);
        return recalcularRenglon({ ...renglon, sueldo_calculado: nuevoSueldo });
      }
      return renglon;
    }))
  }

  const handleChangeCelda = (empleadoId: number, campo: keyof RenglonNomina, valor: number) => {
    setRenglones(prev => prev.map(renglon => {
      if (renglon.empleado_id === empleadoId) {
        return recalcularRenglon({ ...renglon, [campo]: valor });
      }
      return renglon;
    }))
  }

  // 4. Acciones a la Base de Datos
  const guardarTarjeta = async (empleadoId: number, monto: number) => {
    try {
      await guardarTarjetaAction(empleadoId, monto);
      alert("Monto de tarjeta guardado por defecto.");
    } catch (e) {
      alert("Error al guardar tarjeta.");
    }
  }

  const handleGuardarNomina = async () => {
    if (!fechaActual || renglones.length === 0) return alert("No hay datos para guardar.");
    setGuardando(true);
    
    try {
      const fechaObj = new Date(fechaActual + 'T12:00:00');
      const diaString = fechaObj.getDay() === 6 ? 'Sábado' : 'Domingo';
      const finPeriodo = new Date(fechaObj);
      const inicioPeriodo = new Date(fechaObj);
      inicioPeriodo.setDate(inicioPeriodo.getDate() - 6);

      await guardarNominaAction(
        diaString,
        inicioPeriodo.toISOString().split('T')[0],
        finPeriodo.toISOString().split('T')[0],
        fechaActual,
        renglones
      );

      // Una vez guardada con éxito, la bloqueamos
      setIsReadOnly(true);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setGuardando(false);
    }
  }

  // 5. Retorno limpio
  return {
    loading, 
    guardando, 
    renglones, 
    // totales, <-- ELIMINADO DE AQUÍ
    empleadosDisponibles, 
    fechasDisponibles, 
    fechaActual, 
    isReadOnly,
    cargarGrupo, 
    agregarEmpleadoExtra, 
    handleChangeCelda, 
    aplicarCalculadora, 
    guardarTarjeta, 
    handleGuardarNomina
  }
}