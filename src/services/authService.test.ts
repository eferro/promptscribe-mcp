import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
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

describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signUp delegates to supabase', async () => {
    const result = { data: {}, error: null } as any;
    vi.mocked(supabase.auth.signUp).mockResolvedValue(result);
    const response = await signUp('a@b.com', 'pass', 'redirect');
    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass',
      options: { emailRedirectTo: 'redirect' },
    });
    expect(response).toBe(result);
  });

  it('signIn delegates to supabase', async () => {
    const result = { data: {}, error: null } as any;
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue(result);
    const response = await signIn('a@b.com', 'pass');
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'a@b.com',
      password: 'pass',
    });
    expect(response).toBe(result);
  });

  it('resetPassword delegates to supabase', async () => {
    const result = { data: {}, error: null } as any;
    vi.mocked(supabase.auth.resetPasswordForEmail).mockResolvedValue(result);
    const response = await resetPassword('a@b.com', 'redir');
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalledWith('a@b.com', { redirectTo: 'redir' });
    expect(response).toBe(result);
  });

  it('updatePassword delegates to supabase', async () => {
    const result = { data: {}, error: null } as any;
    vi.mocked(supabase.auth.updateUser).mockResolvedValue(result);
    const response = await updatePassword('newpass');
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'newpass' });
    expect(response).toBe(result);
  });

  it('getSession delegates to supabase', async () => {
    const result = { data: { session: null }, error: null } as any;
    vi.mocked(supabase.auth.getSession).mockResolvedValue(result);
    const response = await getSession();
    expect(supabase.auth.getSession).toHaveBeenCalled();
    expect(response).toBe(result);
  });

  it('onAuthStateChange delegates to supabase', () => {
    const subscription = { unsubscribe: vi.fn() };
    const result = { data: { subscription } } as any;
    const callback = vi.fn();
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue(result);
    const response = onAuthStateChange(callback);
    expect(supabase.auth.onAuthStateChange).toHaveBeenCalledWith(callback);
    expect(response).toBe(result);
  });

  it('signOut delegates to supabase', async () => {
    const result = { error: null } as any;
    vi.mocked(supabase.auth.signOut).mockResolvedValue(result);
    const response = await signOut();
    expect(supabase.auth.signOut).toHaveBeenCalled();
    expect(response).toBe(result);
  });

  it('getUser delegates to supabase', async () => {
    const result = { data: { user: null }, error: null } as any;
    vi.mocked(supabase.auth.getUser).mockResolvedValue(result);
    const response = await getUser();
    expect(supabase.auth.getUser).toHaveBeenCalled();
    expect(response).toBe(result);
  });
});

