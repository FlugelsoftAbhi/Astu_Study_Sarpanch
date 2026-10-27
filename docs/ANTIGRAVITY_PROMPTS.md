# Antigravity prompts (use in this order)

The code is already generated, so use Antigravity to **understand, verify, extend and document** it. Save every prompt and its answer for your report appendix. Open the project folder as the workspace first.

## Prompt 1: Understand the codebase (viva prep)
```
Read this whole project. Explain the architecture in plain English for a beginner: the request flow from clicking "Generate" to a saved study set, what runs in the browser vs on the server, and where each secret is used. Then list every file with a one-line purpose.
```

## Prompt 2: Environment check
```
Check that .env.example lists every environment variable the code reads (search for process.env). Tell me any that are missing. Do not create or print any real secret values.
```

## Prompt 3: Run and fix
```
Run npm install and npm run dev. If there are errors, fix them with the smallest possible change and explain each fix. Do not change security logic in app/api/generate/route.ts or firestore.rules.
```

## Prompt 4: Security review (report section)
```
Act as a security reviewer. Review app/api/generate/route.ts, lib/firebaseAdmin.ts, firestore.rules and next.config.ts against the OWASP Top 10. For each finding give: severity, the file and line, why it matters, and a suggested fix. Also confirm no secret could be exposed to the browser. Output a table I can paste into my report.
```

## Prompt 5: Safe improvement, PDF upload (only after all MVP tests pass)
```
Add PDF upload to app/dashboard/page.tsx. Extract text in the browser (client side) using pdfjs-dist, limit files to 2 MB and the first 8000 characters, show a clear error for scanned or empty PDFs, and keep the existing validation. Do not send the PDF file to the server.
```

## Prompt 6: Unit tests for the schema
```
Add Vitest and write tests for lib/schema.ts: accept a valid study set, reject a quiz with 4 questions, reject options not exactly 4, reject answerIndex 4. Add an npm "test" script and run it.
```

## Prompt 7: Accessibility pass
```
Audit the UI for accessibility: keyboard navigation, focus visibility, labels, colour contrast in light and dark mode, and screen-reader names for buttons. List problems, then fix only clear issues without redesigning.
```

## Prompt 8: README and report material
```
From the code, generate: (1) a system architecture description with a Mermaid diagram, (2) a data model description for the Firestore collections, (3) a numbered list of the security measures implemented, and (4) a list of limitations. Write in formal academic English suitable for a project report.
```

## Prompt 9: Viva questions
```
Ask me 15 viva questions about this project (auth, Firestore rules, rate limiting, prompt injection, SEO, deployment). After each of my answers, correct me and give the ideal answer.
```

## Rules of thumb
- Read every diff before accepting it.
- Never paste real keys into the chat; Antigravity should only ever see `.env.example`.
- If Antigravity proposes weakening Firestore rules or moving the Gemini call to the browser, reject it.
