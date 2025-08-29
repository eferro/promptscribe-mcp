import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from './client';
import { cookieStorage } from './cookieStorage';

describe('Supabase Client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates supabase client with correct configuration', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(supabase.from).toBeDefined();
  });

  it('uses Vite environment variables for configuration', () => {
    // In Vitest with Vite, import.meta.env exposes VITE_* vars if defined for the test env.
    // We only assert that the client has non-empty configuration.
    expect((supabase as Record<string, unknown>)['supabaseUrl']).toBeTruthy();
    expect((supabase as Record<string, unknown>)['supabaseKey']).toBeTruthy();
  });

  it('has auth methods available', () => {
    expect(supabase.auth.signUp).toBeDefined();
    expect(supabase.auth.signInWithPassword).toBeDefined();
    expect(supabase.auth.signOut).toBeDefined();
    expect(supabase.auth.resetPasswordForEmail).toBeDefined();
  });

  it('has database query methods available', () => {
    expect(typeof supabase.from).toBe('function');

    // Test that from returns an object with query methods
    const query = supabase.from('prompt_templates');
    expect(query.select).toBeDefined();
    expect(query.insert).toBeDefined();
    expect(query.update).toBeDefined();
    expect(query.delete).toBeDefined();
  });

  it('uses cookie-based storage for auth persistence', () => {
    const storage = (supabase.auth as Record<string, unknown>)['storage'];
    expect(storage).toBe(cookieStorage);
    expect(typeof (storage as Storage).getItem).toBe('function');
    expect(typeof (storage as Storage).setItem).toBe('function');
    expect(typeof (storage as Storage).removeItem).toBe('function');
  });

  it('supports auth state changes', () => {
    expect(supabase.auth.onAuthStateChange).toBeDefined();
    expect(typeof supabase.auth.onAuthStateChange).toBe('function');
  });

  it('supports session management', () => {
    expect(supabase.auth.getSession).toBeDefined();
    expect(supabase.auth.getUser).toBeDefined();
  });
});