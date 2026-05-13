import { AlertTriangle } from 'lucide-react';

export function FirebaseSetup() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl place-items-center px-4 py-10 sm:px-6">
      <section className="w-full max-w-2xl rounded-lg border border-amber-200 bg-white p-6 shadow-lg shadow-zinc-200/70 dark:border-amber-500/30 dark:bg-zinc-900 dark:shadow-black/30">
        <div className="mb-4 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-md bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
            <AlertTriangle size={20} />
          </span>
          <div>
            <h2 className="text-xl font-semibold text-zinc-950 dark:text-white">Firebase is not configured</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Add the Vite Firebase environment variables before using cloud sync.</p>
          </div>
        </div>
        <pre className="overflow-auto rounded-md bg-zinc-950 p-4 text-xs text-zinc-100">{`VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...`}</pre>
      </section>
    </main>
  );
}
