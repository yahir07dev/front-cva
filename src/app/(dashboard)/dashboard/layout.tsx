import React from 'react'
import { ThemeProvider } from '@/src/context/ThemeContext'
import Sidebar from '@/src/components/shared/Sidebar'
import Header from '@/src/components/shared/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
      <ThemeProvider>
        <div className="flex h-screen w-full bg-gray-50 dark:bg-[#0f1117] text-gray-900 dark:text-white overflow-hidden transition-colors duration-300">
          
          <div className="flex-none z-50">
             <Sidebar />
          </div>

          <main className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
            {/* El Header ahora se encargará de buscar sus propios datos */}
            <Header />
            
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 p-4 sm:p-6 lg:p-8">
               {children}
            </div>
          </main>
          
        </div>
      </ThemeProvider>
  )
}