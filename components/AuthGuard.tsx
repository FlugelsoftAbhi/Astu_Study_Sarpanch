"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

// Wrap any private page. Redirects to the home page when signed out.
// (Real protection is Firestore rules + server token checks; this is UX.)
export default function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/");
  }, [loading, user, router]);

  if (loading || !user) return <p className="muted center">Checking your sign-in…</p>;
  return <>{children}</>;
}
