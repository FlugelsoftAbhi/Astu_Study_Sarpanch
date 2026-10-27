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

  const score = answers.reduce<number>((s, a, i) => (a === set.quiz[i].answerIndex ? s + 1 : s), 0);

  const finish = async () => {
    setDone(true);
    if (!user) return;
    try {
      await addDoc(collection(db, "users", user.uid, "attempts"), {
        setId,
        setTitle: set.title,
        score,
        total: set.quiz.length,
        createdAt: serverTimestamp(),
      });
    } catch {
      setSaveError("Your score could not be saved to your progress page.");
    }
  };

  const restart = () => {
    setAnswers(Array(set.quiz.length).fill(null));
    setStep(0);
    setDone(false);
    setSaveError("");
  };

  if (done) {
    return (
      <div>
        <h3>You scored {score} out of {set.quiz.length}</h3>
        {saveError && <p className="error">{saveError}</p>}
        {set.quiz.map((q, i) => {
          const ok = answers[i] === q.answerIndex;
          return (
            <div key={i} className={`review ${ok ? "ok" : "bad"}`}>
              <p><strong>{i + 1}. {q.question}</strong></p>
              <p>Your answer: {answers[i] === null ? "none" : q.options[answers[i]!]}</p>
              {!ok && <p>Correct answer: {q.options[q.answerIndex]}</p>}
              <p className="muted">{q.explanation}</p>
            </div>
          );
        })}
        <button className="btn" onClick={restart}>Try again</button>
      </div>
    );
  }

  const q = set.quiz[step];
  return (
    <div>
      <p className="muted">Question {step + 1} of {set.quiz.length}</p>
      <h3>{q.question}</h3>
      <div role="radiogroup" aria-label="Answer options">
        {q.options.map((o, idx) => (
          <label key={idx} className={`option ${answers[step] === idx ? "picked" : ""}`}>
            <input
              type="radio"
              name={`q${step}`}
              checked={answers[step] === idx}
              onChange={() => setAnswers(answers.map((a, i) => (i === step ? idx : a)))}
            />
            {o}
          </label>
        ))}
      </div>
      <div className="row between">
        <button className="btn ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</button>
        {step < set.quiz.length - 1 ? (
          <button className="btn" disabled={answers[step] === null} onClick={() => setStep(step + 1)}>Next</button>
        ) : (
          <button className="btn" disabled={answers.some((a) => a === null)} onClick={finish}>Finish quiz</button>
        )}
      </div>
    </div>
  );
}
