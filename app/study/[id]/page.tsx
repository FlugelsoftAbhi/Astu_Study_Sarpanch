"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import AuthGuard from "@/components/AuthGuard";
import Flashcards from "@/components/Flashcards";
import Quiz from "@/components/Quiz";
import { StudySetSchema, type StudySet } from "@/lib/schema";

type Tab = "summary" | "flashcards" | "quiz";

function Study() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [set, setSet] = useState<StudySet | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [tab, setTab] = useState<Tab>("summary");

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid, "sets", id))
      .then((snap) => {
        const parsed = snap.exists() ? StudySetSchema.safeParse(snap.data()) : null;
        if (parsed?.success) { setSet(parsed.data); setState("ready"); } else setState("missing");
      })
      .catch(() => setState("missing"));
  }, [user, id]);

  if (state === "loading") return <p className="muted">Loading…</p>;
  if (state === "missing" || !set)
    return <p>This study set was not found. <Link href="/dashboard">Back to my sets</Link></p>;

  return (
    <>
      <h1>{set.title}</h1>
      <div className="tabs" role="tablist">
        {(["summary", "flashcards", "quiz"] as Tab[]).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className="tab" onClick={() => setTab(t)}>
            {t === "summary" ? "Summary" : t === "flashcards" ? "Flashcards" : "Quiz"}
          </button>
        ))}
      </div>
      <div className="panel">
        {tab === "summary" && <p>{set.summary}</p>}
        {tab === "flashcards" && <Flashcards cards={set.flashcards} />}
        {tab === "quiz" && <Quiz setId={id} set={set} />}
      </div>
    </>
  );
}

export default function Page() {
  return <AuthGuard><Study /></AuthGuard>;
}
