"use client";

import { useState } from "react";
import type { NotebookFlashcard } from "@/lib/notebookSchema";

export default function NotebookFlashcards({ cards }: { cards: NotebookFlashcard[] }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  if (!cards || cards.length === 0) {
    return <p style={{ color: "var(--nb-muted)", fontSize: "0.85rem" }}>No flashcards generated.</p>;
  }

  const go = (step: number) => {
    setIndex((prev) => (prev + step + cards.length) % cards.length);
    setFlipped(false);
  };

  const current = cards[index];

  return (
    <div>
      <div className="nb-card-meta">
        <span className="nb-source-tag">{current.tag || "Core Concept"}</span>
        <span className="nb-time-meta">
          Card {index + 1} of {cards.length}
        </span>
      </div>

      <div
        className="nb-flash-card"
        onClick={() => setFlipped(!flipped)}
        role="button"
        tabIndex={0}
        aria-label="Click to flip flashcard"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped(!flipped);
          }
        }}
      >
        <span className="nb-flash-side">{flipped ? "SOURCE-GROUNDED ANSWER" : "RECALL PROMPT"}</span>
        <p className="nb-flash-text">{flipped ? current.back : current.front}</p>
        <span style={{ fontSize: "0.75rem", color: "var(--nb-muted)" }}>
          {flipped ? "Tap to see question" : "Tap to reveal answer"}
        </span>
      </div>

      <div className="nb-flash-nav">
        <button className="nb-btn nb-btn-ghost" onClick={() => go(-1)} aria-label="Previous card">
          ← Prev
        </button>
        <button className="nb-btn nb-btn-ghost" onClick={() => setFlipped(!flipped)}>
          Flip ↻
        </button>
        <button className="nb-btn nb-btn-ghost" onClick={() => go(1)} aria-label="Next card">
          Next →
        </button>
      </div>
    </div>
  );
}
