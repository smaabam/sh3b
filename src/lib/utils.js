import ExcelJS from 'exceljs';
import Papa from 'papaparse';
import { STATUSES } from './constants';

export function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export function normalizeStudentId(value) {
  return String(value || '').trim().replace(/\s+/g, '-').toUpperCase();
}

export function studentDocId(studentId) {
  return encodeURIComponent(normalizeStudentId(studentId));
}

export function emptyStudent() {
  return {
    id: '',
    studentId: '',
    fullName: '',
    group: '',
    phone: '',
    notes: '',
    status: 'Not Submitted',
    submittedAt: '',
    location: '',
    submissionNotes: '',
  };
}

export function emptySubmission() {
  return {
    studentId: '',
    fullName: '',
    expectedDate: '',
    expectedLocation: '',
    notes: '',
  };
}

export function normalizeStatus(value) {
  const text = String(value || '').trim().toLowerCase();
  if (['submitted', 'done', 'yes', 'complete', 'completed'].includes(text)) return 'Submitted';
  if (['late', 'late submission', 'delayed'].includes(text)) return 'Late Submission';
  return 'Not Submitted';
}

export function applyDeadlineStatus(student, deadline) {
  if (!deadline || student.status !== 'Submitted' || !student.submittedAt) return student;
  return new Date(student.submittedAt) > new Date(deadline)
    ? { ...student, status: 'Late Submission' }
    : student;
}

export function calculateStats(students, latestSubmissions = new Map()) {
  const total = students.length;
  const submitted = students.filter((student) => student.status === 'Submitted').length;
  const late = students.filter((student) => student.status === 'Late Submission').length;
  const notSubmitted = students.filter((student) => student.status === 'Not Submitted').length;
  const completed = submitted + late;
  const percentage = total ? Math.round((completed / total) * 100) : 0;
  const planned = students.filter((student) => latestSubmissions.has(student.studentId)).length;
  const missingPlans = students.filter((student) => (
    student.status === 'Not Submitted' && !latestSubmissions.has(student.studentId)
  )).length;

  return { total, submitted, late, notSubmitted, completed, percentage, planned, missingPlans };
}

export function formatDateTime(value) {
  if (!value) return 'No date';
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

export function formatDateTimeShort(value) {
  if (!value) return '-';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

export function timestampToMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

export function readSpreadsheet(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        if (file.name.toLowerCase().endsWith('.csv')) {
          const text = new TextDecoder().decode(event.target.result);
          const result = Papa.parse(text, { header: true, skipEmptyLines: true });
          if (result.errors.length) throw new Error('CSV parse failed');
          resolve(result.data.map(rowToStudent));
          return;
        }

        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(event.target.result);
        const worksheet = workbook.worksheets[0];
        const headers = worksheet.getRow(1).values.slice(1).map((value) => String(value || '').trim());
        const rows = [];
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return;
          const record = {};
          headers.forEach((header, index) => {
            record[header] = normalizeCellValue(row.getCell(index + 1).value);
          });
          rows.push(record);
        });
        resolve(rows.map(rowToStudent));
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function rowToStudent(row) {
  const get = (...keys) => keys.map((key) => row[key]).find((value) => value !== undefined && value !== '');
  const studentId = normalizeStudentId(get('Student ID', 'Student Id', 'ID', 'University ID', 'Code'));
  return {
    id: studentDocId(studentId || createId()),
    studentId,
    fullName: String(get('Full name', 'Full Name', 'Name', 'Student Name') || '').trim(),
    group: String(get('Group', 'Section', 'Group/Section') || '').trim(),
    phone: String(get('Phone', 'Phone number', 'Mobile') || '').trim(),
    notes: String(get('Notes', 'Student Notes') || '').trim(),
    status: normalizeStatus(get('Status', 'Submission Status')),
    submittedAt: normalizeExcelDate(get('Submission date', 'Submitted At', 'Date')),
    location: String(get('Location', 'Submission Location') || '').trim(),
    submissionNotes: String(get('Comments', 'Submission Notes', 'Notes/comments') || '').trim(),
  };
}

function normalizeCellValue(value) {
  if (!value) return '';
  if (value instanceof Date) return value;
  if (typeof value === 'object') {
    if ('text' in value) return value.text;
    if ('result' in value) return value.result;
    if ('richText' in value) return value.richText.map((part) => part.text).join('');
  }
  return value;
}

function normalizeExcelDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 16);
}

export function exportCsv(students, latestSubmissions = new Map()) {
  const rows = exportRows(students, latestSubmissions);
  const csv = Papa.unparse(rows);
  downloadBlob(csv, 'medical-batch-submissions.csv', 'text/csv;charset=utf-8');
}

export async function exportExcel(students, latestSubmissions = new Map()) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Submissions');
  worksheet.columns = [
    { header: 'Student ID', key: 'studentId', width: 16 },
    { header: 'Full name', key: 'fullName', width: 28 },
    { header: 'Group', key: 'group', width: 14 },
    { header: 'Phone', key: 'phone', width: 16 },
    { header: 'Status', key: 'status', width: 18 },
    { header: 'Submission date', key: 'submittedAt', width: 22 },
    { header: 'Location', key: 'location', width: 24 },
    { header: 'Expected date', key: 'expectedDate', width: 22 },
    { header: 'Expected location', key: 'expectedLocation', width: 24 },
    { header: 'Notes', key: 'notes', width: 32 },
    { header: 'Comments', key: 'submissionNotes', width: 32 },
  ];
  exportRows(students, latestSubmissions).forEach((row) => worksheet.addRow(row));
  worksheet.getRow(1).font = { bold: true };
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];
  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(buffer, 'medical-batch-submissions.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
}

function exportRows(students, latestSubmissions) {
  return students.map((student) => {
    const plan = latestSubmissions.get(student.studentId);
    return {
      studentId: student.studentId,
      fullName: student.fullName,
      group: student.group,
      phone: student.phone,
      status: student.status,
      submittedAt: student.submittedAt,
      location: student.location,
      expectedDate: plan?.expectedDate || '',
      expectedLocation: plan?.expectedLocation || '',
      notes: student.notes,
      submissionNotes: student.submissionNotes,
    };
  });
}

export function downloadJson(data) {
  const payload = Array.isArray(data)
    ? { students: data, exportedAt: new Date().toISOString() }
    : { ...data, exportedAt: new Date().toISOString() };
  downloadBlob(JSON.stringify(payload, null, 2), 'submission-backup.json', 'application/json');
}

export function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function groupOptions(students) {
  return [...new Set(students.map((student) => student.group).filter(Boolean))].sort();
}

export function statusCountsForChart(students) {
  return STATUSES.map((status) => ({
    name: status,
    value: students.filter((student) => student.status === status).length,
  }));
}

export function latestSubmissionMap(submissions) {
  const map = new Map();
  submissions
    .slice()
    .sort((a, b) => timestampToMillis(b.createdAt) - timestampToMillis(a.createdAt))
    .forEach((submission) => {
      if (!map.has(submission.studentId)) map.set(submission.studentId, submission);
    });
  return map;
}
