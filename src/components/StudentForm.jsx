import { Save, X } from 'lucide-react';
import { STATUSES } from '../lib/constants';
import { emptyStudent } from '../lib/utils';

export function StudentForm({ value, onChange, onSubmit, onCancel, isEditing }) {
  const student = value || emptyStudent();

  function update(field, fieldValue) {
    onChange({ ...student, [field]: fieldValue });
  }

  return (
    <form onSubmit={onSubmit} className="print-card rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-zinc-950 dark:text-white">{isEditing ? 'Edit Student' : 'Add Student'}</h2>
        {onCancel ? (
          <button type="button" onClick={onCancel} className="grid h-9 w-9 place-items-center rounded-md border border-zinc-200 text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800">
            <X size={17} />
          </button>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Student ID" required disabled={isEditing} value={student.studentId} onChange={(event) => update('studentId', event.target.value)} />
        <Field label="Full name" required value={student.fullName} onChange={(event) => update('fullName', event.target.value)} />
        <Field label="Group/Section" value={student.group} onChange={(event) => update('group', event.target.value)} />
        <Field label="Phone number" value={student.phone} onChange={(event) => update('phone', event.target.value)} />
        <label className="space-y-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
          <span>Status</span>
          <select value={student.status} onChange={(event) => update('status', event.target.value)} className="h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-zinc-950 outline-none transition focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white">
            {STATUSES.map((status) => <option key={status}>{status}</option>)}
          </select>
        </label>
        <Field label="Submission date and time" type="datetime-local" value={student.submittedAt} onChange={(event) => update('submittedAt', event.target.value)} />
        <Field label="Submission location" value={student.location} onChange={(event) => update('location', event.target.value)} />
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Textarea label="Student notes" value={student.notes} onChange={(event) => update('notes', event.target.value)} />
        <Textarea label="Submission comments" value={student.submissionNotes} onChange={(event) => update('submissionNotes', event.target.value)} />
      </div>

      <button type="submit" className="mt-4 inline-flex h-10 items-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
        <Save size={17} />
        Save student
      </button>
    </form>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="space-y-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
      <span>{label}</span>
      <input {...props} className="h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-500 disabled:bg-zinc-100 disabled:text-zinc-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white dark:disabled:bg-zinc-900" />
    </label>
  );
}

function Textarea({ label, ...props }) {
  return (
    <label className="space-y-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
      <span>{label}</span>
      <textarea {...props} rows={3} className="w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" />
    </label>
  );
}
