export default function LoadingEditEmpleado() {
  return (
    <div className="w-full h-full flex flex-col min-h-0 animate-in fade-in duration-500 mx-auto">
      <header className="shrink-0 w-full bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-neutral-200/30 dark:border-neutral-800/50 rounded-[24px] md:rounded-[32px] p-6 md:p-8 shadow-sm mb-6 flex items-center gap-4 sm:gap-5">
        <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-neutral-200 dark:bg-neutral-800 animate-pulse shrink-0" />
        <div className="space-y-2 w-full max-w-sm">
          <div className="h-8 w-3/4 bg-neutral-200 dark:bg-neutral-800 rounded-lg animate-pulse" />
          <div className="h-4 w-1/2 bg-neutral-200/70 dark:bg-neutral-800/70 rounded-md animate-pulse" />
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-hidden pb-24 pr-2">
        <div className="grid gap-6 xl:grid-cols-2 w-full">
          <section className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-8 border border-neutral-200/50 dark:border-neutral-800/30 shadow-sm h-[350px] animate-pulse" />
          <section className="bg-white/40 dark:bg-white/[0.02] backdrop-blur-md rounded-[24px] md:rounded-[32px] p-5 sm:p-6 md:p-8 border border-neutral-200/50 dark:border-neutral-800/30 shadow-sm h-[450px] animate-pulse" />
        </div>
      </div>
    </div>
  );
}