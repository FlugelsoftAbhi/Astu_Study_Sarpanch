# AI Study Companion

Turn pasted notes into a summary, flashcards and a 5-question quiz with Google Gemini.
Google sign-in (Firebase Auth), private per-user history (Firestore), quiz scoring and progress page.

**Stack:** Next.js 15 (App Router, TypeScript), Firebase Auth + Firestore, firebase-admin, @google/genai, zod, Vercel.

## Run locally
```bash
npm install
cp .env.example .env.local   # then fill in the values
npm run dev                  # http://localhost:3000
```

## Security design
- Gemini and Firebase Admin keys are server-only environment variables.
- `/api/generate` verifies the Firebase ID token, validates input length, enforces a per-user daily limit, and validates the AI's JSON with zod.
- Firestore rules (`firestore.rules`) restrict every document to its owner; sets and usage counters are server-written only.
- Security headers in `next.config.ts`.

See `docs/MANUAL_STEPS.md` for the setup you must do yourself, and `docs/ANTIGRAVITY_PROMPTS.md` for the prompts.
