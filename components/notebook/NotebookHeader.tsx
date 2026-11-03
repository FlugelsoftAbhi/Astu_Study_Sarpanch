"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

export default function NotebookHeader({ notebookTitle }: { notebookTitle?: string }) {
  const { user, loading, signIn, logOut } = useAuth();

  return (
    <header className="nb-header">
      <div className="nb-brand-wrap">
        <Link href="/notebook" className="nb-brand-wrap">
          <div className="nb-logo-icon">📓</div>
          <div className="nb-title-group">
            <h1 className="nb-brand-title">NotebookLM Studio</h1>
            <span className="nb-badge-chip">SOURCE GROUNDED</span>
          </div>
        </Link>
        {notebookTitle && (
          <span style={{ color: "var(--nb-muted)", fontSize: "0.85rem", marginLeft: "0.5rem" }}>
            / {notebookTitle}
          </span>
        )}
      </div>

      <nav className="nb-header-nav" aria-label="Notebook navigation">
        <Link href="/" className="nb-link-back" title="Switch to Warrior Study Vault">
          ⚡ Switch to Warrior Mode
        </Link>
        <Link href="/notebook" className="nb-link-back">
          📁 My Notebooks
        </Link>

        {!loading &&
          (user ? (
            <button className="nb-btn nb-btn-ghost" onClick={logOut}>
              Sign out
            </button>
          ) : (
            <button className="nb-btn nb-btn-primary" onClick={() => signIn().catch(() => {})}>
              Sign in with Google
            </button>
          ))}
      </nav>
    </header>
  );
}
