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
    await signInWithPopup(auth, new GoogleAuthProvider());
  };
  const logOut = async () => {
    await signOut(auth);
  };

  return <AuthContext.Provider value={{ user, loading, signIn, logOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
