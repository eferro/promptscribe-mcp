import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export async function signUp(email: string, password: string, redirectUrl: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: redirectUrl },
  });
}

export async function signIn(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function resetPassword(email: string, redirectTo: string) {
  return supabase.auth.resetPasswordForEmail(email, { redirectTo });
}

export async function updatePassword(password: string) {
  return supabase.auth.updateUser({ password });
}

export async function getSession() {
  return supabase.auth.getSession();
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getUser() {
  return supabase.auth.getUser();
}
