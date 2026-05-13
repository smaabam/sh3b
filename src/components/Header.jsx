import { LogOut, Moon, Printer, RotateCcw, Send, Sun } from 'lucide-react';

export function Header({ darkMode, onToggleTheme, onPrint, onSeedDemo, onLogout, adminEmail, route, navigate }) {
  return (
    <header className="no-print sticky top-0 z-20 border-b border-zinc-200/80 bg-white/90 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/85 dark:shadow-none">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <button type="button" onClick={() => navigate('/admin')} className="text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600 dark:text-teal-400">Medical Batch</p>
          <h1 className="text-lg font-semibold text-zinc-950 dark:text-white sm:text-2xl">Submission Tracker</h1>
        </button>
        <div className="flex items-center gap-2">
          {route !== '/submit' ? (
            <>
              <button
                type="button"
                onClick={() => navigate('/submit')}
                className="hidden h-10 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:flex"
              >
                <Send size={16} />
                Student form
              </button>
              {adminEmail ? (
                <button
                  type="button"
                  onClick={onSeedDemo}
                  className="hidden h-10 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:flex"
                >
                  <RotateCcw size={16} />
                  Demo
                </button>
              ) : null}
              {onPrint ? (
                <button
                  type="button"
                  onClick={onPrint}
                  aria-label="Print report"
                  className="grid h-10 w-10 place-items-center rounded-md border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <Printer size={18} />
                </button>
              ) : null}
              {adminEmail ? (
                <button
                  type="button"
                  onClick={onLogout}
                  aria-label="Log out"
                  title={adminEmail}
                  className="grid h-10 w-10 place-items-center rounded-md border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  <LogOut size={18} />
                </button>
              ) : null}
            </>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="hidden h-10 items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 sm:flex"
            >
              Admin login
            </button>
          )}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle dark mode"
            className="grid h-10 w-10 place-items-center rounded-md bg-zinc-950 text-white shadow-sm transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-950"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}
