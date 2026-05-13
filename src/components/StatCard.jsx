export function StatCard({ label, value, accent, detail }) {
  return (
    <div className="print-card rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200/70 transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-zinc-950 dark:text-white">{value}</p>
        </div>
        <span className="mt-1 h-3 w-3 rounded-full" style={{ backgroundColor: accent }} />
      </div>
      {detail ? <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">{detail}</p> : null}
    </div>
  );
}
