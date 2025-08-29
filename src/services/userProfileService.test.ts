import { describe, it, expect, vi, beforeEach } from 'vitest';
// Mock supabase client
import { handleRequest } from '@/api/supabaseApi';
import { UserProfileService } from './userProfileService';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn()
        })
      }),
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn()
        })
      }),
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn()
          })
        })
      }),
      delete: vi.fn().mockReturnValue({
        eq: vi.fn()
      })
    }),
  },
}));

vi.mock('@/api/supabaseApi', () => ({
  handleRequest: vi.fn(),
}));

describe('UserProfileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createProfile', () => {
    it('should create a new user profile', async () => {
      const mockProfile = {
        user_id: 'user-123',
        username: 'testuser',
        display_name: 'Test User',
        bio: 'Test bio',
        avatar_url: 'https://example.com/avatar.jpg'
      };

      const mockResponse = { data: { ...mockProfile, id: 'profile-123' }, error: null };
      vi.mocked(handleRequest).mockResolvedValue(mockResponse);

      const result = await UserProfileService.createProfile(mockProfile);

      expect(handleRequest).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });

    it('should handle creation errors', async () => {
      const mockProfile = { user_id: 'user-123', username: 'testuser' };
      const mockError = { data: null, error: { message: 'Database error' } };
      vi.mocked(handleRequest).mockResolvedValue(mockError);

      const result = await UserProfileService.createProfile(mockProfile);

      expect(result).toEqual(mockError);
    });
  });

  describe('getProfileByUserId', () => {
    it('should get profile by user ID', async () => {
      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        username: 'testuser',
        display_name: 'Test User'
      };

      const mockResponse = { data: mockProfile, error: null };
      vi.mocked(handleRequest).mockResolvedValue(mockResponse);

      const result = await UserProfileService.getProfileByUserId('user-123');

      expect(handleRequest).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getProfileByUsername', () => {
    it('should get profile by username', async () => {
      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        username: 'testuser'
      };

      const mockResponse = { data: mockProfile, error: null };
      vi.mocked(handleRequest).mockResolvedValue(mockResponse);

      const result = await UserProfileService.getProfileByUsername('testuser');

      expect(handleRequest).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updates = { display_name: 'Updated Name', bio: 'Updated bio' };
      const mockResponse = { data: { id: 'profile-123', ...updates }, error: null };
      vi.mocked(handleRequest).mockResolvedValue(mockResponse);

      const result = await UserProfileService.updateProfile('user-123', updates);

      expect(handleRequest).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe('updateUsername', () => {
    it('should update username when available', async () => {
      const mockProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        username: 'newusername'
      };

      const availabilitySpy = vi
        .spyOn(UserProfileService, 'isUsernameAvailable')
        .mockResolvedValue({ data: true, error: null });
      const updateSpy = vi
        .spyOn(UserProfileService, 'updateProfile')
        .mockResolvedValue({ data: mockProfile, error: null });

      const result = await UserProfileService.updateUsername('user-123', 'newusername');

      expect(availabilitySpy).toHaveBeenCalledWith('newusername', 'user-123');
      expect(updateSpy).toHaveBeenCalledWith('user-123', { username: 'newusername' });
      expect(result).toEqual({ data: mockProfile, error: null });

      availabilitySpy.mockRestore();
      updateSpy.mockRestore();
    });

    it('should reject username update when already taken by another user', async () => {
      const availabilitySpy = vi
        .spyOn(UserProfileService, 'isUsernameAvailable')
        .mockResolvedValue({ data: false, error: null });
      const updateSpy = vi.spyOn(UserProfileService, 'updateProfile');

      const result = await UserProfileService.updateUsername('user-123', 'newusername');

      expect(availabilitySpy).toHaveBeenCalledWith('newusername', 'user-123');
      expect(updateSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        data: null,
        error: { message: 'Username is already taken' }
      });

      availabilitySpy.mockRestore();
      updateSpy.mockRestore();
    });

    it('should allow user to keep their current username during update', async () => {
      const currentProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        username: 'currentusername'
      };

      const availabilitySpy = vi
        .spyOn(UserProfileService, 'isUsernameAvailable')
        .mockResolvedValue({ data: true, error: null });
      const updateSpy = vi
        .spyOn(UserProfileService, 'updateProfile')
        .mockResolvedValue({ data: currentProfile, error: null });

      const result = await UserProfileService.updateUsername('user-123', 'currentusername');

      expect(result).toEqual({ data: currentProfile, error: null });

      availabilitySpy.mockRestore();
      updateSpy.mockRestore();
    });

    it('should return error for empty username', async () => {
      const availabilitySpy = vi.spyOn(UserProfileService, 'isUsernameAvailable');
      const updateSpy = vi.spyOn(UserProfileService, 'updateProfile');

      const result = await UserProfileService.updateUsername('user-123', '');

      expect(availabilitySpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        data: null,
        error: { message: 'Username is required' }
      });

      availabilitySpy.mockRestore();
      updateSpy.mockRestore();
    });

    it('should return error for invalid username format', async () => {
      const availabilitySpy = vi.spyOn(UserProfileService, 'isUsernameAvailable');
      const updateSpy = vi.spyOn(UserProfileService, 'updateProfile');

      const result = await UserProfileService.updateUsername('user-123', 'invalid!');

      expect(availabilitySpy).not.toHaveBeenCalled();
      expect(updateSpy).not.toHaveBeenCalled();
      expect(result).toEqual({
        data: null,
        error: { message: 'Invalid username format' }
      });

      availabilitySpy.mockRestore();
      updateSpy.mockRestore();
    });
  });

  describe('isUsernameAvailable', () => {
    it('should return true for available username', async () => {
      vi.mocked(handleRequest).mockResolvedValue({ data: null, error: null });

      const result = await UserProfileService.isUsernameAvailable('newusername');

      expect(result).toEqual({ data: true, error: null });
    });

    it('should return false for taken username', async () => {
      const existingProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        username: 'takenusername'
      };

      vi.mocked(handleRequest).mockResolvedValue({ data: existingProfile, error: null });

      const result = await UserProfileService.isUsernameAvailable('takenusername');

      expect(result).toEqual({ data: false, error: null });
    });

    it('should return true for user updating their own username', async () => {
      const ownProfile = {
        id: 'profile-123',
        user_id: 'user-123',
        username: 'myusername'
      };

      vi.mocked(handleRequest).mockResolvedValue({ data: ownProfile, error: null });

      const result = await UserProfileService.isUsernameAvailable('myusername', 'user-123');

      expect(result).toEqual({ data: true, error: null });
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(handleRequest).mockRejectedValue(new Error('Database error'));

      const result = await UserProfileService.isUsernameAvailable('testusername');

      expect(result).toEqual({
        data: false,
        error: { message: 'Failed to check username availability' }
      });
    });
  });

  describe('generateDefaultUsername', () => {
    it('should extract username from email', () => {
      const username = UserProfileService.generateDefaultUsername('test.user@example.com');
      expect(username).toBe('test_user');
    });

    it('should handle special characters in email', () => {
      const username = UserProfileService.generateDefaultUsername('user+tag@domain.com');
      expect(username).toBe('user_tag');
    });

    it('should handle multiple special characters', () => {
      const username = UserProfileService.generateDefaultUsername('user.name-123@example.com');
      expect(username).toBe('user_name-123');
    });
  });

  describe('generateUniqueUsername', () => {
    it('should return base username when available', async () => {
      vi.mocked(handleRequest).mockResolvedValue({ data: null, error: null });

      const result = await UserProfileService.generateUniqueUsername('test@example.com');

      expect(result).toEqual({ data: 'test', error: null });
    });

    it('should add suffix when base username is taken', async () => {
      // First call: username taken
      vi.mocked(handleRequest).mockResolvedValueOnce({ 
        data: { user_id: 'other-user', username: 'test' }, 
        error: null 
      });
      // Second call: username available
      vi.mocked(handleRequest).mockResolvedValueOnce({ data: null, error: null });

      const result = await UserProfileService.generateUniqueUsername('test@example.com');

      expect(result).toEqual({ data: 'test_1', error: null });
    });

    it('should handle multiple suffixes', async () => {
      // Multiple usernames taken
      vi.mocked(handleRequest).mockResolvedValueOnce({ 
        data: { user_id: 'other-user', username: 'test' }, 
        error: null 
      });
      vi.mocked(handleRequest).mockResolvedValueOnce({ 
        data: { user_id: 'other-user', username: 'test_1' }, 
        error: null 
      });
      vi.mocked(handleRequest).mockResolvedValueOnce({ 
        data: { user_id: 'other-user', username: 'test_2' }, 
        error: null 
      });
      // Fourth call: username available
      vi.mocked(handleRequest).mockResolvedValueOnce({ data: null, error: null });

      const result = await UserProfileService.generateUniqueUsername('test@example.com');

      expect(result).toEqual({ data: 'test_3', error: null });
    });

    it('should return error after max attempts', async () => {
      // Mock all attempts as taken
      for (let i = 0; i <= 100; i++) {
        const username = i === 0 ? 'test' : `test_${i}`;
        vi.mocked(handleRequest).mockResolvedValueOnce({ 
          data: { user_id: 'other-user', username }, 
          error: null 
        });
      }

      const result = await UserProfileService.generateUniqueUsername('test@example.com');

      expect(result).toEqual({
        data: '',
        error: { message: 'Unable to generate unique username' }
      });
    });

    it('should handle errors during generation', async () => {
      vi.mocked(handleRequest).mockRejectedValue(new Error('Database error'));

      const result = await UserProfileService.generateUniqueUsername('test@example.com');

      expect(result).toEqual({
        data: '',
        error: { message: 'Unable to generate unique username' }
      });
    });
  });

  describe('deleteProfile', () => {
    it('should delete user profile', async () => {
      const mockResponse = { data: null, error: null };
      vi.mocked(handleRequest).mockResolvedValue(mockResponse);

      const result = await UserProfileService.deleteProfile('user-123');

      expect(handleRequest).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });
});
