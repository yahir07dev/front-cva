'use client'

import { Search, Wallet, Users } from 'lucide-react'

interface ConfigNominaHeaderProps {
  searchTerm: string
  setSearchTerm: (val: string) => void
  totalEmpleados: number
}

export default function ConfigNominaHeader({ searchTerm, setSearchTerm, totalEmpleados }: ConfigNominaHeaderProps) {
  return (
    <div className="
      flex-none sticky top-0 z-20
      bg-neutral-50/80 dark:bg-neutral-950/80 backdrop-blur-xl
      px-4 md:px-8 py-5 md:py-6
      transition-colors duration-500
    ">
      {/* AQUÍ EL CAMBIO: w-full en lugar de max-w-7xl para expansión total */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 w-full">

        {/* Título y Estadísticas */}
        <div className="flex items-center gap-4">
          <div className="
            flex h-12 w-12 items-center justify-center rounded-2xl
            bg-emerald-500/10 text-emerald-600 dark:text-emerald-400
            shadow-sm
          ">
            <Wallet size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Configuración de Nómina
            </h1>
            <div className="flex items-center gap-2 text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-0.5">
              <Users size={16} />
              {totalEmpleados} empleados registrados
            </div>
          </div>
        </div>

        {/* Buscador Premium */}
        <div className="relative w-full md:w-80 lg:w-96 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-emerald-500 transition-colors duration-300"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar por nombre o puesto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full pl-12 pr-5 py-3.5 rounded-3xl
              bg-white/80 dark:bg-neutral-900/60 backdrop-blur-xl
              border border-neutral-200/60 dark:border-neutral-800/50
              text-sm font-medium text-neutral-900 dark:text-white outline-none
              hover:shadow-md hover:border-neutral-300 dark:hover:border-neutral-700
              focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10
              transition-all duration-300 placeholder:text-neutral-500
            "
          />
        </div>

      </div>
    </div>
  )
}