import { BoxSelect } from 'lucide-react'

export default function LoadingCapacitacion() {
  return (
    <div className="h-full overflow-y-auto p-4 sm:p-6 lg:p-8 bg-neutral-50 dark:bg-neutral-950 transition-colors duration-500 flex flex-col">
      <div className="mb-8 flex justify-between items-center">
         <div className="space-y-3">
            <div className="h-8 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
            <div className="h-4 w-48 bg-neutral-200/70 dark:bg-neutral-800/70 rounded-md animate-pulse" />
         </div>
         <div className="h-12 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse hidden sm:block" />
      </div>

      <div className="flex bg-neutral-200/80 dark:bg-neutral-800/80 p-1.5 rounded-2xl w-fit mb-10 mx-auto sm:mx-0 animate-pulse">
        <div className="h-10 w-32 bg-white/50 dark:bg-neutral-700/50 rounded-xl" />
        <div className="h-10 w-32 bg-transparent rounded-xl" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-max px-2 sm:px-0">
         {[1, 2, 3, 4, 5, 6].map(i => (
           <div key={i} className="h-[320px] rounded-[2rem] bg-neutral-200/50 dark:bg-neutral-900/50 animate-pulse border-2 border-transparent shadow-sm" />
         ))}
      </div>
    </div>
  )
}