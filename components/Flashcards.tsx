"use client";

import { useEffect, useState, useCallback } from "react";

export default function Flashcards({ cards }: { cards: { front: string; back: string }[] }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const go = useCallback(
    (n: number) => {
      setI((prev) => (prev + n + cards.length) % cards.length);
      setFlipped(false);
    },
    [cards.length]
  );

  // Keyboard shortcut listener: Space to flip, Left/Right arrows to navigate
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        go(1);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [go]);

  const card = cards[i];
  const progressPct = ((i + 1) / cards.length) * 100;

  return (
    <div className="flashcards-wrapper">
      {/* Progress tracker */}
      <div className="flash-progress-bar-wrap">
        <div className="flash-progress-info">
          <span className="flash-count">
            Card <strong>{i + 1}</strong> of {cards.length}
          </span>
          <span className="flash-hint muted">Tip: Click or press Space to flip • Arrow keys to navigate</span>
        </div>
        <div className="flash-progress-track">
          <div className="flash-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* The 3D Flip Card */}
      <div
        className={`flash-card-scene ${flipped ? "is-flipped" : ""}`}
        onClick={() => setFlipped(!flipped)}
        role="button"
        tabIndex={0}
        aria-label={`Flashcard ${i + 1}: ${flipped ? "Answer side" : "Question side"}. Press Space to flip.`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped(!flipped);
          }
        }}
      >
        <div className="flash-card-inner">
          {/* Front / Question Face */}
          <div className="flash-face flash-front">
            <div className="flash-face-header">
              <span className="flash-tag">QUESTION</span>
              <span className="flash-flip-icon">🔄 Tap to reveal answer</span>
            </div>
            <div className="flash-body">
              <p className="flash-text">{card.front}</p>
            </div>
            <div className="flash-face-footer muted">Click anywhere or press Space</div>
          </div>

          {/* Back / Answer Face */}
          <div className="flash-face flash-back">
            <div className="flash-face-header">
              <span className="flash-tag answer-tag">ANSWER</span>
              <span className="flash-flip-icon">🔄 Tap to see question</span>
            </div>
            <div className="flash-body">
              <p className="flash-text">{card.back}</p>
            </div>
            <div className="flash-face-footer muted">Mastered this concept? Keep moving!</div>
          </div>
        </div>
      </div>

      {/* Navigation Controls: Clear, transparent, animated buttons */}
      <div className="flash-controls-row">
        <button
          className="btn ghost btn-glass-nav"
          onClick={() => go(-1)}
          aria-label="Previous flashcard"
        >
          ← Previous
        </button>

        <button
          className="btn btn-primary-glow btn-flip-action"
          onClick={() => setFlipped(!flipped)}
        >
          {flipped ? "↺ Show Question" : "↻ Reveal Answer"}
        </button>

        <button
          className="btn ghost btn-glass-nav"
          onClick={() => go(1)}
          aria-label="Next flashcard"
        >
          Next →
        </button>
      </div>
    </div>
  );
}
