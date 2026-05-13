export function LoadingState({ label = 'Loading cloud data...' }) {
  return (
    <div className="grid min-h-[320px] place-items-center rounded-lg border border-zinc-200 bg-white p-8 shadow-sm shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20">
      <div className="text-center">
        <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-zinc-200 border-t-teal-600 dark:border-zinc-800 dark:border-t-teal-400" />
        <p className="mt-4 text-sm font-medium text-zinc-600 dark:text-zinc-300">{label}</p>
      </div>
    </div>
  );
}
