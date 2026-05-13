import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, firebaseConfigured } from './firebase';
import { normalizeStudentId } from './utils';

export async function submitStudentPlan(payload) {
  if (!firebaseConfigured) {
    throw new Error('Firebase is not configured yet');
  }

  const studentId = normalizeStudentId(payload.studentId);
  if (!studentId) throw new Error('Student ID is required');
  if (!payload.fullName?.trim()) throw new Error('Name is required');
  if (!payload.expectedDate) throw new Error('Expected submission date is required');
  if (!payload.expectedLocation?.trim()) throw new Error('Expected location is required');

  await addDoc(collection(db, 'publicSubmissions'), {
    studentId,
    fullName: payload.fullName.trim(),
    expectedDate: payload.expectedDate,
    expectedLocation: payload.expectedLocation.trim(),
    notes: String(payload.notes || '').trim(),
    createdAt: serverTimestamp(),
    source: 'student-public-form',
  });
}
