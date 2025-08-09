import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
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

describe('templateService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchUserTemplates queries supabase correctly', async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    vi.mocked(supabase.from).mockReturnValue({ select } as any);

    const result = await fetchUserTemplates('user-1');
    expect(supabase.from).toHaveBeenCalledWith('prompt_templates');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('user_id', 'user-1');
    expect(order).toHaveBeenCalledWith('updated_at', { ascending: false });
    expect(result).toEqual({ data: [], error: null });
  });

  it('fetchPublicTemplates queries supabase correctly', async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const eq = vi.fn(() => ({ order }));
    const select = vi.fn(() => ({ eq }));
    vi.mocked(supabase.from).mockReturnValue({ select } as any);

    const result = await fetchPublicTemplates();
    expect(supabase.from).toHaveBeenCalledWith('prompt_templates');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('is_public', true);
    expect(order).toHaveBeenCalledWith('updated_at', { ascending: false });
    expect(result).toEqual({ data: [], error: null });
  });

  it('saveTemplate inserts when no id', async () => {
    const insert = vi.fn().mockResolvedValue({ error: null });
    vi.mocked(supabase.from).mockReturnValue({ insert } as any);
    const payload = { name: 't' };
    const result = await saveTemplate(payload);
    expect(supabase.from).toHaveBeenCalledWith('prompt_templates');
    expect(insert).toHaveBeenCalledWith([payload]);
    expect(result).toEqual({ error: null });
  });

  it('saveTemplate updates when id provided', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const update = vi.fn(() => ({ eq }));
    vi.mocked(supabase.from).mockReturnValue({ update } as any);
    const payload = { name: 't' };
    const result = await saveTemplate(payload, 'id-1');
    expect(supabase.from).toHaveBeenCalledWith('prompt_templates');
    expect(update).toHaveBeenCalledWith(payload);
    expect(eq).toHaveBeenCalledWith('id', 'id-1');
    expect(result).toEqual({ error: null });
  });

  it('deleteTemplate delegates to supabase', async () => {
    const eq = vi.fn().mockResolvedValue({ error: null });
    const del = vi.fn(() => ({ eq }));
    vi.mocked(supabase.from).mockReturnValue({ delete: del } as any);

    const result = await deleteTemplate('id-1');
    expect(supabase.from).toHaveBeenCalledWith('prompt_templates');
    expect(del).toHaveBeenCalled();
    expect(eq).toHaveBeenCalledWith('id', 'id-1');
    expect(result).toEqual({ error: null });
  });
});

