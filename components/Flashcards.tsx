"use client";

import { useState } from "react";

export default function Flashcards({ cards }: { cards: { front: string; back: string }[] }) {
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const go = (n: number) => {
    setI((i + n + cards.length) % cards.length);
    setFlipped(false);
  };
  const card = cards[i];
  return (
    <div>
      <button className={`flash ${flipped ? "back" : ""}`} onClick={() => setFlipped(!flipped)} aria-label="Flip card">
        <span className="flash-side">{flipped ? "Answer" : "Question"}</span>
        <span className="flash-text">{flipped ? card.back : card.front}</span>
      </button>
      <div className="row between">
        <button className="btn ghost" onClick={() => go(-1)}>Previous</button>
        <span className="muted">{i + 1} of {cards.length}</span>
        <button className="btn ghost" onClick={() => go(1)}>Next</button>
      </div>
    </div>
  );
}
