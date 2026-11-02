"use client";

import { useState } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "./AuthProvider";
import type { StudySet } from "@/lib/schema";

export default function Quiz({ setId, set }: { setId: string; set: StudySet }) {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(set.quiz.length).fill(null));
  const [done, setDone] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saving, setSaving] = useState(false);

  const score = answers.reduce<number>((s, a, i) => (a === set.quiz[i].answerIndex ? s + 1 : s), 0);
  const total = set.quiz.length;
  const scorePct = Math.round((score / total) * 100);

  const finish = async () => {
    setDone(true);
    if (!user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "users", user.uid, "attempts"), {
        setId,
        setTitle: set.title,
        score,
        total,
        createdAt: serverTimestamp(),
      });
    } catch {
      setSaveError("Your score could not be automatically recorded to your progress vault.");
    } finally {
      setSaving(false);
    }
  };

  const restart = () => {
    setAnswers(Array(set.quiz.length).fill(null));
    setStep(0);
    setDone(false);
    setSaveError("");
  };

  if (done) {
    let motivationalTitle = "GOOD EFFORT! TIME TO DRILL AGAIN.";
    let motivationalBadge = "RETRY & CONQUER";
    if (score === total) {
      motivationalTitle = "ABSOLUTE DOMINANCE. ZERO EXCUSES.";
      motivationalBadge = "🏆 CHAMPION MINDSET";
    } else if (score >= total - 1) {
      motivationalTitle = "WARRIOR STANDARD. ALMOST FLAWLESS.";
      motivationalBadge = "⚡ HIGH-OCTANE MASTERY";
    }

    return (
      <div className="quiz-result-view animate-fade-in">
        <div className="quiz-score-header glass-panel center">
          <span className="quiz-result-badge">{motivationalBadge}</span>
          <h2 className="quiz-score-title">
            You Scored {score} / {total} ({scorePct}%)
          </h2>
          <p className="quiz-score-sub muted">{motivationalTitle}</p>
          {saving && <p className="muted">Recording attempt to your progress vault…</p>}
          {saveError && <p className="error">{saveError}</p>}

          <div className="quiz-score-actions">
            <button className="btn btn-primary-glow btn-lg" onClick={restart}>
              ↻ Retry Quiz & Reinforce
            </button>
          </div>
        </div>

        <h3 className="review-heading">Diagnostic Breakdown</h3>
        <div className="quiz-breakdown-list">
          {set.quiz.map((q, i) => {
            const ok = answers[i] === q.answerIndex;
            return (
              <div key={i} className={`quiz-review-card glass-panel ${ok ? "review-ok" : "review-bad"}`}>
                <div className="review-card-head">
                  <span className={`review-status-pill ${ok ? "pill-good" : "pill-bad"}`}>
                    {ok ? "✓ Correct" : "✕ Needs Review"}
                  </span>
                  <span className="review-q-num">Question {i + 1}</span>
                </div>

                <p className="review-question">
                  <strong>{q.question}</strong>
                </p>

                <div className="review-answers-box">
                  <p className="review-chosen">
                    <span className="muted">Your selection: </span>
                    <strong className={ok ? "good" : "bad"}>
                      {answers[i] === null ? "None" : q.options[answers[i]!]}
                    </strong>
                  </p>
                  {!ok && (
                    <p className="review-correct">
                      <span className="muted">Correct answer: </span>
                      <strong className="good">{q.options[q.answerIndex]}</strong>
                    </p>
                  )}
                </div>

                <div className="review-explanation">
                  <span className="exp-label">💡 Key Takeaway: </span>
                  <span className="muted">{q.explanation}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const q = set.quiz[step];
  const answeredCurrent = answers[step] !== null;

  return (
    <div className="quiz-active-view">
      {/* Quiz Progress Header */}
      <div className="quiz-header-status">
        <div className="quiz-step-meta">
          <span className="step-tracker">
            Question <strong>{step + 1}</strong> of {set.quiz.length}
          </span>
          <span className="active-badge-chip">Active Drill</span>
        </div>
        <div className="quiz-track-bar">
          <div
            className="quiz-track-fill"
            style={{ width: `${((step + 1) / set.quiz.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="quiz-question-box">
        <h3 className="quiz-question-title">{q.question}</h3>
      </div>

      {/* Transparent glass options with animated hover/selection */}
      <div className="quiz-options-group" role="radiogroup" aria-label="Question options">
        {q.options.map((optionText, idx) => {
          const isSelected = answers[step] === idx;
          return (
            <label
              key={idx}
              className={`quiz-option-card ${isSelected ? "option-selected" : ""}`}
            >
              <input
                type="radio"
                name={`question-${step}`}
                checked={isSelected}
                onChange={() =>
                  setAnswers((prev) => prev.map((ans, i) => (i === step ? idx : ans)))
                }
                className="quiz-radio-input"
              />
              <span className="option-radio-ring">{isSelected ? "●" : "○"}</span>
              <span className="option-text">{optionText}</span>
            </label>
          );
        })}
      </div>

      {/* Transparent Animated Action Buttons */}
      <div className="quiz-footer-nav row between">
        <button
          className="btn ghost btn-glass-nav"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          ← Back
        </button>

        {step < set.quiz.length - 1 ? (
          <button
            className="btn btn-primary-glow"
            disabled={!answeredCurrent}
            onClick={() => setStep((s) => s + 1)}
          >
            Next Question →
          </button>
        ) : (
          <button
            className="btn btn-primary-glow btn-finish"
            disabled={answers.some((a) => a === null)}
            onClick={finish}
          >
            🔥 Lock In & Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}
