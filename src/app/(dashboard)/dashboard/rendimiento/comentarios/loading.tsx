export default function Loading() {
  return (
    <div className="h-[calc(100vh-theme(spacing.32))] flex bg-gray-50 dark:bg-[#1a1d29] rounded-2xl shadow-sm border border-gray-200 dark:border-gray-800 overflow-hidden animate-pulse">
      
      {/* Sidebar (Lista de empleados) - Oculto en móvil */}
      <div className="hidden md:block w-80 lg:w-96 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1d29] p-4 space-y-4">
        <div className="h-10 bg-gray-200 dark:bg-gray-800 rounded-xl mb-6" />
        
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-2">
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-800 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
              <div className="h-3 w-16 bg-gray-200 dark:bg-gray-800 rounded" />
            </div>
          </div>
        ))}
      </div>

      {/* Chat Area Principal */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#0f1117]">
        {/* Header Chat */}
        <div className="h-20 bg-white dark:bg-[#1a1d29] border-b border-gray-100 dark:border-gray-800 flex items-center px-6 gap-4">
           <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800" />
           <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>

        {/* Mensajes */}
        <div className="flex-1 p-6 space-y-6">
           {[...Array(3)].map((_, i) => (
             <div key={i} className="bg-white dark:bg-[#1a1d29] h-32 rounded-2xl p-4 border-l-4 border-gray-200 dark:border-gray-700">
               <div className="flex gap-3 mb-3">
                 <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-800" />
                 <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded mt-2" />
               </div>
               <div className="h-4 w-full bg-gray-100 dark:bg-gray-800/50 rounded mb-2" />
               <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800/50 rounded" />
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}