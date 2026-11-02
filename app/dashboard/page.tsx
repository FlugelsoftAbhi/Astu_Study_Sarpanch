"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import AuthGuard from "@/components/AuthGuard";
import { MAX_CHARS, MIN_CHARS } from "@/lib/schema";
import { useRouter } from "next/navigation";

type Item = { id: string; title: string; createdAt?: Date };

function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<Item[] | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const snap = await getDocs(query(collection(db, "users", user.uid, "sets"), orderBy("createdAt", "desc")));
      setItems(snap.docs.map((d) => ({ id: d.id, title: d.data().title, createdAt: d.data().createdAt?.toDate() })));
    } catch {
      setError("Could not load your study sets.");
      setItems([]);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith(".txt") || f.size > 200_000) {
      setError("Please choose a valid .txt file under 200 KB.");
      return;
    }
    const r = new FileReader();
    r.onload = () => setText(String(r.result).slice(0, MAX_CHARS));
    r.readAsText(f);
  };

  const generate = async () => {
    setError("");
    setBusy(true);
    try {
      const token = await auth.currentUser!.getIdToken();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      router.push(`/study/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!user || !confirm("Delete this study set from your vault?")) return;
    await deleteDoc(doc(db, "users", user.uid, "sets", id));
    setItems((cur) => cur?.filter((i) => i.id !== id) ?? null);
  };

  const len = text.trim().length;
  const valid = len >= MIN_CHARS && len <= MAX_CHARS;

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="dashboard-header">
        <span className="section-tag">PERSONAL VAULT</span>
        <h1>Forge a New Study Set</h1>
        <p className="muted">
          Feed raw notes, study guides, or transcript text into Google Gemini for instant synthesis.
        </p>
      </div>

      <div className="glass-panel" style={{ marginTop: "1.25rem" }}>
        <div className="row between" style={{ marginBottom: "0.5rem" }}>
          <label htmlFor="notes" className="label-bold">
            Raw Study Notes / Lecture Material
          </label>
          <label className="btn ghost btn-sm btn-file-upload">
            📂 Upload .txt file
            <input type="file" accept=".txt" onChange={onFile} style={{ display: "none" }} aria-label="Upload .txt file" />
          </label>
        </div>

        <textarea
          id="notes"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste lecture notes, book summaries, flashcard prompts, or code definitions here..."
          maxLength={MAX_CHARS + 500}
        />

        <div className="row between" style={{ margin: "0.75rem 0 1rem" }}>
          <span className={len > MAX_CHARS ? "error" : "muted"}>
            {len} / {MAX_CHARS} characters (minimum {MIN_CHARS})
          </span>
          {text.length > 0 && (
            <button className="btn ghost btn-sm" onClick={() => setText("")}>
              Clear
            </button>
          )}
        </div>

        {error && <p className="error" role="alert">{error}</p>}

        <button
          className="btn btn-primary-glow btn-lg"
          disabled={!valid || busy}
          onClick={generate}
          style={{ width: "100%", justifyContent: "center" }}
        >
          {busy ? "⚡ Synthesizing with Gemini… (about 10 seconds)" : "🚀 Generate Flashcards & Quiz"}
        </button>
      </div>

      <div className="vault-list-section" style={{ marginTop: "3rem" }}>
        <div className="row between">
          <h2>Your Study Vault</h2>
          {items && items.length > 0 && <span className="muted">{items.length} total sets</span>}
        </div>

        {items === null && (
          <div className="center panel glass-panel">
            <p className="muted">Retrieving your study vault…</p>
          </div>
        )}

        {items?.length === 0 && (
          <div className="center panel glass-panel">
            <p className="muted">No study sets yet. Paste your first notes above to lock in!</p>
          </div>
        )}

        <ul className="list vault-list">
          {items?.map((i) => (
            <li key={i.id} className="glass-panel vault-item">
              <div className="vault-item-info">
                <Link href={`/study/${i.id}`} className="vault-title-link">
                  {i.title}
                </Link>
                <div className="muted" style={{ fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  Created {i.createdAt ? i.createdAt.toLocaleDateString() : "Recently"}
                </div>
              </div>
              <div className="row" style={{ gap: "0.5rem" }}>
                <Link href={`/study/${i.id}`} className="btn ghost btn-sm">
                  Open Vault →
                </Link>
                <button
                  className="btn btn-danger-glass btn-sm"
                  onClick={() => remove(i.id)}
                  aria-label={`Delete study set ${i.title}`}
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <Dashboard />
    </AuthGuard>
  );
}
