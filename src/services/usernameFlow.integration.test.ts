import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signUp, createUserProfileAfterConfirmation } from '@/services/authService';
import { UserProfileService } from '@/services/userProfileService';
import { TemplateService } from '@/services/templateService';
import { supabase } from '@/integrations/supabase/client';

vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      auth: {
        signUp: vi.fn(),
      },
      from: vi.fn(),
    },
  };
});

vi.mock('@/api/supabaseApi', () => ({
  handleRequest: (request: any) => request,
}));

describe('username flow integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('completes signup with profile creation', async () => {
    const from = vi.mocked(supabase.from);
    from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows' },
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { user_id: 'user-123', username: 'testuser', display_name: 'testuser' },
              error: null,
            }),
          }),
        }),
      });

    vi.mocked(supabase.auth.signUp).mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    const signup = await signUp('test@example.com', 'password', 'testuser', 'http://localhost');
    expect(signup.error).toBeNull();
    expect(localStorage.getItem('pendingUsername')).toBe('testuser');

    const profileCreation = await createUserProfileAfterConfirmation('user-123', 'test@example.com');
    expect(profileCreation).toEqual({ data: 'Profile created successfully', error: null });
    expect(localStorage.getItem('pendingUsername')).toBeNull();
  });

  it('updates username through UserProfileService', async () => {
    const from = vi.mocked(supabase.from);
    from
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: 'PGRST116', message: 'No rows' },
            }),
          }),
        }),
      })
      .mockReturnValueOnce({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { user_id: 'user-123', username: 'newuser' },
                error: null,
              }),
            }),
          }),
        }),
      });

    const result = await UserProfileService.updateUsername('user-123', 'newuser');
    expect(result.error).toBeNull();
    expect(result.data?.username).toBe('newuser');
  });

  it('creates templates with username', async () => {
    const from = vi.mocked(supabase.from);
    from.mockReturnValueOnce({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'tmpl-1',
              name: 'Test',
              description: null,
              template_data: { messages: [{ role: 'user', content: 'Hi' }], arguments: [] },
              user_id: 'user-123',
              created_by_username: 'testuser',
              is_public: false,
              created_at: '2024-01-01',
              updated_at: '2024-01-01',
              tags: null,
            },
            error: null,
          }),
        }),
      }),
    });

    const service = new TemplateService(supabase as any);
    const result = await service.create({
      name: 'Test',
      description: undefined,
      messages: [{ role: 'user', content: 'Hi' }],
      arguments: [],
      userId: 'user-123',
      isPublic: false,
    });

    expect(result.createdByUsername).toBe('testuser');
  });
});
