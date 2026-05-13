import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
const projectId = env.VITE_FIREBASE_PROJECT_ID;

if (!projectId) {
  throw new Error('VITE_FIREBASE_PROJECT_ID is missing from .env.local');
}

writeFileSync(resolve('.firebaserc'), `${JSON.stringify({ projects: { default: projectId } }, null, 2)}\n`);
console.log('Firebase project file created from .env.local');
