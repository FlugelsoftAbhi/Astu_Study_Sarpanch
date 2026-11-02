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

interface ToughLegend {
  id: string;
  name: string;
  nickname: string;
  discipline: string;
  quote: string;
  statLabel: string;
  statValue: string;
  image: string;
  accent: string;
}

const TOUGH_LEGENDS: ToughLegend[] = [
  {
    id: "goggins",
    name: "David Goggins",
    nickname: "The Toughest Man Alive",
    discipline: "Navy SEAL • Ultra-Endurance Legend",
    quote: "WHO'S GONNA CARRY THE BOATS?! Don't stop when you're tired; stop when you're done. Stay hard!",
    statLabel: "Mental Toughness",
    statValue: "100% Unbroken",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/David_Goggins.jpg/480px-David_Goggins.jpg",
    accent: "#ff3344",
  },
  {
    id: "khabib",
    name: "Khabib Nurmagomedov",
    nickname: "The Eagle",
    discipline: "29-0 Undefeated UFC Champion",
    quote: "Send me location. If you want to be champion, you have to smash every single day and never complain.",
    statLabel: "Discipline & Will",
    statValue: "29 - 0 Dominance",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Khabib_Nurmagomedov_in_2018.jpg/480px-Khabib_Nurmagomedov_in_2018.jpg",
    accent: "#e5a93c",
  },
  {
    id: "mcgregor",
    name: "Conor McGregor",
    nickname: "The Notorious",
    discipline: "UFC Double Champion",
    quote: "We're not here to take part, we're here to take over! Precision beats power, and timing beats speed.",
    statLabel: "Relentless Obsession",
    statValue: "Champ Champ",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Conor_McGregor_2018.jpg/480px-Conor_McGregor_2018.jpg",
    accent: "#10b981",
  },
  {
    id: "tyson",
    name: "Mike Tyson",
    nickname: "Iron Mike",
    discipline: "Youngest World Heavyweight Champ",
    quote: "Discipline is doing what you hate to do, but doing it like you love it. Ferocity and focus.",
    statLabel: "Iron Mentality",
    statValue: "Zero Excuses",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Mike_Tyson_2019_by_Glenn_Francis.jpg/480px-Mike_Tyson_2019_by_Glenn_Francis.jpg",
    accent: "#f97316",
  },
  {
    id: "brucelee",
    name: "Bruce Lee",
    nickname: "The Dragon",
    discipline: "Martial Arts Master & Philosopher",
    quote: "I fear not the man who has practiced 10,000 kicks once, but I fear the man who has practiced one kick 10,000 times.",
    statLabel: "Repetition Mastery",
    statValue: "Pure Focus",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Bruce_Lee_1973.jpg/480px-Bruce_Lee_1973.jpg",
    accent: "#38bdf8",
  },
  {
    id: "jocko",
    name: "Jocko Willink",
    nickname: "Discipline Equals Freedom",
    discipline: "Navy SEAL Commander • BJJ Black Belt",
    quote: "Don't count on motivation; count on discipline. When you don't feel like studying, that's when you do it anyway.",
    statLabel: "Execution Rate",
    statValue: "04:30 AM Mindset",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Jocko_Willink_in_2018.jpg/480px-Jocko_Willink_in_2018.jpg",
    accent: "#a855f7",
  },
];

function ToughMindsCollage() {
  const [collapsed, setCollapsed] = useState(false);
  const [activeLegend, setActiveLegend] = useState<ToughLegend | null>(null);
  const [hypeQuote, setHypeQuote] = useState<string>("");
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const triggerHype = () => {
    const random = TOUGH_LEGENDS[Math.floor(Math.random() * TOUGH_LEGENDS.length)];
    setActiveLegend(random);
    setHypeQuote(`🔥 ${random.name}: "${random.quote}"`);
  };

  const handleImageError = (id: string) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section className="tough-collage-container" aria-label="Toughest Minds Motivation Collage">
      <div className="tough-collage-header">
        <div className="tough-header-left">
          <span className="tough-badge">⚡ WARRIOR STUDY MINDSET</span>
          <h2 className="tough-title">Toughest Minds on Earth</h2>
          <p className="tough-subtitle muted">
            Lock in. Study with the relentless discipline of Goggins, Khabib, and Conor.
          </p>
        </div>
        <div className="tough-header-actions">
          <button
            className="btn btn-hype"
            onClick={triggerHype}
            title="Get an instant shot of mental adrenaline"
          >
            🔥 CARRY THE BOATS!
          </button>
          <button
            className="btn ghost btn-collapse"
            onClick={() => setCollapsed(!collapsed)}
            aria-expanded={!collapsed}
          >
            {collapsed ? "Expand Collage ▼" : "Minimize ▲"}
          </button>
        </div>
      </div>

      {hypeQuote && (
        <div className="hype-quote-banner" role="alert">
          <span className="hype-text">{hypeQuote}</span>
          <button
            className="hype-close-btn"
            onClick={() => setHypeQuote("")}
            aria-label="Dismiss banner"
          >
            ✕
          </button>
        </div>
      )}

      {!collapsed && (
        <div className="tough-grid">
          {TOUGH_LEGENDS.map((legend) => {
            const hasError = imageErrors[legend.id];
            const isSelected = activeLegend?.id === legend.id;

            return (
              <div
                key={legend.id}
                className={`tough-card ${isSelected ? "selected-legend" : ""}`}
                style={{ "--card-accent": legend.accent } as React.CSSProperties}
                onClick={() => setActiveLegend(legend)}
              >
                <div className="tough-card-img-wrap">
                  {!hasError ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={legend.image}
                      alt={legend.name}
                      className="tough-card-img"
                      loading="lazy"
                      onError={() => handleImageError(legend.id)}
                    />
                  ) : (
                    <div className="tough-card-fallback-avatar">
                      <span className="avatar-initials">
                        {legend.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                  )}
                  <div className="tough-overlay" />
                  <span className="tough-card-badge">{legend.nickname}</span>
                </div>

                <div className="tough-card-body">
                  <div className="tough-card-meta">
                    <h3 className="tough-card-name">{legend.name}</h3>
                    <p className="tough-card-discipline">{legend.discipline}</p>
                  </div>

                  <blockquote className="tough-quote">
                    &ldquo;{legend.quote}&rdquo;
                  </blockquote>

                  <div className="tough-stat-row">
                    <span className="tough-stat-label">{legend.statLabel}</span>
                    <span className="tough-stat-val">{legend.statValue}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Study() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [set, setSet] = useState<StudySet | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing">("loading");
  const [tab, setTab] = useState<Tab>("summary");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, "users", user.uid, "sets", id))
      .then((snap) => {
        const parsed = snap.exists() ? StudySetSchema.safeParse(snap.data()) : null;
        if (parsed?.success) {
          setSet(parsed.data);
          setState("ready");
        } else {
          setState("missing");
        }
      })
      .catch(() => setState("missing"));
  }, [user, id]);

  const copySummary = () => {
    if (!set) return;
    navigator.clipboard.writeText(set.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (state === "loading") {
    return (
      <div className="panel center glass-panel">
        <div className="loader-pulse" />
        <p className="muted" style={{ marginTop: "1rem" }}>
          Locking in your study vault…
        </p>
      </div>
    );
  }

  if (state === "missing" || !set) {
    return (
      <div className="panel center glass-panel">
        <h2>Study Set Not Found</h2>
        <p className="muted">This set may have been removed or belongs to another account.</p>
        <Link href="/dashboard" className="btn btn-primary-glow" style={{ marginTop: "1rem", display: "inline-block" }}>
          ← Back to My Sets
        </Link>
      </div>
    );
  }

  return (
    <div className="study-view-page">
      {/* Tough Minds Collage Banner directly embedded on the viewing page */}
      <ToughMindsCollage />

      {/* Set Header with Title & Action Stats */}
      <div className="study-header-card glass-panel">
        <div className="study-meta-row">
          <span className="session-status-badge">
            <span className="status-live-dot" /> LOCKED IN SESSION
          </span>
          <span className="study-counts">
            {set.flashcards.length} Flashcards • {set.quiz.length} Quiz Questions
          </span>
        </div>

        <h1 className="study-title">{set.title}</h1>

        <div className="study-actions-row">
          <Link href="/dashboard" className="btn ghost btn-sm">
            ← Vault Dashboard
          </Link>
          <button className="btn ghost btn-sm" onClick={copySummary}>
            {copied ? "✓ Summary Copied!" : "📋 Copy Summary"}
          </button>
        </div>
      </div>

      {/* Glassmorphic Tabs */}
      <div className="study-tabs glass-tabs" role="tablist" aria-label="Study views">
        <button
          role="tab"
          aria-selected={tab === "summary"}
          className={`tab-glass ${tab === "summary" ? "active" : ""}`}
          onClick={() => setTab("summary")}
        >
          <span className="tab-icon">📄</span>
          <span>Core Summary</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === "flashcards"}
          className={`tab-glass ${tab === "flashcards" ? "active" : ""}`}
          onClick={() => setTab("flashcards")}
        >
          <span className="tab-icon">🎴</span>
          <span>Flashcards ({set.flashcards.length})</span>
        </button>
        <button
          role="tab"
          aria-selected={tab === "quiz"}
          className={`tab-glass ${tab === "quiz" ? "active" : ""}`}
          onClick={() => setTab("quiz")}
        >
          <span className="tab-icon">🎯</span>
          <span>Power Quiz ({set.quiz.length}Q)</span>
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="study-content-panel glass-panel">
        {tab === "summary" && (
          <div className="summary-view animate-fade-in">
            <div className="summary-banner">
              <span className="summary-badge">GEMINI HIGH-YIELD DIGEST</span>
            </div>
            <div className="summary-text-box">
              <p className="summary-paragraph">{set.summary}</p>
            </div>
            <div className="summary-footer-action">
              <button className="btn btn-primary-glow" onClick={() => setTab("flashcards")}>
                Begin Flashcards →
              </button>
            </div>
          </div>
        )}

        {tab === "flashcards" && (
          <div className="animate-fade-in">
            <Flashcards cards={set.flashcards} />
          </div>
        )}

        {tab === "quiz" && (
          <div className="animate-fade-in">
            <Quiz setId={id} set={set} />
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <Study />
    </AuthGuard>
  );
}
