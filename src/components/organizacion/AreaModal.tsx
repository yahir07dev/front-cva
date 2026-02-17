'use client'

import { X } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AreaModal({ isOpen, onClose, onSubmit, initialData, empleados = [] }: any) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [encargadoId, setEncargadoId] = useState<string>('')

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setNombre(initialData.nombre)
        setDescripcion(initialData.descripcion || '')
        setEncargadoId(initialData.encargado_id ? initialData.encargado_id.toString() : '')
      } else {
        setNombre('')
        setDescripcion('')
        setEncargadoId('')
      }
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    const idFinal = encargadoId ? parseInt(encargadoId) : null
    await onSubmit(nombre, descripcion, idFinal)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-neutral-950 w-full max-w-md rounded-3xl p-8 border border-neutral-200/50 dark:border-0 shadow-2xl scale-in-center">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {initialData ? 'Editar Área' : 'Nueva Área'}
          </h2>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-neutral-100 dark:hover:bg-white/5 rounded-full transition-colors text-neutral-500 dark:text-neutral-400"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold uppercase ml-1 mb-2 block text-neutral-500 dark:text-neutral-400">Nombre</label>
            <input 
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              placeholder="Ej: Abarrotes"
              className="w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/50 dark:border-0 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
            />
          </div>
          
          <div>
            <label className="text-xs font-bold uppercase ml-1 mb-2 block text-neutral-500 dark:text-neutral-400">Encargado (Jefe de Área)</label>
            <select 
              value={encargadoId}
              onChange={(e) => setEncargadoId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/50 dark:border-0 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer text-neutral-900 dark:text-white"
            >
              <option value="" className="bg-white dark:bg-neutral-900 text-neutral-500">-- Sin Encargado --</option>
              {empleados.map((emp: any) => (
                <option 
                  key={emp.id} 
                  value={emp.id}
                  className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white"
                >
                  {emp.nombre} {emp.apellidos}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold uppercase ml-1 mb-2 block text-neutral-500 dark:text-neutral-400">Descripción</label>
            <textarea 
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Funciones principales..."
              className="w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/50 dark:border-0 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            {initialData ? 'Guardar Cambios' : 'Crear Departamento'}
          </button>
        </form>
      </div>
    </div>
  )
}