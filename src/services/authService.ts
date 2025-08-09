import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { handleRequest } from '@/api/supabaseApi';

export async function signUp(email: string, password: string, redirectUrl: string) {
  return handleRequest(
    supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    }),
    'Sign up failed'
  );
}

export async function signIn(email: string, password: string) {
  return handleRequest(
    supabase.auth.signInWithPassword({ email, password }),
    'Sign in failed'
  );
}

export async function resetPassword(email: string, redirectTo: string) {
  return handleRequest(
    supabase.auth.resetPasswordForEmail(email, { redirectTo }),
    'Reset failed'
  );
}

export async function updatePassword(password: string) {
  return handleRequest(
    supabase.auth.updateUser({ password }),
    'Password update failed'
  );
}

export async function getSession() {
  return handleRequest(
    supabase.auth.getSession(),
    'Failed to get session'
  );
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function signOut() {
  return handleRequest(
    supabase.auth.signOut(),
    'Sign out failed'
  );
}

export async function getUser() {
  return handleRequest(
    supabase.auth.getUser(),
    'Failed to get user'
  );
}
