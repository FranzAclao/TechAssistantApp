import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { getSession, onAuthStateChange, signIn as authSignIn, signOut as authSignOut, signUp as authSignUp } from "../services/authService";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      try {
        const currentSession = await getSession();
        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const subscription = onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      session,
      user,
      loading,
      async signIn(email: string, password: string) {
        try {
          await authSignIn(email, password);
        } catch (error) {
          throw error;
        }
      },
      async signUp(email: string, password: string, fullName: string) {
        try {
          await authSignUp(email, password, fullName);
        } catch (error) {
          throw error;
        }
      },
      async signOut() {
        try {
          await authSignOut();
        } catch (error) {
          throw error;
        }
      },
    };
  }, [loading, session, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
