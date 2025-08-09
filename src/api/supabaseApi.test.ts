import { describe, it, expect, vi } from 'vitest';
import { handleRequest } from './supabaseApi';

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

import { toast } from '@/hooks/use-toast';

describe('handleRequest', () => {
  it('returns data when request succeeds', async () => {
    const promise = Promise.resolve({ data: { ok: true }, error: null });
    const result = await handleRequest(promise, 'Failed');
    expect(result).toEqual({ data: { ok: true }, error: null });
    expect(toast).not.toHaveBeenCalled();
  });

  it('toasts and returns error when request fails', async () => {
    const promise = Promise.resolve({ data: null, error: { message: 'bad' } });
    const result = await handleRequest(promise, 'Failed');
    expect(result).toEqual({ data: null, error: { message: 'bad' } });
    expect(toast).toHaveBeenCalledWith({
      variant: 'destructive',
      title: 'Error',
      description: 'Failed',
    });
  });
});
