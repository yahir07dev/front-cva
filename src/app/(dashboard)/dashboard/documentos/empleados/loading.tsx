import { Search, FolderOpen } from "lucide-react";

export default function LoadingDocumentosGrid() {
  return (
    <div className="h-full flex flex-col min-h-0 bg-neutral-50 dark:bg-neutral-950 px-4 sm:px-6 lg:px-8 pt-6 md:pt-10">
      {/* Header Skeleton */}
      <header className="shrink-0 flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 gap-4">
        <div>
          <div className="h-8 md:h-10 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse mb-2"></div>
          <div className="h-4 md:h-5 w-80 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse"></div>
        </div>
        <div className="h-11 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse"></div>
      </header>

      {/* Search Bar Skeleton */}
      <div className="w-full h-full flex flex-col min-h-0 space-y-6">
        <div className="relative w-full max-w-3xl mx-auto shrink-0">
          <div className="w-full h-14 rounded-[28px] bg-neutral-200/50 dark:bg-neutral-800/50 animate-pulse border border-neutral-200 dark:border-neutral-800" />
        </div>

        {/* Grid Skeleton */}
        <div className="flex-1 min-h-0 overflow-hidden pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col items-center p-6 md:p-8 bg-white/50 dark:bg-neutral-900/30 border border-neutral-200/50 dark:border-neutral-800/30 rounded-[32px] animate-pulse">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-neutral-200 dark:bg-neutral-800 mb-5"></div>
                <div className="h-5 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-md mb-2"></div>
                <div className="h-4 w-1/2 bg-neutral-200 dark:bg-neutral-800 rounded-md mb-6"></div>
                <div className="h-4 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded-md mt-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}