import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { statusMeta } from '../lib/constants';
import { calculateStats, formatDateTime, statusCountsForChart } from '../lib/utils';
import { StatCard } from './StatCard';

export function Dashboard({ students, submissions, latestSubmissions }) {
  const stats = calculateStats(students, latestSubmissions);
  const chartData = statusCountsForChart(students);
  const recent = students
    .filter((student) => student.submittedAt)
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
    .slice(0, 5);
  const recentPlans = submissions.slice(0, 5);

  return (
    <section className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Total students" value={stats.total} accent="#0d9488" detail="Current batch size" />
        <StatCard label="Submitted" value={stats.submitted} accent={statusMeta.Submitted.color} detail="On time files" />
        <StatCard label="Not submitted" value={stats.notSubmitted} accent={statusMeta['Not Submitted'].color} detail="Need follow-up" />
        <StatCard label="Late" value={stats.late} accent={statusMeta['Late Submission'].color} detail="After deadline" />
        <StatCard label="Completion" value={`${stats.percentage}%`} accent="#2563eb" detail={`${stats.completed} of ${stats.total} complete`} />
        <StatCard label="Plans received" value={stats.planned} accent="#7c3aed" detail={`${stats.missingPlans} missing plans`} />
      </div>

      <div className="print-card rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-zinc-950 dark:text-white">Overall Progress</h2>
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">{stats.percentage}%</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
          <div
            className="h-full rounded-full bg-teal-600 transition-all duration-700"
            style={{ width: `${stats.percentage}%` }}
          />
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="print-card rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20">
          <h2 className="mb-4 text-base font-semibold text-zinc-950 dark:text-white">Status Breakdown</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: '#71717a', fontSize: 12 }} tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tick={{ fill: '#71717a', fontSize: 12 }} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: 'rgba(113,113,122,0.08)' }} contentStyle={{ borderRadius: 8, borderColor: '#e4e4e7' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={statusMeta[entry.name].color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="print-card rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20">
          <h2 className="mb-4 text-base font-semibold text-zinc-950 dark:text-white">Distribution</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData} dataKey="value" innerRadius={58} outerRadius={92} paddingAngle={3}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={statusMeta[entry.name].color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#e4e4e7' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
      <div className="print-card rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20">
        <h2 className="mb-3 text-base font-semibold text-zinc-950 dark:text-white">Recent Submissions</h2>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {recent.length ? recent.map((student) => (
            <div key={student.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-zinc-950 dark:text-white">{student.fullName}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{student.studentId} - {student.location || 'No location'}</p>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{formatDateTime(student.submittedAt)}</p>
            </div>
          )) : (
            <p className="py-4 text-sm text-zinc-500 dark:text-zinc-400">No submissions yet.</p>
          )}
        </div>
      </div>
      <div className="print-card rounded-lg border border-zinc-200 bg-white p-4 shadow-sm shadow-zinc-200/70 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-black/20">
        <h2 className="mb-3 text-base font-semibold text-zinc-950 dark:text-white">Recent Student Plans</h2>
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {recentPlans.length ? recentPlans.map((submission) => (
            <div key={submission.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-zinc-950 dark:text-white">{submission.fullName}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{submission.studentId} - {submission.expectedLocation || 'No location'}</p>
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">{formatDateTime(submission.expectedDate)}</p>
            </div>
          )) : (
            <p className="py-4 text-sm text-zinc-500 dark:text-zinc-400">No public student plans yet.</p>
          )}
        </div>
      </div>
      </div>
    </section>
  );
}
