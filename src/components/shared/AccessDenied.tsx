// src/components/ui/AccessDenied.tsx
'use client'

import Link from 'next/link'
import { ShieldX, AlertTriangle, ArrowLeft } from 'lucide-react'

export default function AccessDenied({ message = "No tienes los permisos necesarios para acceder a esta sección." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-100px)] px-4">
      <div className="relative group">
        {/* Efecto de brillo de fondo */}
        <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-orange-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        
        <div className="relative h-24 w-24 bg-white dark:bg-[#15171e] rounded-full flex items-center justify-center shadow-xl">
          <ShieldX size={48} className="text-red-500" />
          <div className="absolute -bottom-2 -right-2 bg-red-100 dark:bg-red-900/30 p-2 rounded-full border-4 border-white dark:border-[#0f1117]">
            <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
          </div>
        </div>
      </div>

      <h1 className="mt-8 text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
        Acceso Denegado
      </h1>
      
      <p className="mt-4 text-center text-gray-500 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
        {message}
      </p>

      <div className="mt-8 flex gap-4">
        <Link 
          href="/dashboard"
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black font-bold text-sm transition-transform active:scale-95 hover:shadow-lg"
        >
          <ArrowLeft size={18} />
          Volver al Dashboard
        </Link>
      </div>
    </div>
  )
}