'use client'

import { useState, useEffect, useRef } from 'react'
import { X, Save, User, Camera, Loader2 } from 'lucide-react'
import { actualizarMiPerfil } from '@/src/services/empleados/perfilService'

interface ModalEditarPerfilProps {
  isOpen: boolean
  onClose: () => void
  usuarioActual: {
    nombre: string
    apellidos: string
    foto_perfil_url: string
  }
  onActualizado: () => void 
}

export default function ModalEditarPerfil({ isOpen, onClose, usuarioActual, onActualizado }: ModalEditarPerfilProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    nombre: '',
    apellidos: ''
  })
  
  // Estados para manejar la imagen
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && usuarioActual) {
      setForm({
        nombre: usuarioActual.nombre || '',
        apellidos: usuarioActual.apellidos || ''
      })
      setPreviewUrl(usuarioActual.foto_perfil_url || '')
      setArchivoSeleccionado(null)
    }
  }, [isOpen, usuarioActual])

  if (!isOpen) return null

  const getInitials = () => `${form.nombre?.[0] || ''}${form.apellidos?.[0] || ''}`.toUpperCase()

  // Función para manejar cuando el usuario elige una foto de su PC/Celular
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // Limitar a 5MB
        alert("La imagen es muy pesada. Por favor elige una menor a 5MB.")
        return
      }
      setArchivoSeleccionado(file)
      // Generar una URL temporal para que vea cómo quedó la foto
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.apellidos.trim()) {
      alert("El nombre y apellido son obligatorios.")
      return
    }

    setLoading(true)
    try {
      await actualizarMiPerfil({
        nombre: form.nombre,
        apellidos: form.apellidos,
        archivoFoto: archivoSeleccionado // Pasamos el archivo físico al servicio
      })
      onActualizado() 
      onClose()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
      />

      {/* Modal NEUTRO */}
      <div className="relative w-full max-w-sm bg-white dark:bg-neutral-900 rounded-3xl shadow-2xl shadow-black/40 overflow-hidden animate-in zoom-in-95 fade-in duration-300 border border-neutral-200 dark:border-neutral-800">
        
        {/* Cabecera Neutra en lugar de gradiente de colores */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-neutral-100 dark:bg-neutral-950 border-b border-neutral-200 dark:border-neutral-800" />

        {/* Botón Cerrar (Asegurado con type="button") */}
        <button 
          type="button" 
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 p-2 rounded-full bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all active:scale-95 z-20 shadow-sm"
        >
          <X size={16} />
        </button>

        <div className="px-6 pt-10 pb-6 relative z-10">
          
          {/* Avatar Subida de Archivo */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="relative group">
              <div className="relative w-24 h-24 rounded-full overflow-hidden ring-4 ring-white dark:ring-neutral-900 shadow-xl bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center transition-all group-hover:ring-neutral-200 dark:group-hover:ring-neutral-700">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Vista previa" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => { (e.target as HTMLImageElement).src = ''; setPreviewUrl('') }}
                  />
                ) : (
                  <span className="text-2xl font-black text-neutral-400">
                    {getInitials() || <User size={32} />}
                  </span>
                )}

                {/* Overlay negro al pasar el mouse para indicar que se puede cambiar */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera size={24} />
                </div>
              </div>
              
              {/* Botón visual debajo de la foto */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 text-[10px] font-bold px-3 py-1 rounded-full shadow-md border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
              >
                Cambiar
              </button>

              {/* Input de archivo Oculto */}
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/jpg, image/webp" 
                className="hidden"
              />
            </div>
          </div>

          <div className="text-center mb-6 mt-4">
            <h2 className="text-xl font-black text-neutral-900 dark:text-white">Mi Perfil</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Sube una foto y actualiza tu nombre</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 ml-1">Nombre (s)</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
                <input
                  type="text"
                  required
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm font-semibold text-neutral-900 dark:text-white focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/20 outline-none transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 ml-1">Apellidos</label>
              <input
                type="text"
                required
                value={form.apellidos}
                onChange={e => setForm({ ...form, apellidos: e.target.value })}
                className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm font-semibold text-neutral-900 dark:text-white focus:border-neutral-900 dark:focus:border-white focus:ring-1 focus:ring-neutral-900/20 outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-neutral-900 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-900 font-bold py-3.5 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save size={18} />
                  <span>Guardar Perfil</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}