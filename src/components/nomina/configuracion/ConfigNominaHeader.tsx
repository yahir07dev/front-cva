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
      flex-none sticky top-0 z-10
      bg-neutral-50/90 dark:bg-neutral-950/90 backdrop-blur-xl
      px-4 md:px-6 py-4
    ">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-6xl mx-auto">

        {/* Título */}
        <div className="flex items-center gap-3">
          <div className="
            flex h-10 w-10 items-center justify-center rounded-xl
            bg-emerald-500/10 dark:bg-emerald-600/15
          ">
            <Wallet size={20} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
              Configuración de Nómina
            </h1>
            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              <Users size={14} />
              {totalEmpleados} empleados
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative w-full sm:w-72">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors"
            size={16}
          />
          <input
            type="text"
            placeholder="Buscar empleado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
              w-full pl-10 pr-4 py-2.5 rounded-xl
              bg-white/70 dark:bg-neutral-900/70 backdrop-blur-sm
              border border-emerald-200/40 dark:border-emerald-900/40
              text-sm font-medium outline-none
              focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20
              transition-all placeholder:text-neutral-400/70 hover:border-emerald-400/60
            "
          />
        </div>

      </div>
    </div>
  )
}