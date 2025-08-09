import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { handleRequest } from '@/api/supabaseApi';
import {
  fetchUserTemplates,
  fetchPublicTemplates,
  saveTemplate,
  deleteTemplate,
} from './templateService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));
vi.mock('@/api/supabaseApi', () => ({
  handleRequest: vi.fn(),
}));

describe('templateService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchUserTemplates queries supabase correctly', async () => {
    const result = { data: [], error: null } as any;
    const promise = Promise.resolve(result);
    const order = vi.fn(() => promise);
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    vi.mocked(supabase.from).mockReturnValue({ select } as any);
    vi.mocked(handleRequest).mockResolvedValue(result);

    const response = await fetchUserTemplates('user-1');
    expect(supabase.from).toHaveBeenCalledWith('prompt_templates');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(order).toHaveBeenCalledWith('updated_at', { ascending: false });
    expect(handleRequest).toHaveBeenCalledWith(promise, 'Failed to load templates');
    expect(response).toBe(result);
  });

  it('fetchPublicTemplates queries supabase correctly', async () => {
    const result = { data: [], error: null } as any;
    const promise = Promise.resolve(result);
    const order = vi.fn(() => promise);
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    vi.mocked(supabase.from).mockReturnValue({ select } as any);
    vi.mocked(handleRequest).mockResolvedValue(result);

    const response = await fetchPublicTemplates();
    expect(supabase.from).toHaveBeenCalledWith('prompt_templates');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('is_public', true);
    expect(order).toHaveBeenCalledWith('updated_at', { ascending: false });
    expect(handleRequest).toHaveBeenCalledWith(promise, 'Failed to load templates');
    expect(response).toBe(result);
  });

  it('saveTemplate inserts when no id', async () => {
    const result = { error: null } as any;
    const promise = Promise.resolve(result);
    const insert = vi.fn(() => promise);
    vi.mocked(supabase.from).mockReturnValue({ insert } as any);
    vi.mocked(handleRequest).mockResolvedValue(result);
    const payload = { name: 't' };
    const response = await saveTemplate(payload);
    expect(supabase.from).toHaveBeenCalledWith('prompt_templates');
    expect(insert).toHaveBeenCalledWith([payload]);
    expect(handleRequest).toHaveBeenCalledWith(promise, 'Failed to save template');
    expect(response).toBe(result);
  });

  it('saveTemplate updates when id provided', async () => {
    const result = { error: null } as any;
    const promise = Promise.resolve(result);
    const eq = vi.fn(() => promise);
    const update = vi.fn(() => ({ eq }));
    vi.mocked(supabase.from).mockReturnValue({ update } as any);
    vi.mocked(handleRequest).mockResolvedValue(result);
    const payload = { name: 't' };
    const response = await saveTemplate(payload, 'id-1');
    expect(supabase.from).toHaveBeenCalledWith('prompt_templates');
    expect(update).toHaveBeenCalledWith(payload);
    expect(eq).toHaveBeenCalledWith('id', 'id-1');
    expect(handleRequest).toHaveBeenCalledWith(promise, 'Failed to save template');
    expect(response).toBe(result);
  });

  it('deleteTemplate delegates to supabase', async () => {
    const result = { error: null } as any;
    const promise = Promise.resolve(result);
    const eq = vi.fn(() => promise);
    const del = vi.fn(() => ({ eq }));
    vi.mocked(supabase.from).mockReturnValue({ delete: del } as any);
    vi.mocked(handleRequest).mockResolvedValue(result);

    const response = await deleteTemplate('id-1');
    expect(supabase.from).toHaveBeenCalledWith('prompt_templates');
    expect(del).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 'id-1');
    expect(handleRequest).toHaveBeenCalledWith(promise, 'Failed to delete template');
    expect(response).toBe(result);
  });
});

