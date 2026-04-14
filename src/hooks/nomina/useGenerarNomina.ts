import { useState, useEffect } from 'react'
import { RenglonNomina } from '@/src/services/nomina/generarNominaService'
import { 
  cargarNominaPorFechaAction, 
  getEmpleadoExtraAction, 
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
  diasFeriados: number; // 🚀 NUEVO CAMPO
}

export function useGenerarNomina() {
  const [loading, setLoading] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [renglones, setRenglones] = useState<RenglonNomina[]>([])
  const [isReadOnly, setIsReadOnly] = useState(false)
  const [empleadosDisponibles, setEmpleadosDisponibles] = useState<any[]>([])
  const [fechasDisponibles, setFechasDisponibles] = useState<{ fecha: string, diaSemana: string, etiqueta: string }[]>([])
  const [fechaActual, setFechaActual] = useState<string>('')

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

  const agregarEmpleadoExtra = async (empleadoId: number) => {
    if (renglones.find(r => r.empleado_id === empleadoId)) return alert("Ya está en la lista.");
    try {
      const extra = await getEmpleadoExtraAction(empleadoId);
      setRenglones(prev => [...prev, extra]);
    } catch (e) {
      console.error(e);
    }
  }

  const quitarEmpleado = (empleadoId: number) => {
    const empleadoQuitado = renglones.find(r => r.empleado_id === empleadoId);
    if (!empleadoQuitado) return;

    setRenglones(prev => prev.filter(r => r.empleado_id !== empleadoId));

    setEmpleadosDisponibles(prev => [
      ...prev, 
      {
        id: empleadoQuitado.empleado_id,
        nombre: empleadoQuitado.nombre_completo.split(' ')[0], 
        apellidos: empleadoQuitado.nombre_completo.split(' ').slice(1).join(' ').replace(' (Extra)', ''),
        dia_pago: 'Reasignado' 
      }
    ]);
  }

  const calcularSueldoAsistencia = (sueldoBase: number, vals: ValoresCalculadora) => {
    const pagoDia = sueldoBase / 7;
    const pagoHora = pagoDia / 8;
    const totalNormales = vals.diasNormales * pagoDia;
    let totalDescanso = vals.descanso === 1 ? pagoDia : vals.descanso === 0.5 ? (5 * pagoHora) : 0;
    const totalDiasExtra = vals.diasExtra * pagoDia; 
    
    // 🚀 LÓGICA DE DÍA FERIADO: 
    // Por ley, si trabajan en feriado se paga su sueldo normal + un día extra (el doble)
    // Entonces sumamos los días feriados trabajados multiplicados por el pago de un día.
    const totalFeriados = (vals.diasFeriados || 0) * pagoDia; 

    const totalMedios = vals.mediosTurnos * (5 * pagoHora); 
    const totalHoras = vals.horas * pagoHora; 
    const totalEspeciales = vals.diasEspeciales * vals.precioEspecial; 
    
    const totalBruto = totalNormales + totalDescanso + totalDiasExtra + totalFeriados + totalMedios + totalHoras + totalEspeciales;
    return Math.round(totalBruto / 50) * 50; 
  }

  const recalcularRenglon = (renglon: RenglonNomina) => {
    const percepciones = Number(renglon.sueldo_calculado) + Number(renglon.bonos || 0);
    const deducciones = Number(renglon.descuento_prestamo) + Number(renglon.otros_descuentos || 0) + Number(renglon.descuento_tarjeta);
    const netoReal = percepciones - deducciones;

    if (netoReal < 0) {
      renglon.pago_neto = 0;
      renglon.deuda_generada = Math.abs(netoReal);
    } else {
      renglon.pago_neto = netoReal;
      renglon.deuda_generada = 0;
    }
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

  const handleGuardarNomina = async () => {
    if (!fechaActual || renglones.length === 0) return alert("No hay datos para guardar.");
    setGuardando(true);
    try {
      const fechaObj = new Date(fechaActual + 'T12:00:00');
      const diaString = fechaObj.getDay() === 6 ? 'Sábado' : 'Domingo';
      const finPeriodo = new Date(fechaObj);
      const inicioPeriodo = new Date(fechaObj);
      inicioPeriodo.setDate(inicioPeriodo.getDate() - 6);
      await guardarNominaAction(diaString, inicioPeriodo.toISOString().split('T')[0], finPeriodo.toISOString().split('T')[0], fechaActual, renglones);
      setIsReadOnly(true);
    } catch (error: any) {
      alert(error.message);
    } finally {
      setGuardando(false);
    }
  }

  return {
    loading, guardando, renglones, empleadosDisponibles, fechasDisponibles, fechaActual, isReadOnly,
    cargarGrupo, agregarEmpleadoExtra, quitarEmpleado, handleChangeCelda, aplicarCalculadora, handleGuardarNomina
  }
}