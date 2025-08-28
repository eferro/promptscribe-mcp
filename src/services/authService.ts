import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { handleRequest } from '@/api/supabaseApi';
import { UserProfileService } from './userProfileService';

export async function signUp(email: string, password: string, username: string, redirectUrl: string) {
  // First, check if username is available
  const { data: isAvailable, error: availabilityError } = await UserProfileService.isUsernameAvailable(username);
  
  if (availabilityError) {
    return { data: null, error: availabilityError };
  }
  
  if (!isAvailable) {
    return { 
      data: null, 
      error: { message: 'Username is already taken. Please choose a different one.' } 
    };
  }

  // Proceed with signup
  const signUpResult = await handleRequest(
    supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectUrl },
    }) as Promise<{ data: unknown; error: { message: string } | null }>,
    'Sign up failed'
  );

  // If signup successful, create user profile
  if (signUpResult.data && !signUpResult.error) {
    try {
      // Note: We can't get the user ID yet since email confirmation is required
      // The profile will be created after email confirmation
      // For now, we'll store the username in localStorage to use after confirmation
      localStorage.setItem('pendingUsername', username);
    } catch (error) {
      console.warn('Failed to store pending username:', error);
    }
  }

  return signUpResult;
}

export async function signIn(email: string, password: string) {
  return handleRequest(
    supabase.auth.signInWithPassword({ email, password }) as Promise<{ data: unknown; error: { message: string } | null }>,
    'Sign in failed'
  );
}

export async function resetPassword(email: string, redirectTo: string) {
  return handleRequest(
    supabase.auth.resetPasswordForEmail(email, { redirectTo }) as Promise<{ data: unknown; error: { message: string } | null }>,
    'Reset failed'
  );
}

export async function updatePassword(password: string) {
  return handleRequest(
    supabase.auth.updateUser({ password }) as Promise<{ data: unknown; error: { message: string } | null }>,
    'Password update failed'
  );
}

export async function getSession() {
  return handleRequest(
    supabase.auth.getSession() as Promise<{ data: unknown; error: { message: string } | null }>,
    'Failed to get session'
  );
}

export function onAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

export async function signOut() {
  return handleRequest(
    supabase.auth.signOut() as Promise<{ data: unknown; error: { message: string } | null }>,
    'Sign out failed'
  );
}

export async function getUser() {
  return handleRequest(
    supabase.auth.getUser() as Promise<{ data: unknown; error: { message: string } | null }>,
    'Failed to get user'
  );
}

/**
 * Create user profile after email confirmation
 * This should be called when the user first signs in after confirming their email
 */
export async function createUserProfileAfterConfirmation(userId: string, email: string): Promise<{ data: unknown; error: { message: string } | null }> {
  try {
    // Get pending username from localStorage
    const pendingUsername = localStorage.getItem('pendingUsername');
    
    if (pendingUsername) {
      // Use the username from signup
      const { error: profileError } = await UserProfileService.createProfile({
        user_id: userId,
        username: pendingUsername,
        display_name: pendingUsername,
      });
      
      if (profileError) {
        return { data: null, error: profileError };
      }
      
      // Clear pending username
      localStorage.removeItem('pendingUsername');
      return { data: 'Profile created successfully', error: null };
    } else {
      // Generate default username from email
      const { data: generatedUsername, error: generationError } = await UserProfileService.generateUniqueUsername(email);
      
      if (generationError || !generatedUsername) {
        return { data: null, error: { message: 'Failed to generate username' } };
      }
      
      const { error: profileError } = await UserProfileService.createProfile({
        user_id: userId,
        username: generatedUsername,
        display_name: generatedUsername,
      });
      
      if (profileError) {
        return { data: null, error: profileError };
      }
      
      return { data: 'Profile created successfully', error: null };
    }
  } catch {
    return { 
      data: null, 
      error: { message: 'Failed to create user profile' } 
    };
  }
}
