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
        setRows(
          snap.docs.map((d) => {
            const x = d.data();
            return {
              id: d.id,
              setTitle: x.setTitle,
              score: x.score,
              total: x.total,
              createdAt: x.createdAt?.toDate(),
            };
          })
        )
      )
      .catch(() => {
        setError("Could not load your progress records.");
        setRows([]);
      });
  }, [user]);

  const clearAll = async () => {
    if (!rows || !confirm("Delete all your recorded quiz scores permanently?")) return;
    await Promise.all(rows.map((r) => deleteDoc(doc(db, "users", user!.uid, "attempts", r.id))));
    setRows([]);
  };

  if (rows === null) {
    return (
      <div className="panel center glass-panel">
        <p className="muted">Retrieving combat records…</p>
      </div>
    );
  }

  const pct = rows.map((r) => (r.score / r.total) * 100);
  const avg = pct.length ? Math.round(pct.reduce((a, b) => a + b, 0) / pct.length) : 0;
  const best = pct.length ? Math.round(Math.max(...pct)) : 0;

  return (
    <div className="progress-page animate-fade-in">
      <span className="section-tag">MASTERY AUDIT</span>
      <h1>Your Combat Records</h1>
      <p className="muted">
        Track your average retention, best scores, and consistency over time.
      </p>

      {error && <p className="error">{error}</p>}

      {rows.length === 0 ? (
        <div className="center panel glass-panel" style={{ marginTop: "1.5rem" }}>
          <p className="muted">No quiz attempts yet. Complete a quiz in any study set to track your progress.</p>
        </div>
      ) : (
        <>
          <div className="stats glass-panel" style={{ margin: "1.5rem 0" }}>
            <div className="stat">
              <strong>{rows.length}</strong>
              <span className="muted">Quizzes Conquered</span>
            </div>
            <div className="stat">
              <strong style={{ color: avg >= 80 ? "var(--good)" : "var(--brand)" }}>{avg}%</strong>
              <span className="muted">Average Retention</span>
            </div>
            <div className="stat">
              <strong style={{ color: "var(--mark)" }}>{best}%</strong>
              <span className="muted">Personal Record</span>
            </div>
          </div>

          <div className="glass-panel table-panel">
            <table className="progress-table">
              <thead>
                <tr>
                  <th>Study Set</th>
                  <th>Score</th>
                  <th>Accuracy</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const itemPct = Math.round((r.score / r.total) * 100);
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{r.setTitle}</td>
                      <td>
                        {r.score} / {r.total}
                      </td>
                      <td>
                        <span className={`score-badge ${itemPct >= 80 ? "badge-high" : "badge-mid"}`}>
                          {itemPct}%
                        </span>
                      </td>
                      <td className="muted">{r.createdAt?.toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <button className="btn btn-danger-glass btn-sm" onClick={clearAll}>
              Delete all my scores
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Page() {
  return (
    <AuthGuard>
      <Progress />
    </AuthGuard>
  );
}
