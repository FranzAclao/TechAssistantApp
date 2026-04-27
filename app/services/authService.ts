import type { AuthChangeEvent, Session } from "@supabase/supabase-js";

import { supabase } from "./supabaseService";

function getCleanErrorMessage(error: unknown, fallback: string): string {
  if (!error) return fallback;
  if (error instanceof Error && typeof error.message === "string" && error.message.trim().length > 0) {
    return error.message.trim();
  }
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim().length > 0) return message.trim();
  }
  return fallback;
}

export async function signUp(email: string, password: string, fullName: string): Promise<void> {
  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) throw error;
  } catch (error) {
    throw new Error(getCleanErrorMessage(error, "Unable to sign up. Please try again."));
  }
}

export async function signIn(email: string, password: string): Promise<void> {
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  } catch (error) {
    throw new Error(getCleanErrorMessage(error, "Unable to sign in. Please try again."));
  }
}

export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    throw new Error(getCleanErrorMessage(error, "Unable to sign out. Please try again."));
  }
}

export async function getSession(): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session ?? null;
  } catch (error) {
    throw new Error(getCleanErrorMessage(error, "Unable to get session. Please try again."));
  }
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void,
) {
  const { data } = supabase.auth.onAuthStateChange(callback);
  return data.subscription;
}

