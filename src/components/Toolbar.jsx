import { Download, FileDown, FileUp, Plus, Search, Upload } from 'lucide-react';
import { STATUSES } from '../lib/constants';

export function Toolbar({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  groupFilter,
  setGroupFilter,
  groups,
  onAdd,
  onImport,
  onExportCsv,
  onExportExcel,
  onBackup,
  onRestore,
  syncLabel,
  offline,
}) {
  return (
    <section className="no-print rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Records and operations</p>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${offline ? 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30' : 'bg-teal-50 text-teal-700 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/30'}`}>
          {syncLabel}
        </span>
      </div>
      <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
        <div className="grid gap-3 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={17} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by Student ID or name"
              className="h-11 w-full rounded-md border border-zinc-200 bg-white pl-10 pr-3 text-zinc-950 outline-none transition focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
            />
          </label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-zinc-950 outline-none transition focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white">
            <option value="All">All statuses</option>
            {STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
          <select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value)} className="h-11 rounded-md border border-zinc-200 bg-white px-3 text-zinc-950 outline-none transition focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white">
            <option value="All">All groups</option>
            {groups.map((group) => <option key={group}>{group}</option>)}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ActionButton onClick={onAdd} icon={<Plus size={16} />} label="Add" primary />
          <FileButton onChange={onImport} icon={<Upload size={16} />} label="Import" accept=".csv,.xlsx,.xls" />
          <ActionButton onClick={onExportExcel} icon={<FileDown size={16} />} label="Excel" />
          <ActionButton onClick={onExportCsv} icon={<Download size={16} />} label="CSV" />
          <ActionButton onClick={onBackup} icon={<FileDown size={16} />} label="Backup" />
          <FileButton onChange={onRestore} icon={<FileUp size={16} />} label="Restore" accept=".json" />
        </div>
      </div>
    </section>
  );
}

function ActionButton({ icon, label, primary, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className={primary
        ? 'inline-flex h-10 items-center gap-2 rounded-md bg-zinc-950 px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950'
        : 'inline-flex h-10 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800'}
    >
      {icon}
      {label}
    </button>
  );
}

function FileButton({ icon, label, onChange, accept }) {
  return (
    <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">
      {icon}
      {label}
      <input
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onChange(file);
          event.target.value = '';
        }}
      />
    </label>
  );
}
