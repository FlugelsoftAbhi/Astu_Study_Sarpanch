"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";

type Ctx = { user: User | null; loading: boolean; signIn: () => Promise<void>; logOut: () => Promise<void> };
const AuthContext = createContext<Ctx>({ user: null, loading: true, signIn: async () => {}, logOut: async () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  const signIn = async () => {
    try {
      if (!auth.app.options.apiKey) {
        throw new Error(
          "Firebase API Key is missing. Please ensure NEXT_PUBLIC_FIREBASE_API_KEY and other Firebase variables are configured in your Vercel Project Settings."
        );
      }
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err: unknown) {
      const e = err as { code?: string; message?: string };
      console.error("Firebase Sign-In Error:", err);
      if (e.code === "auth/unauthorized-domain") {
        alert(
          "⚠️ Domain Not Authorized in Firebase!\n\n" +
            "The domain '" +
            (typeof window !== "undefined" ? window.location.hostname : "astu-study-sarpanch.vercel.app") +
            "' is not in your Firebase Authorized Domains.\n\n" +
            "To fix this:\n" +
            "1. Open Firebase Console (https://console.firebase.google.com)\n" +
            "2. Select your project -> Authentication -> Settings tab\n" +
            "3. Under 'Authorized domains', click 'Add domain'\n" +
            "4. Enter: " +
            (typeof window !== "undefined" ? window.location.hostname : "astu-study-sarpanch.vercel.app")
        );
      } else if (e.code === "auth/popup-blocked") {
        alert("The sign-in popup was blocked by your browser. Please allow popups for this site and try again.");
      } else if (e.code === "auth/popup-closed-by-user" || e.code === "auth/cancelled-popup-request") {
        // User closed popup
      } else {
        alert("Sign-in error: " + (e.message || "Failed to sign in."));
      }
      throw err;
    }
  };
  const logOut = async () => {
    await signOut(auth);
  };

  return <AuthContext.Provider value={{ user, loading, signIn, logOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
