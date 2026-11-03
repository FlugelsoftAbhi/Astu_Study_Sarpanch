"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import NotebookHeader from "@/components/notebook/NotebookHeader";
import NotebookFlashcards from "@/components/notebook/NotebookFlashcards";
import NotebookQuiz from "@/components/notebook/NotebookQuiz";
import NotebookAudioOverview from "@/components/notebook/NotebookAudioOverview";
import { NotebookStudySetSchema, type NotebookStudySet } from "@/lib/notebookSchema";

type StudioTab = "flashcards" | "quiz" | "audio";

export default function NotebookViewer() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();

  const [notebook, setNotebook] = useState<NotebookStudySet | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<StudioTab>("flashcards");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    getDoc(doc(db, "users", user.uid, "notebook_sets", id))
      .then((snap) => {
        if (snap.exists()) {
          const parsed = NotebookStudySetSchema.safeParse(snap.data());
          if (parsed.success) {
            setNotebook(parsed.data);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, id]);

  const copyBriefing = () => {
    if (!notebook) return;
    navigator.clipboard.writeText(notebook.briefingDoc);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <>
        <NotebookHeader />
        <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--nb-muted)" }}>
          <p>Loading NotebookLM Studio Guide…</p>
        </div>
      </>
    );
  }

  if (!notebook) {
    return (
      <>
        <NotebookHeader />
        <div className="nb-container" style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <h2>Notebook Not Found</h2>
          <p style={{ color: "var(--nb-muted)" }}>This notebook may have been deleted.</p>
          <Link href="/notebook" className="nb-btn nb-btn-primary" style={{ marginTop: "1rem" }}>
            ← Back to Notebooks
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <NotebookHeader notebookTitle={notebook.title} />

      <main className="nb-studio-layout">
        {/* ==========================================
            PANEL 1 (LEFT): SOURCES & REFERENCE EXCERPT
            ========================================== */}
        <section className="nb-panel" aria-label="Sources Panel">
          <div className="nb-panel-header">
            <h3 className="nb-panel-title">
              <span>📚</span> Sources (1)
            </h3>
            <span className="nb-badge-chip">100% Grounded</span>
          </div>

          <div className="nb-panel-body">
            <div className="nb-source-card">
              <div className="nb-source-name">📄 {notebook.sourceName}</div>
              <div style={{ fontSize: "0.75rem", color: "var(--nb-muted)", marginBottom: "0.5rem" }}>
                Active Document Grounding
              </div>
              <div className="nb-source-excerpt">
                {notebook.sourceSnippet || "No excerpt stored for this source."}
              </div>
            </div>

            <div style={{ marginTop: "1rem" }}>
              <Link href="/notebook" className="nb-btn nb-btn-ghost" style={{ width: "100%", fontSize: "0.82rem" }}>
                + Add Another Source
              </Link>
            </div>
          </div>
        </section>

        {/* ==========================================
            PANEL 2 (CENTER): BRIEFING DOC, KEY CONCEPTS & FAQS
            ========================================== */}
        <section className="nb-panel" aria-label="Executive Briefing & Notes">
          <div className="nb-panel-header">
            <h3 className="nb-panel-title">
              <span>📝</span> Study Guide & Briefing
            </h3>
            <button className="nb-btn nb-btn-ghost" style={{ padding: "0.25rem 0.65rem", fontSize: "0.75rem" }} onClick={copyBriefing}>
              {copied ? "✓ Copied!" : "📋 Copy Briefing"}
            </button>
          </div>

          <div className="nb-panel-body">
            <div className="nb-center-header">
              <h2 className="nb-doc-title">{notebook.title}</h2>
              <div className="nb-card-meta">
                <span className="nb-source-tag">Executive Briefing</span>
                <span className="nb-time-meta">Synthesized with Google Gemini</span>
              </div>
            </div>

            {/* Briefing Doc */}
            <div className="nb-briefing-box">
              <p style={{ margin: 0 }}>{notebook.briefingDoc}</p>
            </div>

            {/* Key Concepts Section */}
            <div className="nb-section-label">Key Concepts Glossary ({notebook.keyConcepts.length})</div>
            <div className="nb-concepts-grid">
              {notebook.keyConcepts.map((item, idx) => (
                <div key={idx} className="nb-concept-card">
                  <div className="nb-concept-term">{item.term}</div>
                  <div className="nb-concept-def">{item.definition}</div>
                  <div className="nb-concept-sig">📌 Significance: {item.significance}</div>
                </div>
              ))}
            </div>

            {/* Grounded FAQs Section */}
            <div className="nb-section-label">Grounded FAQs ({notebook.faqs.length})</div>
            <div className="nb-faq-list">
              {notebook.faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div key={idx} className="nb-faq-item">
                    <div
                      className="nb-faq-q"
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                    >
                      <span>{faq.question}</span>
                      <span>{isOpen ? "▲" : "▼"}</span>
                    </div>
                    {isOpen && <div className="nb-faq-a">{faq.answer}</div>}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==========================================
            PANEL 3 (RIGHT): STUDIO ARTIFACTS
            ========================================== */}
        <section className="nb-panel" aria-label="Studio Artifacts">
          <div className="nb-panel-header">
            <h3 className="nb-panel-title">
              <span>✨</span> Studio
            </h3>
            <span style={{ fontSize: "0.75rem", color: "var(--nb-muted)" }}>Interactive</span>
          </div>

          <div className="nb-panel-body">
            {/* Studio Navigation Tabs */}
            <div className="nb-studio-tabs" role="tablist">
              <button
                className={`nb-studio-tab ${activeTab === "flashcards" ? "active" : ""}`}
                onClick={() => setActiveTab("flashcards")}
              >
                🎴 Flashcards
              </button>
              <button
                className={`nb-studio-tab ${activeTab === "quiz" ? "active" : ""}`}
                onClick={() => setActiveTab("quiz")}
              >
                🎯 Quiz
              </button>
              <button
                className={`nb-studio-tab ${activeTab === "audio" ? "active" : ""}`}
                onClick={() => setActiveTab("audio")}
              >
                🎙️ Audio
              </button>
            </div>

            {/* Tab 1: Flashcards */}
            {activeTab === "flashcards" && (
              <NotebookFlashcards cards={notebook.flashcards} />
            )}

            {/* Tab 2: Quiz */}
            {activeTab === "quiz" && (
              <NotebookQuiz questions={notebook.quiz} />
            )}

            {/* Tab 3: Audio Overview */}
            {activeTab === "audio" && (
              <NotebookAudioOverview title={notebook.title} summary={notebook.briefingDoc} />
            )}
          </div>
        </section>
      </main>
    </>
  );
}
