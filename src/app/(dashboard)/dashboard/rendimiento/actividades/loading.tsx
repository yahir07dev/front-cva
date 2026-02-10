export default function Loading() {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#1a1d29] px-4 py-6 sm:px-8 space-y-6 animate-pulse">
      
      {/* Header y Buscador */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
           <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
           <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
        <div className="flex gap-2">
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>

      {/* Tabs */}
      <div className="h-10 w-full max-w-md bg-gray-200 dark:bg-gray-800 rounded-xl" />

      {/* Lista de Tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 h-48 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-800 rounded" />
               <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded-full" />
            </div>
            <div className="space-y-2">
                <div className="h-4 w-full bg-gray-100 dark:bg-gray-800/50 rounded" />
                <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800/50 rounded" />
            </div>
            <div className="flex gap-2 mt-4">
                <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-800" />
                <div className="h-8 w-20 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}