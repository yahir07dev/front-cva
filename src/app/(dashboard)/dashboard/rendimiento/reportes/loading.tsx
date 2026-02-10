export default function Loading() {
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#1a1d29] px-4 py-6 sm:px-8 space-y-6 animate-pulse">
      
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="h-8 w-64 bg-gray-200 dark:bg-gray-800 rounded-lg mb-2" />
          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-800 rounded-lg" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-xl" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Skeleton */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 h-[400px]">
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-800 rounded-lg mb-8" />
          <div className="h-64 w-full bg-gray-100 dark:bg-gray-800/50 rounded-xl" />
        </div>

        {/* Ranking Skeleton */}
        <div className="bg-white dark:bg-gray-900 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 h-[400px] flex flex-col">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded-lg mb-6" />
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded-lg" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                </div>
                <div className="h-8 w-12 bg-gray-200 dark:bg-gray-800 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}