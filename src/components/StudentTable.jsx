import { Edit2, Trash2 } from 'lucide-react';
import { statusMeta } from '../lib/constants';
import { formatDateTime, formatDateTimeShort } from '../lib/utils';

export function StudentTable({ students, latestSubmissions, onEdit, onDelete }) {
  return (
    <section className="print-card overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20">
      <div className="border-b border-zinc-100 px-4 py-3 dark:border-zinc-800">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-white">Students</h2>
      </div>

      <div className="hidden max-h-[680px] overflow-auto md:block">
        <table className="w-full min-w-[1240px] text-left">
          <thead className="sticky top-0 z-10 bg-zinc-50 text-xs uppercase text-zinc-500 shadow-sm dark:bg-zinc-950 dark:text-zinc-400">
            <tr>
              <th className="px-4 py-3">Student ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Group</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Submitted at</th>
              <th className="px-4 py-3">Location</th>
              <th className="px-4 py-3">Student plan</th>
              <th className="px-4 py-3 no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {students.map((student) => (
              <tr key={student.id} className="text-sm text-zinc-700 transition hover:bg-zinc-50/80 dark:text-zinc-200 dark:hover:bg-zinc-800/50">
                <td className="px-4 py-3 font-semibold text-zinc-950 dark:text-white">{student.studentId}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-zinc-950 dark:text-white">{student.fullName}</p>
                  <p className="mt-1 max-w-xs truncate text-xs text-zinc-500 dark:text-zinc-400">{student.notes || student.submissionNotes || 'No notes'}</p>
                </td>
                <td className="px-4 py-3">{student.group || '-'}</td>
                <td className="px-4 py-3">{student.phone || '-'}</td>
                <td className="px-4 py-3"><StatusBadge status={student.status} /></td>
                <td className="px-4 py-3">{formatDateTime(student.submittedAt)}</td>
                <td className="px-4 py-3">{student.location || '-'}</td>
                <td className="px-4 py-3"><PlanSummary plan={latestSubmissions.get(student.studentId)} /></td>
                <td className="px-4 py-3 no-print">
                  <div className="flex items-center gap-2">
                    <IconButton label="Edit" onClick={() => onEdit(student)} icon={<Edit2 size={16} />} />
                    <IconButton label="Delete" onClick={() => onDelete(student.studentId)} icon={<Trash2 size={16} />} danger />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-zinc-100 dark:divide-zinc-800 md:hidden">
        {students.map((student) => (
          <article key={student.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-semibold text-zinc-950 dark:text-white">{student.fullName}</h3>
                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{student.studentId} - {student.group || 'No group'} - {student.phone || 'No phone'}</p>
              </div>
              <StatusBadge status={student.status} />
            </div>
            <dl className="mt-3 grid gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <div className="flex justify-between gap-3"><dt>Date</dt><dd className="text-right">{formatDateTime(student.submittedAt)}</dd></div>
              <div className="flex justify-between gap-3"><dt>Location</dt><dd className="text-right">{student.location || '-'}</dd></div>
              <div className="flex justify-between gap-3"><dt>Plan</dt><dd className="text-right"><PlanSummary plan={latestSubmissions.get(student.studentId)} compact /></dd></div>
              <div className="flex justify-between gap-3"><dt>Notes</dt><dd className="text-right">{student.notes || student.submissionNotes || '-'}</dd></div>
            </dl>
            <div className="no-print mt-4 flex gap-2">
              <button type="button" onClick={() => onEdit(student)} className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md border border-zinc-200 bg-white text-sm font-medium text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"><Edit2 size={16} />Edit</button>
              <button type="button" onClick={() => onDelete(student.studentId)} className="grid h-10 w-10 place-items-center rounded-md border border-red-200 bg-white text-red-600 dark:border-red-500/30 dark:bg-zinc-900 dark:text-red-300"><Trash2 size={16} /></button>
            </div>
          </article>
        ))}
      </div>

      {!students.length ? (
        <p className="px-4 py-8 text-center text-sm text-zinc-500 dark:text-zinc-400">No students match the current filters.</p>
      ) : null}
    </section>
  );
}

function StatusBadge({ status }) {
  const meta = statusMeta[status] || statusMeta['Not Submitted'];
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${meta.bg}`}>{meta.short}</span>;
}

function PlanSummary({ plan, compact }) {
  if (!plan) return <span className="text-zinc-400">No plan</span>;
  return (
    <span className={compact ? '' : 'block min-w-40'}>
      <span className="block font-medium text-zinc-800 dark:text-zinc-100">{formatDateTimeShort(plan.expectedDate)}</span>
      <span className="block text-xs text-zinc-500 dark:text-zinc-400">{plan.expectedLocation || '-'}</span>
    </span>
  );
}

function IconButton({ icon, label, danger, ...props }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      {...props}
      className={danger
        ? 'grid h-9 w-9 place-items-center rounded-md border border-red-200 bg-white text-red-600 transition hover:bg-red-50 dark:border-red-500/30 dark:bg-zinc-900 dark:text-red-300 dark:hover:bg-red-500/10'
        : 'grid h-9 w-9 place-items-center rounded-md border border-zinc-200 bg-white text-zinc-600 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800'}
    >
      {icon}
    </button>
  );
}
