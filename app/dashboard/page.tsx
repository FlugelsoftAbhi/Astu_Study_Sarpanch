"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";
import AuthGuard from "@/components/AuthGuard";
import { MAX_CHARS, MIN_CHARS } from "@/lib/schema";
import { useRouter } from "next/navigation";

type Item = { id: string; title: string; createdAt?: Date };

function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [items, setItems] = useState<Item[] | null>(null);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      const snap = await getDocs(query(collection(db, "users", user.uid, "sets"), orderBy("createdAt", "desc")));
      setItems(snap.docs.map((d) => ({ id: d.id, title: d.data().title, createdAt: d.data().createdAt?.toDate() })));
    } catch {
      setError("Could not load your study sets.");
      setItems([]);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.name.endsWith(".txt") || f.size > 200_000) {
      setError("Please choose a .txt file under 200 KB.");
      return;
    }
    const r = new FileReader();
    r.onload = () => setText(String(r.result).slice(0, MAX_CHARS));
    r.readAsText(f);
  };

  const generate = async () => {
    setError("");
    setBusy(true);
    try {
      const token = await auth.currentUser!.getIdToken();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      router.push(`/study/${data.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!user || !confirm("Delete this study set?")) return;
    await deleteDoc(doc(db, "users", user.uid, "sets", id));
    setItems((cur) => cur?.filter((i) => i.id !== id) ?? null);
  };

  const len = text.trim().length;
  const valid = len >= MIN_CHARS && len <= MAX_CHARS;

  return (
    <>
      <h1>Create a study set</h1>
      <label htmlFor="notes" className="muted">Paste your notes, or upload a .txt file</label>
      <textarea id="notes" value={text} onChange={(e) => setText(e.target.value)} maxLength={MAX_CHARS + 500} />
      <div className="row between" style={{ margin: ".5rem 0 1rem" }}>
        <span className={len > MAX_CHARS ? "error" : "muted"}>{len} / {MAX_CHARS} characters (minimum {MIN_CHARS})</span>
        <input type="file" accept=".txt" onChange={onFile} aria-label="Upload a .txt file" />
      </div>
      {error && <p className="error" role="alert">{error}</p>}
      <button className="btn" disabled={!valid || busy} onClick={generate}>
        {busy ? "Generating… this takes about 10 seconds" : "Generate study set"}
      </button>

      <h2 style={{ marginTop: "2.5rem" }}>Your study sets</h2>
      {items === null && <p className="muted">Loading…</p>}
      {items?.length === 0 && <p className="muted">No study sets yet. Paste some notes above to create your first one.</p>}
      <ul className="list">
        {items?.map((i) => (
          <li key={i.id}>
            <span>
              <Link href={`/study/${i.id}`}>{i.title}</Link>
              <br /><small className="muted">{i.createdAt?.toLocaleString()}</small>
            </span>
            <button className="btn danger" onClick={() => remove(i.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </>
  );
}

export default function Page() {
  return <AuthGuard><Dashboard /></AuthGuard>;
}
