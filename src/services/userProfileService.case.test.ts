import { describe, it, expect, vi } from 'vitest';
import { UserProfileService } from './userProfileService';

describe('UserProfileService case-insensitive username availability', () => {
  it('treats usernames case-insensitively', async () => {
    const existingProfile = {
      id: 'profile-123',
      user_id: 'user-123',
      username: 'testuser'
    };

    const getProfileSpy = vi
      .spyOn(UserProfileService, 'getProfileByUsername')
      .mockResolvedValue({ data: existingProfile, error: null });

    const result = await UserProfileService.isUsernameAvailable('TestUser');

    expect(getProfileSpy).toHaveBeenCalledWith('testuser');
    expect(result).toEqual({ data: false, error: null });

    getProfileSpy.mockRestore();
  });
});
