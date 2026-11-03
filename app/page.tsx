"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

type ThemeType = "adrenaline" | "vibey" | "nerd";

export default function Home() {
  const { user, loading, signIn } = useAuth();
  const [theme, setTheme] = useState<ThemeType>("adrenaline");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("study_theme") as ThemeType | null;
      if (saved && (saved === "adrenaline" || saved === "vibey" || saved === "nerd")) {
        setTheme(saved);
      }
    } catch {
      // Ignore
    }

    const onThemeChange = (e: CustomEvent<ThemeType>) => {
      if (e.detail) setTheme(e.detail);
    };
    window.addEventListener("study_theme_change" as unknown as keyof WindowEventMap, onThemeChange as EventListener);
    return () => {
      window.removeEventListener("study_theme_change" as unknown as keyof WindowEventMap, onThemeChange as EventListener);
    };
  }, []);

  const changeTheme = (newTheme: ThemeType) => {
    setTheme(newTheme);
    try {
      localStorage.setItem("study_theme", newTheme);
    } catch {
      // Ignore
    }
    document.documentElement.setAttribute("data-theme", newTheme);
    window.dispatchEvent(new CustomEvent("study_theme_change", { detail: newTheme }));
  };

  const themes: { id: ThemeType; label: string; icon: string; desc: string }[] = [
    { id: "adrenaline", label: "Adrenaline", icon: "⚡", desc: "Beast Mode & High Octane Warrior Mindset" },
    { id: "vibey", label: "Comfy Vibe", icon: "🌸", desc: "Cozy Lo-Fi Aesthetic & Relaxed Mood" },
    { id: "nerd", label: "Straight Nerd", icon: "📟", desc: "Clean Blueprint & Solid Framing" },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge animate-pulse">
          <span className="badge-glow-dot" />
          <span>GEMINI 2.5 • RELENTLESS ACTIVE RECALL</span>
        </div>

        <h1 className="hero-headline">
          FORGE UNBREAKABLE KNOWLEDGE.
          <br />
          <span className="hero-gradient-text">CRUSH EVERY EXAM.</span>
        </h1>

        <p className="hero-subtitle">
          Turn massive piles of notes into high-yield summaries, 8 active-recall flashcards, and a diagnostic 5-question quiz in seconds. Choose your study atmosphere and lock in.
        </p>

        {/* Action Buttons: Transparent, clear, animated */}
        <div className="hero-cta-group">
          {!loading &&
            (user ? (
              <Link href="/dashboard" className="btn btn-hero btn-primary-glow">
                <span>Enter Study Vault</span>
                <span className="btn-arrow">→</span>
              </Link>
            ) : (
              <button
                className="btn btn-hero btn-primary-glow"
                onClick={() => signIn().catch(() => {})}
              >
                <span>Sign In with Google</span>
                <span className="btn-arrow">⚡</span>
              </button>
            ))}

          <Link href="/notebook" className="btn btn-hero ghost btn-glass-secondary" title="Google NotebookLM grounded research & study mode">
            <span>📓 NotebookLM Studio</span>
            <span className="btn-icon">✨</span>
          </Link>

          <a href="#themes" className="btn btn-hero ghost btn-glass-secondary">
            <span>Choose Atmosphere</span>
            <span className="btn-icon">🎨</span>
          </a>
        </div>
      </section>

      {/* Theme Atmosphere Selector Section */}
      <section id="themes" className="atmosphere-section glass-panel">
        <div className="section-head">
          <span className="section-tag">CUSTOMIZE YOUR FREQUENCY</span>
          <h2 className="section-title">Select Your Study Atmosphere</h2>
          <p className="section-desc muted">
            Every brain learns differently. Switch themes anytime to match your mood and focus style.
          </p>
        </div>

        <div className="theme-card-selector" role="group" aria-label="Choose your study atmosphere">
          {themes.map((t) => (
            <button
              key={t.id}
              className={`theme-big-btn ${theme === t.id ? "active" : ""}`}
              onClick={() => changeTheme(t.id)}
              aria-pressed={theme === t.id}
            >
              <div className="theme-big-header">
                <span className="theme-big-icon">{t.icon}</span>
                <span className="theme-big-title">{t.label}</span>
                {theme === t.id && <span className="theme-active-tag">Active</span>}
              </div>
              <p className="theme-big-desc">{t.desc}</p>
            </button>
          ))}
        </div>

        <div className="theme-active-preview">
          <span className="preview-label">CURRENT ATMOSPHERE:</span>
          <strong className="preview-name">
            {theme === "adrenaline" && "⚡ ADRENALINE RUSH (WARRIOR FOCUS)"}
            {theme === "vibey" && "🌸 COMFY & VIBEY (LO-FI STUDY LOUNGE)"}
            {theme === "nerd" && "📟 STRAIGHT NERD (DEEP WORK BLUEPRINT)"}
          </strong>
        </div>
      </section>

      {/* Badass Toughness Preview Strip */}
      <section className="warrior-banner glass-panel">
        <div className="warrior-banner-left">
          <span className="warrior-icon">🥊</span>
          <div>
            <h3 className="warrior-banner-title">Built for the Relentless</h3>
            <p className="warrior-banner-quote muted">
              &ldquo;Don&apos;t stop when you&apos;re tired, stop when you&apos;re done.&rdquo; — David Goggins
            </p>
          </div>
        </div>
        <div className="warrior-banner-badges">
          <span className="warrior-pill">Goggins Grit</span>
          <span className="warrior-pill">Khabib 29-0</span>
          <span className="warrior-pill">McGregor Vision</span>
        </div>
      </section>

      {/* Feature Grid with Transparent Glass Cards */}
      <section className="features-grid">
        <div className="feature-card glass-panel">
          <div className="feature-icon">⚡</div>
          <h3>10-Second AI Breakdown</h3>
          <p className="muted">
            Google Gemini strips fluff, isolates core definitions, formulas, and key facts into a punchy study brief.
          </p>
        </div>

        <div className="feature-card glass-panel">
          <div className="feature-icon">🎴</div>
          <h3>Active Recall Flashcards</h3>
          <p className="muted">
            Flip through high-yield front/back cards with tactile 3D animations engineered to test immediate memory retrieval.
          </p>
        </div>

        <div className="feature-card glass-panel">
          <div className="feature-icon">🎯</div>
          <h3>Battle-Tested Quizzes</h3>
          <p className="muted">
            5 multiple-choice questions with immediate answer validation and rich conceptual explanations.
          </p>
        </div>

        <div className="feature-card glass-panel">
          <div className="feature-icon">🎵</div>
          <h3>Integrated Lo-Fi & Focus Beats</h3>
          <p className="muted">
            Toggle chill chords, coffee shop rain, or 432Hz deep binaural alpha waves directly in the player.
          </p>
        </div>
      </section>

      {/* How It Works Clean Roadmap */}
      <section className="how-it-works glass-panel">
        <div className="section-head">
          <span className="section-tag">EXECUTION PLAYBOOK</span>
          <h2 className="section-title">How To Lock In</h2>
        </div>

        <div className="steps-row">
          <div className="step-item">
            <span className="step-num">01</span>
            <h4>Sign In</h4>
            <p className="muted">Sync your personal study sets and score records securely with Google.</p>
          </div>
          <div className="step-divider">→</div>
          <div className="step-item">
            <span className="step-num">02</span>
            <h4>Paste Notes</h4>
            <p className="muted">Drop in 50 to 8,000 characters from lecture slides, textbooks, or notes.</p>
          </div>
          <div className="step-divider">→</div>
          <div className="step-item">
            <span className="step-num">03</span>
            <h4>Execute</h4>
            <p className="muted">Digest the summary, drill flashcards, conquer the quiz, and log scores.</p>
          </div>
        </div>

        <div className="center" style={{ marginTop: "2rem" }}>
          {!loading &&
            (user ? (
              <Link href="/dashboard" className="btn btn-primary-glow btn-lg">
                Go to My Study Vault →
              </Link>
            ) : (
              <button
                className="btn btn-primary-glow btn-lg"
                onClick={() => signIn().catch(() => {})}
              >
                Sign In & Start Studying →
              </button>
            ))}
        </div>
      </section>
    </div>
  );
}
