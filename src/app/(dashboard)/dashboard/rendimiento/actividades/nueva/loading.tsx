export default function Loading() {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#1a1d29] p-4 sm:p-8 animate-pulse">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div>
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-2" />
          <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Columna Izquierda (Inputs) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 h-[300px] rounded-3xl p-6">
            <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-6" />
            <div className="space-y-4">
              <div className="h-12 w-full bg-gray-100 dark:bg-gray-800 rounded-xl" />
              <div className="h-32 w-full bg-gray-100 dark:bg-gray-800 rounded-xl" />
            </div>
          </div>
          <div className="h-24 w-full bg-white dark:bg-gray-900 rounded-3xl" />
        </div>

        {/* Columna Derecha (Config) */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-900 h-[400px] rounded-3xl p-6">
             <div className="h-8 w-24 bg-gray-200 dark:bg-gray-800 rounded mb-6" />
             <div className="space-y-4">
               <div className="h-12 w-full bg-gray-100 dark:bg-gray-800 rounded-xl" />
               <div className="h-12 w-full bg-gray-100 dark:bg-gray-800 rounded-xl" />
             </div>
          </div>
          <div className="h-14 w-full bg-gray-300 dark:bg-gray-700 rounded-xl" />
        </div>
      </div>
    </div>
  )
}