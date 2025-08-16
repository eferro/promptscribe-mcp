import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { handleRequest } from '@/api/supabaseApi';
import {
  signUp,
  signIn,
  resetPassword,
  updatePassword,
  getSession,
  onAuthStateChange,
  signOut,
  getUser,
} from './authService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
    },
  },
}));
vi.mock('@/api/supabaseApi', () => ({
  handleRequest: vi.fn(),
}));

interface MockAuthResult {
  data: Record<string, unknown>;
  error: null;
}

interface MockSessionResult {
  data: { session: null };
  error: null;
}

interface MockSubscriptionResult {
  data: { subscription: Record<string, unknown> };
}

interface MockUserResult {
  data: { user: null };
  error: null;
}

interface MockSignOutResult {
  error: null;
}

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signUp delegates to supabase', async () => {
    const result: MockAuthResult = { data: {}, error: null };
    const promise = Promise.resolve(result);
    vi.mocked(supabase.auth.signUp).mockReturnValue(promise);
    vi.mocked(handleRequest).mockResolvedValue(result);
    const response = await signUp('a@b.com', 'pass', 'redirect');
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass',
      options: { emailRedirectTo: 'redirect' },
    });
    expect(handleRequest).toHaveBeenCalledWith(promise, 'Sign up failed');
    expect(response).toBe(result);
  });

  it('signIn delegates to supabase', async () => {
    const result: MockAuthResult = { data: {}, error: null };
    const promise = Promise.resolve(result);
    vi.mocked(supabase.auth.signInWithPassword).mockReturnValue(promise);
    vi.mocked(handleRequest).mockResolvedValue(result);
    const response = await signIn('a@b.com', 'pass');
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass',
    });
    expect(handleRequest).toHaveBeenCalledWith(promise, 'Sign in failed');
    expect(response).toBe(result);
  });

  it('resetPassword delegates to supabase', async () => {
    const result: MockAuthResult = { data: {}, error: null };
    const promise = Promise.resolve(result);
    vi.mocked(supabase.auth.resetPasswordForEmail).mockReturnValue(promise);
    vi.mocked(handleRequest).mockResolvedValue(result);
    const response = await resetPassword('a@b.com', 'redir');
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('a@b.com', { redirectTo: 'redir' });
    expect(handleRequest).toHaveBeenCalledWith(promise, 'Reset failed');
    expect(response).toBe(result);
  });

  it('updatePassword delegates to supabase', async () => {
    const result: MockAuthResult = { data: {}, error: null };
    const promise = Promise.resolve(result);
    vi.mocked(supabase.auth.updateUser).mockReturnValue(promise);
    vi.mocked(handleRequest).mockResolvedValue(result);
    const response = await updatePassword('newpass');
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newpass' });
    expect(handleRequest).toHaveBeenCalledWith(promise, 'Password update failed');
    expect(response).toBe(result);
  });

  it('getSession delegates to supabase', async () => {
    const result: MockSessionResult = { data: { session: null }, error: null };
    const promise = Promise.resolve(result);
    vi.mocked(supabase.auth.getSession).mockReturnValue(promise);
    vi.mocked(handleRequest).mockResolvedValue(result);
    const response = await getSession();
    expect(supabase.auth.getSession).toHaveBeenCalled();
    expect(handleRequest).toHaveBeenCalledWith(promise, 'Failed to get session');
    expect(response).toBe(result);
  });

  it('onAuthStateChange delegates to supabase', () => {
    const subscription = { unsubscribe: vi.fn() };
    const result: MockSubscriptionResult = { data: { subscription } };
    const callback = vi.fn();
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue(result);
    const response = onAuthStateChange(callback);
    expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(callback);
    expect(response).toBe(result);
  });

  it('signOut delegates to supabase', async () => {
    const result: MockSignOutResult = { error: null };
    const promise = Promise.resolve(result);
    vi.mocked(supabase.auth.signOut).mockReturnValue(promise);
    vi.mocked(handleRequest).mockResolvedValue(result);
    const response = await signOut();
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(handleRequest).toHaveBeenCalledWith(promise, 'Sign out failed');
    expect(response).toBe(result);
  });

  it('getUser delegates to supabase', async () => {
    const result: MockUserResult = { data: { user: null }, error: null };
    const promise = Promise.resolve(result);
    vi.mocked(supabase.auth.getUser).mockReturnValue(promise);
    vi.mocked(handleRequest).mockResolvedValue(result);
    const response = await getUser();
    expect(supabase.auth.getUser).toHaveBeenCalled();
    expect(handleRequest).toHaveBeenCalledWith(promise, 'Failed to get user');
    expect(response).toBe(result);
  });
});

