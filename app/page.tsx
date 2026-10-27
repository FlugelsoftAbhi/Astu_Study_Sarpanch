"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function Home() {
  const { user, loading, signIn } = useAuth();
  return (
    <>
      <h1>Paste your notes. Get a quiz you can take in two minutes.</h1>
      <p className="muted">
        Study Companion uses Google Gemini to turn your notes into a short summary, eight flashcards and a
        five-question quiz. Your sets and scores are private to your Google account.
      </p>
      {!loading &&
        (user ? (
          <Link href="/dashboard" className="btn">Go to my study sets</Link>
        ) : (
          <button className="btn" onClick={() => signIn().catch(() => alert("Sign-in was cancelled or failed."))}>
            Sign in with Google to start
          </button>
        ))}
      <section className="panel">
        <h2>How it works</h2>
        <ol>
          <li>Sign in with Google.</li>
          <li>Paste notes or upload a .txt file (50 to 8,000 characters).</li>
          <li>Read the summary, flip the flashcards, then take the quiz.</li>
          <li>Check your scores on the progress page.</li>
        </ol>
      </section>
    </>
  );
}
