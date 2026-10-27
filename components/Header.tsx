"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export default function Header() {
  const { user, loading, signIn, logOut } = useAuth();
  return (
    <header className="header">
      <Link href="/" className="brand">Study Companion</Link>
      <nav aria-label="Main">
        {user && (
          <>
            <Link href="/dashboard">My sets</Link>
            <Link href="/progress">Progress</Link>
          </>
        )}
        <Link href="/privacy">Privacy</Link>
        {!loading &&
          (user ? (
            <button className="btn ghost" onClick={logOut}>Sign out</button>
          ) : (
            <button className="btn" onClick={() => signIn().catch(() => alert("Sign-in was cancelled or failed."))}>
              Sign in with Google
            </button>
          ))}
      </nav>
    </header>
  );
}
