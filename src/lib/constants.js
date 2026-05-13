export const STATUSES = ['Submitted', 'Not Submitted', 'Late Submission'];

export const statusMeta = {
  Submitted: {
    label: 'Submitted',
    short: 'Submitted',
    color: '#16a34a',
    bg: 'bg-green-50 text-green-700 ring-green-200 dark:bg-green-500/10 dark:text-green-300 dark:ring-green-500/30',
  },
  'Not Submitted': {
    label: 'Not Submitted',
    short: 'Missing',
    color: '#dc2626',
    bg: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/30',
  },
  'Late Submission': {
    label: 'Late Submission',
    short: 'Late',
    color: '#f97316',
    bg: 'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-500/30',
  },
};
