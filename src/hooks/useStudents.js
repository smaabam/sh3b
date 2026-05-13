import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';
import { demoStudents } from '../data/demoStudents';
import { db, firebaseConfigured } from '../lib/firebase';
import {
  applyDeadlineStatus,
  emptyStudent,
  latestSubmissionMap,
  normalizeStudentId,
  studentDocId,
} from '../lib/utils';

export function useStudents(admin) {
  const [students, setStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [deadline, setDeadlineState] = useState('');
  const [loading, setLoading] = useState(Boolean(admin));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!firebaseConfigured || !admin) {
      return undefined;
    }

    const handleSnapshotError = (snapshotError) => {
      setError(snapshotError.message);
      setLoading(false);
      toast.error('Firebase sync failed');
    };

    const studentsQuery = query(collection(db, 'students'), orderBy('fullName'));
    const submissionsQuery = query(collection(db, 'publicSubmissions'), orderBy('createdAt', 'desc'));
    const settingsRef = doc(db, 'settings', 'app');

    const unsubscribeStudents = onSnapshot(studentsQuery, (snapshot) => {
      setStudents(snapshot.docs.map((studentDoc) => {
        const data = studentDoc.data();
        return {
          ...emptyStudent(),
          ...data,
          id: studentDoc.id,
          studentId: data.studentId || decodeURIComponent(studentDoc.id),
        };
      }));
      setLoading(false);
    }, handleSnapshotError);

    const unsubscribeSubmissions = onSnapshot(submissionsQuery, (snapshot) => {
      setSubmissions(snapshot.docs.map((submissionDoc) => ({
        id: submissionDoc.id,
        ...submissionDoc.data(),
      })));
    }, handleSnapshotError);

    const unsubscribeSettings = onSnapshot(settingsRef, (snapshot) => {
      setDeadlineState(snapshot.exists() ? snapshot.data().deadline || '' : '');
    }, handleSnapshotError);

    return () => {
      unsubscribeStudents();
      unsubscribeSubmissions();
      unsubscribeSettings();
    };
  }, [admin]);

  async function runCloudAction(successMessage, action) {
    setSaving(true);
    setError('');
    try {
      await action();
      if (successMessage) toast.success(successMessage);
    } catch (actionError) {
      setError(actionError.message);
      toast.error(actionError.message || 'Cloud save failed');
      throw actionError;
    } finally {
      setSaving(false);
    }
  }

  async function setDeadline(value) {
    await runCloudAction('Deadline saved and late submissions updated', async () => {
      await setDoc(doc(db, 'settings', 'app'), {
        deadline: value,
        updatedAt: serverTimestamp(),
        updatedBy: admin.uid,
      }, { merge: true });

      if (value) {
        const batch = writeBatch(db);
        students.forEach((student) => {
          const updated = applyDeadlineStatus(student, value);
          if (updated.status !== student.status) {
            batch.set(doc(db, 'students', studentDocId(student.studentId)), {
              ...updated,
              updatedAt: serverTimestamp(),
              updatedBy: admin.uid,
            }, { merge: true });
          }
        });
        await batch.commit();
      }
    });
  }

  async function addStudent(student) {
    const clean = prepareStudent(student, deadline);
    await runCloudAction('Student added', async () => {
      const ref = doc(db, 'students', studentDocId(clean.studentId));
      const existing = await getDoc(ref);
      if (existing.exists()) throw new Error('Student ID already exists');
      await setDoc(ref, {
        ...clean,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        updatedBy: admin.uid,
      });
    });
  }

  async function updateStudent(updated) {
    const clean = prepareStudent(updated, deadline);
    await runCloudAction('Student updated', async () => {
      await setDoc(doc(db, 'students', studentDocId(clean.studentId)), {
        ...clean,
        updatedAt: serverTimestamp(),
        updatedBy: admin.uid,
      }, { merge: true });
    });
  }

  async function deleteStudent(studentId) {
    await runCloudAction('Student removed', async () => {
      await deleteDoc(doc(db, 'students', studentDocId(studentId)));
    });
  }

  async function importStudents(imported) {
    const seen = new Set();
    const clean = imported
      .map((student) => prepareStudent(student, deadline, false))
      .filter((student) => {
        if (!student.studentId || !student.fullName || seen.has(student.studentId)) return false;
        seen.add(student.studentId);
        return true;
      });

    await runCloudAction(`${clean.length} students imported`, async () => {
      const batch = writeBatch(db);
      clean.forEach((student) => {
        batch.set(doc(db, 'students', studentDocId(student.studentId)), {
          ...student,
          updatedAt: serverTimestamp(),
          updatedBy: admin.uid,
        }, { merge: true });
      });
      await batch.commit();
    });

    if (clean.length !== imported.length) {
      toast.warning('Rows without a unique Student ID were skipped');
    }
  }

  async function restoreBackup(backup) {
    const backupStudents = Array.isArray(backup.students) ? backup.students : [];
    const backupSubmissions = Array.isArray(backup.submissions) ? backup.submissions : [];

    await runCloudAction('Backup restored to cloud', async () => {
      const batch = writeBatch(db);
      backupStudents.forEach((student) => {
        const clean = prepareStudent(student, deadline, false);
        if (!clean.studentId) return;
        batch.set(doc(db, 'students', studentDocId(clean.studentId)), {
          ...clean,
          updatedAt: serverTimestamp(),
          updatedBy: admin.uid,
        }, { merge: true });
      });

      backupSubmissions.forEach((submission) => {
        const ref = submission.id
          ? doc(db, 'publicSubmissions', submission.id)
          : doc(collection(db, 'publicSubmissions'));
        batch.set(ref, {
          studentId: normalizeStudentId(submission.studentId),
          fullName: String(submission.fullName || '').trim(),
          expectedDate: submission.expectedDate || '',
          expectedLocation: String(submission.expectedLocation || '').trim(),
          notes: String(submission.notes || '').trim(),
          createdAt: serverTimestamp(),
          restoredAt: serverTimestamp(),
          updatedBy: admin.uid,
        }, { merge: true });
      });

      if (backup.deadline !== undefined) {
        batch.set(doc(db, 'settings', 'app'), {
          deadline: backup.deadline || '',
          updatedAt: serverTimestamp(),
          updatedBy: admin.uid,
        }, { merge: true });
      }

      await batch.commit();
    });
  }

  async function seedDemo() {
    await runCloudAction('Demo data synced to Firebase', async () => {
      const batch = writeBatch(db);
      demoStudents.forEach((student) => {
        const clean = prepareStudent(student, deadline, false);
        batch.set(doc(db, 'students', studentDocId(clean.studentId)), {
          ...clean,
          updatedAt: serverTimestamp(),
          updatedBy: admin.uid,
        }, { merge: true });
      });
      await batch.commit();
    });
  }

  const latestSubmissions = useMemo(() => latestSubmissionMap(submissions), [submissions]);

  return {
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
  };
}

function prepareStudent(student, deadline, requireId = true) {
  const studentId = normalizeStudentId(student.studentId);
  if (requireId && !studentId) throw new Error('Student ID is required');
  if (requireId && !student.fullName?.trim()) throw new Error('Full name is required');

  return applyDeadlineStatus({
    ...emptyStudent(),
    ...student,
    id: studentDocId(studentId || student.id),
    studentId,
    fullName: String(student.fullName || '').trim(),
    group: String(student.group || '').trim(),
    phone: String(student.phone || '').trim(),
    notes: String(student.notes || '').trim(),
    location: String(student.location || '').trim(),
    submissionNotes: String(student.submissionNotes || '').trim(),
    status: student.status || 'Not Submitted',
    submittedAt: student.submittedAt || '',
  }, deadline);
}
