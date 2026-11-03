"use client";

import { useState } from "react";
import type { NotebookQuiz as QuizItem } from "@/lib/notebookSchema";

export default function NotebookQuiz({ questions }: { questions: QuizItem[] }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);

  if (!questions || questions.length === 0) {
    return <p style={{ color: "var(--nb-muted)", fontSize: "0.85rem" }}>No quiz items available.</p>;
  }

  const score = answers.reduce<number>((sum, ans, idx) => {
    return ans === questions[idx].answerIndex ? sum + 1 : sum;
  }, 0);

  const q = questions[step];

  if (submitted) {
    return (
      <div className="nb-quiz-wrap">
        <div style={{ textAlign: "center", padding: "1rem 0" }}>
          <span className="nb-badge-chip">STUDIO EVALUATION</span>
          <h3 style={{ margin: "0.5rem 0", color: "#fff", fontSize: "1.3rem" }}>
            Score: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
          </h3>
          <p style={{ color: "var(--nb-muted)", fontSize: "0.85rem" }}>
            All questions were validated strictly against your uploaded source notes.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.85rem", maxHeight: "360px", overflowY: "auto" }}>
          {questions.map((item, i) => {
            const correct = answers[i] === item.answerIndex;
            return (
              <div
                key={i}
                style={{
                  padding: "0.85rem",
                  borderRadius: "8px",
                  background: "var(--nb-surface-card)",
                  borderLeft: `3px solid ${correct ? "var(--nb-green)" : "var(--nb-coral)"}`,
                }}
              >
                <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#fff", marginBottom: "0.3rem" }}>
                  {i + 1}. {item.question}
                </div>
                <div style={{ fontSize: "0.8rem", color: correct ? "var(--nb-green)" : "var(--nb-coral)", marginBottom: "0.3rem" }}>
                  Your answer: {answers[i] !== null ? item.options[answers[i]!] : "Unanswered"}
                  {!correct && ` (Correct: ${item.options[item.answerIndex]})`}
                </div>
                <div style={{ fontSize: "0.78rem", color: "var(--nb-muted)", lineHeight: 1.4 }}>
                  {item.explanation}
                </div>
              </div>
            );
          })}
        </div>

        <button
          className="nb-btn nb-btn-primary"
          onClick={() => {
            setAnswers(Array(questions.length).fill(null));
            setStep(0);
            setSubmitted(false);
          }}
          style={{ marginTop: "1rem" }}
        >
          ↻ Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div className="nb-quiz-wrap">
      <div className="nb-card-meta">
        <span className="nb-source-tag">Comprehension Check</span>
        <span className="nb-time-meta">
          Question {step + 1} of {questions.length}
        </span>
      </div>

      <h4 className="nb-quiz-q-title">{q.question}</h4>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }} role="radiogroup">
        {q.options.map((opt, idx) => {
          const selected = answers[step] === idx;
          return (
            <label key={idx} className={`nb-quiz-opt ${selected ? "picked" : ""}`}>
              <input
                type="radio"
                name={`nb-q-${step}`}
                checked={selected}
                onChange={() =>
                  setAnswers((prev) => prev.map((a, i) => (i === step ? idx : a)))
                }
                style={{ display: "none" }}
              />
              <span style={{ color: selected ? "var(--nb-blue)" : "var(--nb-muted)", fontSize: "0.85rem" }}>
                {selected ? "●" : "○"}
              </span>
              <span>{opt}</span>
            </label>
          );
        })}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
        <button
          className="nb-btn nb-btn-ghost"
          disabled={step === 0}
          onClick={() => setStep((s) => s - 1)}
        >
          Back
        </button>
        {step < questions.length - 1 ? (
          <button
            className="nb-btn nb-btn-primary"
            disabled={answers[step] === null}
            onClick={() => setStep((s) => s + 1)}
          >
            Next →
          </button>
        ) : (
          <button
            className="nb-btn nb-btn-primary"
            disabled={answers.some((a) => a === null)}
            onClick={() => setSubmitted(true)}
          >
            Submit Quiz
          </button>
        )}
      </div>
    </div>
  );
}
