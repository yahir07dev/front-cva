'use client'

import React, { useEffect, useState, useRef, useMemo } from 'react'
import { X, ChevronDown, Check } from 'lucide-react'

interface AreaModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (nombre: string, descripcion: string, encargadoId: number | null) => Promise<void>
  initialData?: any
  empleados?: any[]
}

export default function AreaModal({ isOpen, onClose, onSubmit, initialData, empleados = [] }: AreaModalProps) {
  const [nombre, setNombre] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [encargadoId, setEncargadoId] = useState<string>('')
  
  // Estados y referencias para nuestro selector personalizado
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cerrar el dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen])

  // Inicializar datos al abrir
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
      setIsDropdownOpen(false) // Asegurarse de que el dropdown esté cerrado al abrir el modal
    }
  }, [isOpen, initialData])

  // 🚀 Micro-optimización: Evitamos buscar todo el array en cada tecla presionada en 'nombre'
  const textoEncargado = useMemo(() => {
    const encargadoSeleccionado = empleados.find((e: any) => e.id.toString() === encargadoId)
    return encargadoSeleccionado 
      ? `${encargadoSeleccionado.nombre} ${encargadoSeleccionado.apellidos}`
      : '-- Sin Encargado --'
  }, [empleados, encargadoId])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const idFinal = encargadoId ? parseInt(encargadoId) : null
    await onSubmit(nombre, descripcion, idFinal)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white dark:bg-neutral-950 w-full max-w-md rounded-3xl p-8 border border-neutral-200/50 dark:border-neutral-800/80 shadow-2xl scale-in-center animate-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {initialData ? 'Editar Área' : 'Nueva Área'}
          </h2>
          <button 
            type="button"
            onClick={onClose} 
            className="p-2 hover:bg-neutral-100 dark:hover:bg-white/10 rounded-full transition-colors text-neutral-500 dark:text-neutral-400"
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
              className="w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/50 dark:border-neutral-800/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
            />
          </div>
          
          {/* ========================================================= */}
          {/* SELECTOR DE ENCARGADO PERSONALIZADO                       */}
          {/* ========================================================= */}
          <div className="relative" ref={dropdownRef}>
            <label className="text-xs font-bold uppercase ml-1 mb-2 block text-neutral-500 dark:text-neutral-400">
              Encargado (Jefe de Área)
            </label>
            
            {/* Botón que simula el input */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`
                w-full px-4 py-3 rounded-2xl flex items-center justify-between transition-all outline-none border
                ${isDropdownOpen 
                  ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-500/30 ring-2 ring-blue-500/20 text-neutral-900 dark:text-white' 
                  : 'bg-neutral-100 dark:bg-white/5 border-neutral-200/50 dark:border-neutral-800/50 text-neutral-900 dark:text-white hover:bg-neutral-200/50 dark:hover:bg-white/10'
                }
              `}
            >
              <span className={`block truncate ${!encargadoId ? 'text-neutral-500 dark:text-neutral-400' : 'font-semibold'}`}>
                {textoEncargado}
              </span>
              <ChevronDown 
                size={18} 
                className={`shrink-0 text-neutral-400 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-blue-500' : ''}`} 
              />
            </button>

            {/* Menú Desplegable Flotante */}
            {isDropdownOpen && (
              <div className="absolute z-20 w-full mt-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="max-h-56 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-neutral-200 dark:scrollbar-thumb-neutral-800">
                  
                  {/* Opción: Sin Encargado */}
                  <button
                    type="button"
                    onClick={() => { setEncargadoId(''); setIsDropdownOpen(false); }}
                    className="w-full flex items-center justify-between px-4 py-3 text-sm text-left text-neutral-500 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-white/5 transition-colors"
                  >
                    <span>-- Sin Encargado --</span>
                    {encargadoId === '' && <Check size={16} className="text-blue-500" />}
                  </button>

                  {/* Lista de Empleados */}
                  {empleados.map((emp: any) => {
                    const isSelected = encargadoId === emp.id.toString();
                    return (
                      <button
                        key={emp.id}
                        type="button"
                        onClick={() => { setEncargadoId(emp.id.toString()); setIsDropdownOpen(false); }}
                        className={`
                          w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors
                          ${isSelected ? 'bg-blue-50/50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold' : 'text-neutral-900 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-white/5'}
                        `}
                      >
                        <span className="truncate">{emp.nombre} {emp.apellidos}</span>
                        {isSelected && <Check size={16} className="text-blue-500 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold uppercase ml-1 mb-2 block text-neutral-500 dark:text-neutral-400">Descripción</label>
            <textarea 
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={3}
              placeholder="Funciones principales..."
              className="w-full px-4 py-3 rounded-2xl bg-neutral-100 dark:bg-white/5 border border-neutral-200/50 dark:border-neutral-800/50 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600"
            />
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 active:scale-[0.98] mt-4"
          >
            {initialData ? 'Guardar Cambios' : 'Crear Departamento'}
          </button>
        </form>
      </div>
    </div>
  )
}