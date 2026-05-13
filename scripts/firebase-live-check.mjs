import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';

function readEnv(file) {
  const env = {};
  for (const line of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    env[trimmed.slice(0, index).trim()] = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
  }
  return env;
}

const env = readEnv(resolve('.env.local'));
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig).filter(([, value]) => !value).map(([key]) => key);
if (missing.length) {
  throw new Error(`Missing Firebase environment values: ${missing.join(', ')}`);
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const result = {
  environment: 'complete',
  authentication: 'not checked',
  publicSubmissionWrite: 'not checked',
};

try {
  await signInWithEmailAndPassword(auth, 'codex-auth-probe@example.invalid', `probe-${Date.now()}`);
  result.authentication = 'unexpected sign-in success';
} catch (error) {
  result.authentication = error.code;
}

try {
  const docRef = await addDoc(collection(db, 'publicSubmissions'), {
    studentId: 'CODEX-FIREBASE-TEST',
    fullName: 'Codex Firebase Test',
    expectedDate: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    expectedLocation: 'Connectivity check',
    notes: 'Created by Codex to verify public Firestore writes. Safe to delete.',
    createdAt: serverTimestamp(),
    source: 'student-public-form',
  });
  result.publicSubmissionWrite = `write-ok:${docRef.id}`;
} catch (error) {
  result.publicSubmissionWrite = `${error.code || 'error'}:${error.message}`;
}

console.log(JSON.stringify(result, null, 2));
