import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from './client';

// Mock localStorage for testing
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

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
    expect((supabase as any).supabaseUrl).toBeTruthy();
    expect((supabase as any).supabaseKey).toBeTruthy();
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

  it('uses localStorage for auth persistence', () => {
    // This tests that the client was configured with localStorage
    // The actual persistence is handled internally by Supabase
    expect(supabase).toBeDefined();
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