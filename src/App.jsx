import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Dashboard } from './components/Dashboard';
import { FirebaseSetup } from './components/FirebaseSetup';
import { Header } from './components/Header';
import { LoadingState } from './components/LoadingState';
import { LoginPage } from './components/LoginPage';
import { PublicSubmissionPage } from './components/PublicSubmissionPage';
import { StudentForm } from './components/StudentForm';
import { StudentTable } from './components/StudentTable';
import { Toolbar } from './components/Toolbar';
import { useAuth } from './hooks/useAuth';
import { useStudents } from './hooks/useStudents';
import { firebaseConfigured } from './lib/firebase';
import { loadTheme, saveTheme } from './lib/storage';
import { downloadJson, emptyStudent, exportCsv, exportExcel, groupOptions, readSpreadsheet } from './lib/utils';

export default function App() {
  const [darkMode, setDarkMode] = useState(() => loadTheme() === 'dark');
  const [route, setRoute] = useState(() => normalizeRoute(window.location.pathname));
  const authState = useAuth();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    saveTheme(darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const handlePopState = () => setRoute(normalizeRoute(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(nextRoute) {
    window.history.pushState({}, '', nextRoute);
    setRoute(normalizeRoute(nextRoute));
  }

  const headerProps = {
    darkMode,
    route,
    navigate,
    onToggleTheme: () => setDarkMode((value) => !value),
  };

  if (!firebaseConfigured) {
    return (
      <AppFrame>
        <Header {...headerProps} />
        <FirebaseSetup />
      </AppFrame>
    );
  }

  if (route === '/submit') {
    return (
      <AppFrame>
        <Header {...headerProps} />
        <PublicSubmissionPage />
      </AppFrame>
    );
  }

  if (authState.loading) {
    return (
      <AppFrame>
        <Header {...headerProps} />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <LoadingState label="Checking admin access..." />
        </main>
      </AppFrame>
    );
  }

  if (!authState.admin) {
    return (
      <AppFrame>
        <Header {...headerProps} />
        <LoginPage onLogin={authState.login} error={authState.error} />
      </AppFrame>
    );
  }

  return (
    <AdminDashboard
      {...headerProps}
      admin={authState.admin}
      onLogout={async () => {
        await authState.logout();
        toast.success('Logged out');
      }}
    />
  );
}

function AdminDashboard({ darkMode, route, navigate, onToggleTheme, admin, onLogout }) {
  const {
    students,
    submissions,
    latestSubmissions,
    deadline,
    loading,
    saving,
    error,
    setDeadline,
    addStudent,
    updateStudent,
    deleteStudent,
    importStudents,
    restoreBackup,
    seedDemo,
  } = useStudents(admin);
  const offline = useNetworkStatus();
  const [editingStudent, setEditingStudent] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [groupFilter, setGroupFilter] = useState('All');

  const groups = useMemo(() => groupOptions(students), [students]);
  const filteredStudents = useMemo(() => students.filter((student) => {
    const term = search.trim().toLowerCase();
    const matchesSearch = !term
      || student.fullName.toLowerCase().includes(term)
      || student.studentId.toLowerCase().includes(term)
      || student.phone.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
    const matchesGroup = groupFilter === 'All' || student.group === groupFilter;
    return matchesSearch && matchesStatus && matchesGroup;
  }), [students, search, statusFilter, groupFilter]);

  function openAddForm() {
    setEditingStudent(emptyStudent());
    setFormOpen(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!editingStudent.studentId.trim()) {
      toast.error('Student ID is required');
      return;
    }
    if (!editingStudent.fullName.trim()) {
      toast.error('Full name is required');
      return;
    }

    const isExisting = students.some((student) => student.studentId === editingStudent.studentId);
    if (isExisting) {
      await updateStudent(editingStudent);
    } else {
      await addStudent(editingStudent);
    }
    setFormOpen(false);
    setEditingStudent(null);
  }

  async function handleImport(file) {
    try {
      const imported = await readSpreadsheet(file);
      await importStudents(imported);
    } catch {
      toast.error('Could not read this file');
    }
  }

  async function handleRestore(file) {
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      if (!Array.isArray(backup.students)) throw new Error('Invalid backup');
      await restoreBackup(backup);
    } catch {
      toast.error('Invalid backup file');
    }
  }

  function handleDelete(studentId) {
    if (confirm(`Delete student ${studentId}?`)) deleteStudent(studentId);
  }

  return (
    <AppFrame>
      <Header
        darkMode={darkMode}
        route={route}
        navigate={navigate}
        onToggleTheme={onToggleTheme}
        onPrint={() => window.print()}
        onSeedDemo={seedDemo}
        onLogout={onLogout}
        adminEmail={admin.email}
      />

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-5 sm:px-6 lg:py-7">
        {error ? (
          <p className="no-print rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">{error}</p>
        ) : null}

        <section className="no-print grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Late submission deadline</label>
            <input
              type="datetime-local"
              value={deadline}
              onChange={(event) => setDeadline(event.target.value)}
              className="mt-1 h-11 w-full rounded-md border border-zinc-200 bg-white px-3 text-zinc-950 outline-none transition focus:border-teal-500 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white sm:max-w-sm"
            />
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Cloud autosave is enabled. Offline edits are queued by Firestore and sync when the device reconnects.</p>
        </section>

        {loading ? (
          <LoadingState />
        ) : (
          <>
            <Dashboard students={students} submissions={submissions} latestSubmissions={latestSubmissions} />

            <Toolbar
              search={search}
              setSearch={setSearch}
              statusFilter={statusFilter}
              setStatusFilter={setStatusFilter}
              groupFilter={groupFilter}
              setGroupFilter={setGroupFilter}
              groups={groups}
              onAdd={openAddForm}
              onImport={handleImport}
              onExportCsv={() => {
                exportCsv(filteredStudents, latestSubmissions);
                toast.success('CSV exported');
              }}
              onExportExcel={async () => {
                await exportExcel(filteredStudents, latestSubmissions);
                toast.success('Excel exported');
              }}
              onBackup={() => {
                downloadJson({ students, submissions, deadline });
                toast.success('Backup downloaded');
              }}
              onRestore={handleRestore}
              syncLabel={saving ? 'Saving to cloud...' : offline ? 'Offline - queued locally' : 'Cloud synced'}
              offline={offline}
            />

            {formOpen ? (
              <StudentForm
                value={editingStudent}
                onChange={setEditingStudent}
                onSubmit={handleSubmit}
                isEditing={students.some((student) => student.studentId === editingStudent?.studentId)}
                onCancel={() => {
                  setFormOpen(false);
                  setEditingStudent(null);
                }}
              />
            ) : null}

            <StudentTable
              students={filteredStudents}
              latestSubmissions={latestSubmissions}
              onEdit={(student) => {
                setEditingStudent(student);
                setFormOpen(true);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onDelete={handleDelete}
            />
          </>
        )}
      </main>
    </AppFrame>
  );
}

function AppFrame({ children }) {
  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-950 transition-colors dark:bg-zinc-950 dark:text-white" dir="auto">
      {children}
    </div>
  );
}

function normalizeRoute(pathname) {
  if (pathname === '/submit') return '/submit';
  return '/admin';
}

function useNetworkStatus() {
  const [offline, setOffline] = useState(() => !navigator.onLine);

  useEffect(() => {
    const setOnline = () => setOffline(false);
    const setOfflineState = () => setOffline(true);
    window.addEventListener('online', setOnline);
    window.addEventListener('offline', setOfflineState);
    return () => {
      window.removeEventListener('online', setOnline);
      window.removeEventListener('offline', setOfflineState);
    };
  }, []);

  return offline;
}
