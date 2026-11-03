"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import NotebookHeader from "@/components/notebook/NotebookHeader";
import { NOTEBOOK_MAX_CHARS, NOTEBOOK_MIN_CHARS } from "@/lib/notebookSchema";

interface NotebookItem {
  id: string;
  title: string;
  briefingDoc: string;
  sourceName: string;
  createdAt?: Date;
}

export default function NotebookDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [sourceName, setSourceName] = useState("Lecture Notes");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notebooks, setNotebooks] = useState<NotebookItem[] | null>(null);

  const loadNotebooks = useCallback(async () => {
    if (!user) return;
    try {
      const snap = await getDocs(
        query(collection(db, "users", user.uid, "notebook_sets"), orderBy("createdAt", "desc"))
      );
      setNotebooks(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            title: data.title || "Untitled Notebook",
            briefingDoc: data.briefingDoc || "",
            sourceName: data.sourceName || "Source Document",
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : undefined,
          };
        })
      );
    } catch {
      setError("Could not load your notebooks.");
      setNotebooks([]);
    }
  }, [user]);

  useEffect(() => {
    loadNotebooks();
  }, [loadNotebooks]);

  const onFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith(".txt") || file.size > 300_000) {
      setError("Please choose a .txt source file under 300 KB.");
      return;
    }
    setSourceName(file.name.replace(/\.txt$/i, ""));
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result).slice(0, NOTEBOOK_MAX_CHARS));
    reader.readAsText(file);
  };

  const handleGenerate = async () => {
    setError("");
    setBusy(true);
    try {
      const token = await auth.currentUser!.getIdToken();
      const res = await fetch("/api/notebook/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text, sourceName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed to create notebook.");
      router.push(`/notebook/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  };

  const deleteNotebook = async (id: string) => {
    if (!user || !confirm("Delete this NotebookLM study guide?")) return;
    await deleteDoc(doc(db, "users", user.uid, "notebook_sets", id));
    setNotebooks((prev) => prev?.filter((item) => item.id !== id) ?? null);
  };

  const len = text.trim().length;
  const valid = len >= NOTEBOOK_MIN_CHARS && len <= NOTEBOOK_MAX_CHARS;

  return (
    <>
      <NotebookHeader />

      <main className="nb-container">
        {/* Google NotebookLM Hero */}
        <section className="nb-hero">
          <div className="nb-hero-badge">
            <span>✨ GOOGLE NOTEBOOKLM STUDIO</span>
          </div>
          <h2 className="nb-hero-title">Source-Grounded Study Studio</h2>
          <p className="nb-hero-subtitle">
            Upload your lecture slides, readings, or notes. Google Gemini will ground itself strictly in your source to synthesize a briefing document, key glossary, FAQs, flashcards, and quizzes.
          </p>
        </section>

        {/* Source Document Creator */}
        <div className="nb-card">
          <div className="nb-card-head">
            <h3 className="nb-card-title">
              <span>📄</span> Add Source Document
            </h3>
            <label className="nb-btn nb-btn-ghost" style={{ cursor: "pointer" }}>
              📂 Upload .txt
              <input type="file" accept=".txt" onChange={onFileUpload} style={{ display: "none" }} />
            </label>
          </div>

          <div className="nb-input-row">
            <input
              type="text"
              className="nb-input"
              placeholder="Source Document Name (e.g. Biology Ch 4 - Cell Division)"
              value={sourceName}
              onChange={(e) => setSourceName(e.target.value)}
              maxLength={100}
            />
          </div>

          <textarea
            className="nb-textarea"
            placeholder="Paste your source text, textbook notes, or research excerpt here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={NOTEBOOK_MAX_CHARS + 500}
          />

          <div className="nb-char-counter">
            <span style={{ color: len > NOTEBOOK_MAX_CHARS ? "var(--nb-coral)" : "var(--nb-muted)" }}>
              {len} / {NOTEBOOK_MAX_CHARS} characters (minimum {NOTEBOOK_MIN_CHARS})
            </span>
            {text.length > 0 && (
              <button
                className="nb-btn nb-btn-ghost"
                style={{ padding: "0.2rem 0.6rem", fontSize: "0.75rem" }}
                onClick={() => setText("")}
              >
                Clear Text
              </button>
            )}
          </div>

          {error && (
            <p style={{ color: "var(--nb-coral)", fontSize: "0.9rem", fontWeight: 600, margin: "0.5rem 0" }}>
              ⚠️ {error}
            </p>
          )}

          <button
            className="nb-btn nb-btn-primary"
            disabled={!valid || busy}
            onClick={handleGenerate}
            style={{ width: "100%", padding: "0.85rem", fontSize: "1rem" }}
          >
            {busy ? "⚡ Synthesizing Grounded NotebookLM Studio Guide… (10–15s)" : "✨ Create NotebookLM Studio Guide"}
          </button>
        </div>

        {/* Saved Notebooks Grid */}
        <section className="nb-list-section">
          <div className="nb-section-head">
            <h3 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#fff", margin: 0 }}>
              Your Notebooks ({notebooks?.length ?? 0})
            </h3>
            <Link href="/" className="nb-link-back">
              ⚡ Back to Warrior Vault
            </Link>
          </div>

          {notebooks === null && (
            <div className="nb-card" style={{ textAlign: "center", padding: "2rem" }}>
              <p style={{ color: "var(--nb-muted)" }}>Loading notebooks…</p>
            </div>
          )}

          {notebooks?.length === 0 && (
            <div className="nb-card" style={{ textAlign: "center", padding: "2.5rem" }}>
              <p style={{ color: "var(--nb-muted)", margin: 0 }}>
                No notebooks created yet. Paste your first source material above to generate a grounded briefing!
              </p>
            </div>
          )}

          <div className="nb-grid">
            {notebooks?.map((nb) => (
              <div key={nb.id} className="nb-notebook-card">
                <div>
                  <div className="nb-card-meta">
                    <span className="nb-source-tag">📄 {nb.sourceName}</span>
                    <span className="nb-time-meta">
                      {nb.createdAt ? nb.createdAt.toLocaleDateString() : "Recently"}
                    </span>
                  </div>
                  <h4 className="nb-item-title">{nb.title}</h4>
                  <p className="nb-item-snippet">{nb.briefingDoc}</p>
                </div>

                <div className="nb-item-actions">
                  <Link href={`/notebook/${nb.id}`} className="nb-btn nb-btn-primary" style={{ fontSize: "0.8rem" }}>
                    Open Studio →
                  </Link>
                  <button
                    className="nb-btn nb-btn-danger"
                    style={{ fontSize: "0.78rem", padding: "0.3rem 0.65rem" }}
                    onClick={() => deleteNotebook(nb.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
