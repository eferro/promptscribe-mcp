import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInstance = {};
const TemplateServiceMock = vi.fn(() => mockInstance);
vi.mock('../services/templateService', () => ({
  TemplateService: TemplateServiceMock,
}));
vi.mock('../integrations/supabase/client', () => ({
  supabase: {},
}));

describe('useTemplateService', () => {
  beforeEach(() => {
    vi.resetModules();
    TemplateServiceMock.mockClear();
  });

  it('returns the same TemplateService instance on subsequent calls', async () => {
    const { useTemplateService } = await import('./useServices');

    const first = useTemplateService();
    const second = useTemplateService();

    expect(first).toBe(mockInstance);
    expect(second).toBe(mockInstance);
    expect(TemplateServiceMock).toHaveBeenCalledTimes(1);
  });
});
