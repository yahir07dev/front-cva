import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { crearNuevaActividad } from '@/src/services/perfomance/performanceService'
import { PrioridadActividad } from '@/src/types/performance'

interface HookProps {
  initialEmpleados: any[]
  userEstado: string
  userId: string
}

export function useNuevaActividad({ initialEmpleados, userEstado, userId }: HookProps) {
  const router = useRouter()
  
  // Solo estados de UI y Mutación (Formulario)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [alerta, setAlerta] = useState({
    isOpen: false,
    titulo: '',
    descripcion: '',
    variant: 'warning' as 'warning' | 'danger' | 'info' | 'success'
  })

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'media' as PrioridadActividad,
    fechaLimite: '',
    asignados: [] as string[],
    archivoEvidencia: null as File | null, 
    previewUrl: '' as string
  })

  const mostrarAlerta = (titulo: string, descripcion: string, variant: 'warning'|'danger'|'info' = 'warning') => {
    setAlerta({ isOpen: true, titulo, descripcion, variant })
  }

  const cerrarAlerta = () => setAlerta(prev => ({ ...prev, isOpen: false }))

  const toggleEmpleado = (id: string) => {
    setForm(prev => ({
      ...prev,
      asignados: prev.asignados.includes(id)
        ? prev.asignados.filter(item => item !== id)
        : [...prev.asignados, id]
    }))
  }

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleFileChange = (file: File | null) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        mostrarAlerta('Archivo muy pesado', 'La imagen de referencia debe pesar menos de 5MB.', 'warning');
        return;
      }
      setForm(prev => ({ 
        ...prev, 
        archivoEvidencia: file, 
        previewUrl: URL.createObjectURL(file) 
      }));
    } else {
      setForm(prev => ({ ...prev, archivoEvidencia: null, previewUrl: '' }));
    }
  }

  const handleSubmit = async () => {
    if (userEstado === 'baja') {
      return mostrarAlerta('Acceso Denegado', 'Tu cuenta no está activa.', 'danger')
    }

    if (!form.titulo || !form.fechaLimite) {
      return mostrarAlerta('Campos Incompletos', 'Asegúrate de escribir un título y seleccionar la fecha límite.', 'warning')
    }

    if (form.asignados.length === 0) {
      return mostrarAlerta('Sin Asignaciones', 'Por favor, selecciona al menos un empleado para esta tarea.', 'warning')
    }

    setLoading(true)
    try {
      // Usamos el servicio que ya optimizamos con Cloudinary
      await crearNuevaActividad({
        titulo: form.titulo,
        descripcion: form.descripcion,
        prioridad: form.prioridad,
        fecha_limite: form.fechaLimite
      }, form.asignados, form.archivoEvidencia)

      setSuccess(true)
      
      setTimeout(() => {
        router.push('/dashboard/rendimiento/actividades') 
        router.refresh() // Refresca el caché del SSR de la lista
      }, 1500)
    } catch (error: any) {
      mostrarAlerta('Error del Servidor', error.message, 'danger')
    } finally {
      setLoading(false)
    }
  }

  return {
    form,
    loading,
    success,
    alerta,        
    cerrarAlerta,  
    toggleEmpleado,
    handleChange,
    handleFileChange,
    handleSubmit,
    router
  }
}