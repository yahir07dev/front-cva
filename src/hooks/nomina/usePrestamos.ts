import { useState, useEffect, useMemo, useCallback } from 'react'
import { createClient } from '@/src/lib/supabase/client'
import { NuevoPrestamo } from '@/src/services/nomina/prestamosService'
import { crearPrestamoAction, registrarAbonoPrestamoAction, togglePausarCobroAction } from '@/src/actions/nomina/prestamosActions'
import { useRouter } from 'next/navigation'

interface UsePrestamosProps {
  initialPrestamos: any[]
  initialEmpleados: any[]
}

export function usePrestamos({ initialPrestamos, initialEmpleados }: UsePrestamosProps) {
  const [supabase] = useState(() => createClient())
  const router = useRouter()
  
  const [prestamos, setPrestamos] = useState<any[]>(initialPrestamos)
  const [empleadosLista] = useState<any[]>(initialEmpleados)
  const [loading, setLoading] = useState(false)

  // 1. RE-FETCH SILENCIOSO PARA REALTIME
  const reFetchData = useCallback(async () => {
    const { data } = await supabase
      .from('prestamos')
      .select(`*, empleados!prestamos_empleado_id_fkey (id, nombre, apellidos, foto_perfil_url, areas!empleados_area_id_fkey(nombre))`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (data) setPrestamos(data)
  }, [supabase])

  // 2. REALTIME SUBSCRIPTION
  useEffect(() => {
    const channel = supabase.channel('prestamos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'prestamos' }, () => {
         reFetchData()
         router.refresh() // Actualiza el cache del SSR
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pagos_prestamo' }, () => {
         reFetchData()
      })
      .subscribe()
      
    return () => { supabase.removeChannel(channel) }
  }, [supabase, reFetchData, router])

  // 3. MUTACIONES USANDO SERVER ACTIONS
  const handleCrearPrestamo = async (datos: NuevoPrestamo) => {
    if (datos.monto_total <= 0) throw new Error("El monto debe ser mayor a 0.");
    if (!datos.empleado_id) throw new Error("Debes seleccionar un empleado.");

    setLoading(true);
    try {
      await crearPrestamoAction(datos);
      await reFetchData(); 
    } finally {
      setLoading(false);
    }
  }

  const handleAbonar = async (prestamoId: number, monto: number, omitir: boolean, motivo: string) => {
    setLoading(true);
    try {
      await registrarAbonoPrestamoAction(prestamoId, monto, omitir, motivo);
      await reFetchData(); 
    } finally {
      setLoading(false);
    }
  }

  const handleTogglePausa = async (prestamoId: number, estadoActual: boolean) => {
    setLoading(true);
    try {
      await togglePausarCobroAction(prestamoId, estadoActual);
      await reFetchData();
    } finally {
      setLoading(false);
    }
  }

  // 4. ESTADÍSTICAS
  const stats = useMemo(() => {
    const activos = prestamos.filter(p => p.estado === 'activo');
    const totalPrestado = activos.reduce((sum, p) => sum + Number(p.monto_total), 0);
    const totalRestante = activos.reduce((sum, p) => sum + Number(p.saldo_restante), 0);
    
    return {
      prestamosActivos: activos.length,
      dineroEnLaCalle: totalRestante,
      totalHistorico: prestamos.length
    }
  }, [prestamos])

  return {
    prestamos,
    empleadosLista,
    stats,
    loading,
    handleCrearPrestamo,
    handleAbonar,
    handleTogglePausa
  }
}