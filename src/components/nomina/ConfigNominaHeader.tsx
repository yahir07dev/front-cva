'use client'

import { Search, Wallet } from 'lucide-react'

interface ConfigNominaHeaderProps {
  searchTerm: string
  setSearchTerm: (val: string) => void
  totalEmpleados: number
}

export default function ConfigNominaHeader({ searchTerm, setSearchTerm, totalEmpleados }: ConfigNominaHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      {/* Título */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 dark:bg-orange-600/15">
          <Wallet size={24} className="text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
            Configuración de Nómina
          </h1>
          <p className="text-sm font-medium text-neutral-500">
            Sueldos, días de pago y método ({totalEmpleados} registrados)
          </p>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative group w-full sm:w-72">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-orange-500 transition-colors" size={18} />
        <input 
          type="text"
          placeholder="Buscar empleado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="
            w-full pl-11 pr-4 py-3 
            rounded-2xl bg-white dark:bg-neutral-900 
            border border-neutral-200 dark:border-neutral-800
            text-sm font-medium text-neutral-900 dark:text-white
            placeholder:text-neutral-400 shadow-sm
            outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50
            transition-all
          "
        />
      </div>
    </div>
  )
}