"use client";

import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import AuthGuard from "@/components/AuthGuard";

type Attempt = { id: string; setTitle: string; score: number; total: number; createdAt?: Date };

function Progress() {
  const { user } = useAuth();
  const [rows, setRows] = useState<Attempt[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    getDocs(query(collection(db, "users", user.uid, "attempts"), orderBy("createdAt", "desc")))
      .then((snap) =>
        setRows(snap.docs.map((d) => {
          const x = d.data();
          return { id: d.id, setTitle: x.setTitle, score: x.score, total: x.total, createdAt: x.createdAt?.toDate() };
        }))
      )
      .catch(() => { setError("Could not load your progress."); setRows([]); });
  }, [user]);

  const clearAll = async () => {
    if (!rows || !confirm("Delete all your quiz scores?")) return;
    await Promise.all(rows.map((r) => deleteDoc(doc(db, "users", user!.uid, "attempts", r.id))));
    setRows([]);
  };

  if (rows === null) return <p className="muted">Loading…</p>;
  const pct = rows.map((r) => (r.score / r.total) * 100);
  const avg = pct.length ? Math.round(pct.reduce((a, b) => a + b, 0) / pct.length) : 0;
  const best = pct.length ? Math.round(Math.max(...pct)) : 0;

  return (
    <>
      <h1>Your progress</h1>
      {error && <p className="error">{error}</p>}
      {rows.length === 0 ? (
        <p className="muted">No quiz attempts yet. Finish a quiz and your score will show up here.</p>
      ) : (
        <>
          <div className="stats panel">
            <div className="stat"><strong>{rows.length}</strong>quizzes taken</div>
            <div className="stat"><strong>{avg}%</strong>average score</div>
            <div className="stat"><strong>{best}%</strong>best score</div>
          </div>
          <table>
            <thead><tr><th>Study set</th><th>Score</th><th>Date</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td>{r.setTitle}</td><td>{r.score}/{r.total}</td><td>{r.createdAt?.toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p><button className="btn danger" onClick={clearAll}>Delete all my scores</button></p>
        </>
      )}
    </>
  );
}

export default function Page() {
  return <AuthGuard><Progress /></AuthGuard>;
}
