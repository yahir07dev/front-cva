export default function LoadingConfigNomina() {
  return (
    <div className="h-full p-4 sm:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500">
      <div className="max-w-6xl mx-auto flex flex-col h-full">
        {/* Header Skeleton */}
        <div className="flex-none mb-8">
          <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse mb-3" />
          <div className="h-4 w-96 bg-neutral-200/70 dark:bg-neutral-800/70 rounded-md animate-pulse mb-6" />
          <div className="h-12 w-full md:w-96 bg-neutral-200 dark:bg-neutral-800 rounded-2xl animate-pulse" />
        </div>

        {/* List Skeleton */}
        <div className="flex-1 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-[120px] w-full rounded-3xl bg-neutral-200/50 dark:bg-neutral-800/50 animate-pulse border border-neutral-200 dark:border-neutral-800" />
          ))}
        </div>
      </div>
    </div>
  )
}