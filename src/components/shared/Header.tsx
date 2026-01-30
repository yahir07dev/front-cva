'use client'

import { useEffect, useState } from 'react'
// Ya no necesitamos importar useTheme para los colores, el CSS lo hace solo.
import { createClient } from '@/src/lib/supabase/client' 

export default function Header() {
  const supabase = createClient()
  
  // Estado local para los datos
  const [empleado, setEmpleado] = useState<any>(null)
  const [rolNombre, setRolNombre] = useState<string>('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          const { data } = await supabase
            .from('empleados')
            .select('nombre, apellidos, roles(nombre)')
            .eq('usuario_id', user.id)
            .single()

          if (data) {
            setEmpleado({ ...data, email: user.email })
            const rolData = data.roles as any
            const nombreRol = Array.isArray(rolData) ? rolData[0]?.nombre : rolData?.nombre
            setRolNombre(nombreRol || 'Sin Rol')
          }
        }
      } catch (error) {
        console.error('Error cargando header:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const getInitials = (name: string) => {
    if (!name) return 'U'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <header className="
      h-[72px] shrink-0 flex items-center mx-4 mt-4 mb-2
      rounded-xl z-40 transition-all duration-300
      pl-16 md:pl-6
      /* SOLUCIÓN: Clases directas de Tailwind */
      bg-white shadow-lg shadow-gray-200/50
      dark:bg-[#1a1d29] dark:shadow-gray-950/50
    ">
      <div className="w-full flex items-center justify-between px-6">
        
        {/* BUSCADOR */}
        <div className="flex-1 flex justify-center md:justify-start">
          <div className="relative max-w-md w-full">
            <input
              type="text"
              placeholder="Buscar..."
              className="
                w-full h-10 pl-4 pr-4 rounded-lg text-sm transition-colors
                focus:outline-none
                /* Estilos Modo Claro */
                bg-white text-gray-900 placeholder:text-gray-400 border border-gray-200 focus:border-gray-300
                /* Estilos Modo Oscuro (Se activan instantáneamente) */
                dark:bg-gray-950/50 dark:text-white dark:placeholder:text-gray-500 dark:border-gray-800 dark:focus:border-gray-700
              "
            />
          </div>
        </div>

        {/* PERFIL */}
        <div className="flex items-center gap-3 ml-6">
          {/* Separador vertical */}
          <div className="w-px h-8 hidden sm:block bg-gray-200 dark:bg-gray-800"></div>

          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className={`
              w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 
              flex items-center justify-center text-white font-semibold text-sm shadow-md shrink-0
              ${loading ? 'animate-pulse' : ''}
            `}>
              {loading ? '' : getInitials(empleado?.nombre || 'U')}
            </div>

            {/* Texto */}
            <div className="hidden md:block text-right">
              {loading ? (
                // Skeleton loader
                <div className="flex flex-col items-end gap-1">
                  <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-2 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {empleado?.nombre || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {rolNombre || empleado?.email || 'Cargando...'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </header>
  )
}