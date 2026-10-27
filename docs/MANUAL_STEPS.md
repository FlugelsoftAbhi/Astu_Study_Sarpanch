# Manual steps (only you can do these)

Everything else is already written in this repo. Do these in order.

## A. Accounts and keys (about 30 minutes)
1. **GitHub:** create an empty repo named `ai-study-companion` (Private is fine).
2. **Gemini key:** https://aistudio.google.com/apikey -> Create API key. Copy it. Also check which model is currently free and note the date for your report.
3. **Firebase project:** https://console.firebase.google.com -> Add project.
   - Build -> Authentication -> Get started -> Sign-in method -> enable **Google**.
   - Build -> Firestore Database -> Create database -> **Production mode**.
   - Project settings -> General -> Your apps -> **Web (</>)** -> register app -> copy the 4 config values (apiKey, authDomain, projectId, appId).
   - Project settings -> **Service accounts** -> Generate new private key. A JSON downloads. Keep it OUT of the project folder.
4. **Firestore rules:** Firestore -> Rules tab -> paste the contents of `firestore.rules` -> Publish.

## B. Local setup
1. Unzip the project, open the folder in Antigravity.
2. Copy `.env.example` to `.env.local` and fill it in. From the service-account JSON: `project_id` -> FIREBASE_ADMIN_PROJECT_ID, `client_email` -> FIREBASE_ADMIN_CLIENT_EMAIL, `private_key` -> FIREBASE_ADMIN_PRIVATE_KEY (keep it in double quotes, with the `\n` characters).
3. Run `npm install` then `npm run dev`. Test login at http://localhost:3000 (localhost is authorised by default).
4. `git init`, `git add .`, run `git status` and confirm `.env.local` is NOT listed, then commit and push.

## C. Deploy on Vercel
1. vercel.com -> sign in with GitHub -> Add New Project -> import the repo.
2. Add **every** variable from `.env.local` in Settings -> Environment Variables. Set `NEXT_PUBLIC_SITE_URL` to your Vercel URL.
3. Deploy. Copy the live URL.
4. **Firebase -> Authentication -> Settings -> Authorized domains -> Add** your `xxx.vercel.app` domain. (Login fails in production without this.)
5. Redeploy once if you changed env vars afterwards.

## D. Cloudflare (optional second deployment)
Check the current Cloudflare docs for "Next.js on Cloudflare" (it needs an adapter and changes often). If it takes over 2 hours, host only a static landing page there and say so in the report. Also add the Cloudflare domain to Firebase Authorized domains.

## E. Testing only you can do
Run every row in `docs/TEST_PLAN.md` on the live site, take screenshots, record pass/fail. Use a second Google account for the isolation test.

## F. Evidence for the report
Screenshots: login, dashboard, flashcards, quiz result, progress, Firebase Rules Playground test, Lighthouse scores, Vercel deployment, GitHub repo. Save your Antigravity prompts and outputs.

## G. Security hygiene
- If a key is ever committed, rotate it (Gemini key in AI Studio, service account key in Firebase) and do not just delete the commit.
- Set a Gemini quota/budget alert in Google Cloud if billing is ever enabled.

## Note on model names
Google retires Gemini model names regularly. If you see a 404 "no longer available" error in the terminal, open https://ai.google.dev/gemini-api/docs/models, pick the current Flash model, and set `GEMINI_MODEL` in `.env.local` (and in Vercel). Record the model name and the date in your report.
