'use client'

import { Search, Wallet } from 'lucide-react'

interface ConfigNominaHeaderProps {
  searchTerm: string
  setSearchTerm: (val: string) => void
  totalEmpleados: number
}

export default function ConfigNominaHeader({ searchTerm, setSearchTerm, totalEmpleados }: ConfigNominaHeaderProps) {
  return (
    <div className="
      flex flex-col sm:flex-row sm:items-center justify-between gap-5 mb-8
      bg-white/60 dark:bg-neutral-900/50 backdrop-blur-sm 
      border border-emerald-200/30 dark:border-emerald-900/30 
      rounded-3xl p-5 shadow-sm
    ">
      {/* Título e ícono */}
      <div className="flex items-center gap-4">
        <div className="
          flex h-12 w-12 items-center justify-center rounded-2xl 
          bg-emerald-500/10 dark:bg-emerald-600/15 
          ring-1 ring-emerald-200/30 dark:ring-emerald-900/30
        ">
          <Wallet size={24} className="text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-neutral-900 dark:text-white">
            Configuración de Nómina
          </h1>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400 mt-1">
            Sueldos, días de pago y método • {totalEmpleados} empleados registrados
          </p>
        </div>
      </div>

      {/* Buscador moderno */}
      <div className="relative w-full sm:w-80 group">
        <Search 
          className="
            absolute left-4 top-1/2 -translate-y-1/2 
            text-neutral-400 group-focus-within:text-emerald-600 
            transition-colors duration-200
          " 
          size={18} 
        />
        <input
          type="text"
          placeholder="Buscar empleado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="
            w-full pl-11 pr-5 py-3.5 
            rounded-2xl bg-white/50 dark:bg-neutral-950/40 
            border border-emerald-200/40 dark:border-emerald-900/30
            text-sm font-medium text-neutral-900 dark:text-white
            placeholder:text-neutral-400/70
            outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20
            transition-all duration-200 hover:border-emerald-400/60
          "
        />
      </div>
    </div>
  )
}