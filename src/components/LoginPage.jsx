import { useState } from 'react';
import { Lock, LogIn } from 'lucide-react';

export function LoginPage({ onLogin, error }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await onLogin(email, password);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl place-items-center px-4 py-10 sm:px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg border border-zinc-200 bg-white p-6 shadow-lg shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/30">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-teal-50 text-teal-700 ring-1 ring-teal-200 dark:bg-teal-500/10 dark:text-teal-300 dark:ring-teal-500/30">
            <Lock size={20} />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">Admin Login</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Email/password access through Firebase Auth.</p>
          </div>
        </div>

        {error ? (
          <p className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{error}</p>
        ) : null}

        <div className="space-y-3">
          <label className="space-y-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <span>Email</span>
            <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-zinc-950 outline-none transition focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" />
          </label>
          <label className="space-y-1 text-sm font-medium text-zinc-700 dark:text-zinc-200">
            <span>Password</span>
            <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-zinc-950 outline-none transition focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white" />
          </label>
        </div>

        <button disabled={submitting} type="submit" className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-zinc-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950">
          <LogIn size={17} />
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
