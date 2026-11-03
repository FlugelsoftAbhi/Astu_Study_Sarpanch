import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { adminAuth, adminDb } from "@/lib/firebaseAdmin";
import {
  NotebookInputSchema,
  NotebookStudySetSchema,
  NOTEBOOK_MIN_CHARS,
  NOTEBOOK_MAX_CHARS,
} from "@/lib/notebookSchema";

export const runtime = "nodejs";
export const maxDuration = 60;

const DAILY_LIMIT = Number(process.env.DAILY_LIMIT ?? 20);

function buildNotebookLMPrompt(notes: string, sourceName: string) {
  return `You are Google NotebookLM, a rigorous, source-grounded research and study assistant.
CRITICAL MANDATE:
1. Ground every single response STRICTLY in the SOURCE MATERIAL between the triple quotes below.
2. Do NOT extrapolate, hallucinate, or bring in outside facts not present in the notes.
3. If an answer cannot be determined from the notes, state what the source specifically says instead.

Return ONLY a valid JSON object matching this exact schema:
{
  "title": "Clear, informative notebook title (max 80 chars)",
  "briefingDoc": "Comprehensive executive summary and briefing document synthesizing the core thesis, themes, and key takeaways (150-250 words)",
  "keyConcepts": [
    {
      "term": "Key term or concept",
      "definition": "Precise definition directly derived from the notes",
      "significance": "Why this concept matters in the context of the source"
    }
  ],
  "faqs": [
    {
      "question": "High-yield conceptual question a student or researcher would ask",
      "answer": "Grounded answer citing details from the source text"
    }
  ],
  "flashcards": [
    {
      "front": "Active recall question",
      "back": "Direct, verifiable answer",
      "tag": "Short topic tag"
    }
  ],
  "quiz": [
    {
      "question": "Diagnostic multiple-choice question testing source comprehension",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answerIndex": 0,
      "explanation": "Detailed explanation citing the specific source evidence"
    }
  ]
}

REQUIREMENTS:
- "keyConcepts": exactly 3 to 6 terms.
- "faqs": exactly 3 to 5 questions.
- "flashcards": exactly 6 to 8 flashcards.
- "quiz": exactly 4 to 5 multiple-choice questions with 4 distinct options and answerIndex between 0 and 3.
- Return ONLY plain JSON without markdown triple-backtick fences.

SOURCE DOCUMENT: "${sourceName}"
NOTES:
"""${notes}"""`;
}

export async function POST(req: NextRequest) {
  // 1. Authenticate Firebase token
  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return NextResponse.json({ error: "Please sign in to use NotebookLM Studio." }, { status: 401 });

  let uid: string;
  try {
    uid = (await adminAuth().verifyIdToken(token)).uid;
  } catch {
    return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 401 });
  }

  // 2. Validate payload
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON request." }, { status: 400 });
  }

  const parsed = NotebookInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: `Source text must be between ${NOTEBOOK_MIN_CHARS} and ${NOTEBOOK_MAX_CHARS} characters.`,
      },
      { status: 400 }
    );
  }

  // 3. User quota tracking in Firestore
  const day = new Date().toISOString().slice(0, 10);
  const usageRef = adminDb().doc(`users/${uid}/notebook_usage/${day}`);
  const allowed = await adminDb().runTransaction(async (t) => {
    const snap = await t.get(usageRef);
    const count = snap.exists ? (snap.data()!.count as number) : 0;
    if (count >= DAILY_LIMIT) return false;
    t.set(usageRef, { count: count + 1 });
    return true;
  });

  if (!allowed) {
    return NextResponse.json(
      { error: `Daily NotebookLM generation limit (${DAILY_LIMIT}) reached. Please try again tomorrow.` },
      { status: 429 }
    );
  }

  // 4. Generate structured Studio material with multi-model fallback
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
    const modelsToTry = Array.from(
      new Set(
        [
          process.env.GEMINI_MODEL,
          "gemini-3-flash-preview",
          "gemini-3.5-flash",
        ].filter(Boolean) as string[]
      )
    );

    let resText = "";
    let lastErr: unknown;
    for (const model of modelsToTry) {
      try {
        const res = await ai.models.generateContent({
          model,
          contents: buildNotebookLMPrompt(parsed.data.text, parsed.data.sourceName),
          config: { responseMimeType: "application/json", temperature: 0.3 },
        });
        if (res.text) {
          resText = res.text;
          break;
        }
      } catch (err) {
        lastErr = err;
        console.warn(`NotebookLM Model ${model} failed, trying fallback:`, err instanceof Error ? err.message : err);
      }
    }

    if (!resText) throw lastErr || new Error("No response from NotebookLM generation model.");

    const cleaned = resText.replace(/^```json\s*|```$/g, "").trim();
    const rawParsed = JSON.parse(cleaned);

    const data = NotebookStudySetSchema.parse({
      ...rawParsed,
      sourceSnippet: parsed.data.text.slice(0, 3000),
      sourceName: parsed.data.sourceName || "Source Notes",
    });

    // 5. Store in dedicated notebook_sets collection
    const ref = await adminDb()
      .collection("users")
      .doc(uid)
      .collection("notebook_sets")
      .add({ ...data, createdAt: new Date() });

    return NextResponse.json({ id: ref.id });
  } catch (e) {
    console.error("NotebookLM generation failed:", e instanceof Error ? e.message : e);
    return NextResponse.json(
      { error: "Could not generate NotebookLM study guide. Please verify your notes and try again." },
      { status: 500 }
    );
  }
}
