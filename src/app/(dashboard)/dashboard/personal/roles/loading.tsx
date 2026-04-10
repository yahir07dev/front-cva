import { ShieldAlert, Plus, Search } from 'lucide-react';

export default function LoadingRoles() {
  return (
    <div className="h-[100dvh] md:h-full flex flex-col p-0 pb-20 md:p-6 lg:p-8 overflow-hidden animate-in fade-in duration-500">
      <div className="flex-1 flex flex-col min-h-0 bg-[#fafafa] dark:bg-[#0a0a0a] md:rounded-3xl overflow-hidden md:border border-neutral-200 dark:border-white/[0.06] shadow-sm relative">
        
        {/* Header Skeleton */}
        <header className="px-6 pt-8 pb-6 sm:px-10 shrink-0 border-b border-neutral-100 dark:border-white/[0.06] bg-white dark:bg-[#0a0a0a]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-200 dark:bg-neutral-800 animate-pulse flex items-center justify-center shadow-sm">
                <ShieldAlert size={18} className="text-neutral-400 dark:text-neutral-600" />
              </div>
              <div>
                <div className="h-6 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse mb-1.5"></div>
                <div className="h-3 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-md animate-pulse"></div>
              </div>
            </div>
            <div className="w-24 h-10 bg-neutral-200 dark:bg-neutral-800 rounded-xl animate-pulse hidden sm:block"></div>
          </div>
          <div className="mt-5 max-w-xs">
             <div className="w-full h-10 bg-neutral-200/50 dark:bg-neutral-800/50 rounded-xl animate-pulse border border-neutral-200 dark:border-neutral-800"></div>
          </div>
        </header>

        {/* Grid Skeleton */}
        <div className="flex-1 overflow-hidden p-6 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="flex flex-col bg-white dark:bg-[#111111] rounded-2xl p-5 border border-neutral-100 dark:border-white/[0.07] animate-pulse h-[140px]">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-9 h-9 rounded-xl bg-neutral-200 dark:bg-neutral-800 shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-4 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                    <div className="h-3 w-1/3 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                  </div>
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-2.5 w-full bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                  <div className="h-2.5 w-4/5 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                </div>
                <div className="flex justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="h-3 w-16 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                  <div className="h-3 w-10 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}