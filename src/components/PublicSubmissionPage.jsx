import { useState } from 'react';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { submitStudentPlan } from '../lib/publicSubmissions';
import { emptySubmission } from '../lib/utils';

export function PublicSubmissionPage() {
  const [form, setForm] = useState(emptySubmission());
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await submitStudentPlan(form);
      toast.success('Submission plan sent');
      setForm(emptySubmission());
    } catch (error) {
      toast.error(error.message || 'Could not send submission');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl place-items-center px-4 py-8 sm:px-6">
      <section className="w-full max-w-2xl rounded-lg border border-zinc-200 bg-white p-5 shadow-lg shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/30">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400">Student submission form</p>
          <h2 className="mt-1 text-2xl font-semibold text-zinc-950 dark:text-white">Send your delivery information</h2>
          <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">Only your own submission plan is sent. You cannot see dashboard data or other student records.</p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Student ID" required value={form.studentId} onChange={(event) => update('studentId', event.target.value)} />
            <Field label="Full name" required value={form.fullName} onChange={(event) => update('fullName', event.target.value)} />
            <Field label="Expected submission date" required type="datetime-local" value={form.expectedDate} onChange={(event) => update('expectedDate', event.target.value)} />
            <Field label="Expected location" required value={form.expectedLocation} onChange={(event) => update('expectedLocation', event.target.value)} />
          </div>

          <label className="space-y-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <span>Optional notes</span>
            <textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} rows={4} className="w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-zinc-950 outline-none transition focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" />
          </label>

          <button disabled={submitting} type="submit" className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
            <Send size={17} />
            {submitting ? 'Sending...' : 'Submit plan'}
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="space-y-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
      <span>{label}</span>
      <input {...props} className="h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-zinc-950 outline-none transition placeholder:text-zinc-400 focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" />
    </label>
  );
}
