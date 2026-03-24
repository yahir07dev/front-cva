export default function LoadingEmpleadosList() {
  return (
    <div className="w-full min-h-screen bg-transparent transition-colors duration-300">
      <header className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
          <div className="h-4 w-72 bg-neutral-200/70 dark:bg-neutral-800/70 rounded-md animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse" />
      </header>

      <div className="w-full space-y-8 pb-24">
        <div className="max-w-3xl mx-auto h-14 bg-neutral-200 dark:bg-neutral-800 rounded-3xl animate-pulse" />
        <div className="w-full h-[65vh] bg-neutral-200/50 dark:bg-neutral-900/50 rounded-3xl animate-pulse border border-neutral-200/60 dark:border-neutral-800/60" />
      </div>
    </div>
  )
}