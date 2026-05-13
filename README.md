# Medical Batch Submissions

A production-style React dashboard for managing medical batch student file submissions. It uses Firebase Authentication for admin access and Firestore for realtime cloud sync.

## Features

- Admin-only dashboard protected by Firebase email/password login
- Student ID as the unique primary identifier
- Realtime Firestore sync for students, dashboard stats, deadline settings, and public student plans
- Public `/submit` page where students can send only their own expected delivery information
- Excel/CSV import and export, JSON backup/restore, print-friendly reports
- Responsive desktop/mobile UI with light mode, dark mode, sticky table headers, status badges, charts, and toast notifications
- Offline-safe Firestore cache. Local edits queue and sync when the device reconnects

## Run Locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Fill `.env.local` with your Firebase web app config before opening the app.

Admin dashboard:

```text
http://localhost:5173/admin
```

Student public form:

```text
http://localhost:5173/submit
```

## Firebase Setup

1. Create a Firebase project.
2. Add a Web App in Firebase project settings.
3. Copy the web app config into `.env.local`:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

4. Enable **Authentication > Sign-in method > Email/Password**.
5. Create the admin user in **Authentication > Users**.
6. Copy the admin user's UID.
7. In Firestore, create this document:

```text
admins/{ADMIN_UID}
```

Example fields:

```json
{
  "role": "admin",
  "email": "admin@example.com"
}
```

8. Enable Firestore Database.
9. Publish `firestore.rules` from this project.

CLI path after creating `.env.local`:

```bash
npm run firebase:login
npm run firebase:rules
npm run firebase:check
```

`firebase:check` creates one clearly marked `CODEX-FIREBASE-TEST` public submission to verify write access.

## Security Model

- Admin data lives in `students`, `settings`, and `publicSubmissions`.
- Only authenticated admins listed in `admins/{uid}` or users with a Firebase custom claim `admin: true` can read or write admin data.
- Public students can only create write-only records in `publicSubmissions`.
- Public students cannot read dashboard data, statistics, student lists, settings, or other submissions.

The public form is intentionally write-only. Admins see those submissions in realtime and the dashboard matches them by Student ID.

## Import Format

Excel or CSV files can include these columns:

- `Student ID` or `ID`
- `Full name` or `Name`
- `Group` or `Section`
- `Phone`
- `Status`
- `Submission date`
- `Location`
- `Notes`
- `Comments`

Rows without a unique Student ID are skipped because Student ID is the primary identifier.

## Build

```bash
npm run build
npm run preview
```

## Deploy on Netlify

1. Push this folder to GitHub.
2. In Netlify, choose **Add new site** then **Import an existing project**.
3. Select the repository.
4. Use these build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add these Netlify environment variables under **Site configuration > Environment variables**:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
6. Deploy.

The included `netlify.toml` contains the same build settings and the SPA redirect needed for `/admin` and `/submit`.

## Folder Structure

```text
src/
  components/      Dashboard, login, public form, tables, charts
  data/            Demo student records with Student IDs
  hooks/           Firebase Auth and Firestore realtime hooks
  lib/             Firebase config, import/export helpers, public submission writer
  App.jsx          Routing and admin dashboard composition
  main.jsx         React entry point
  styles.css       Tailwind and print styles
firestore.rules    Firestore security rules
netlify.toml       Netlify build and SPA routing
```
