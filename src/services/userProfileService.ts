import { supabase } from '@/integrations/supabase/client';
import { handleRequest } from '@/api/supabaseApi';
import type { Database } from '@/integrations/supabase/types';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserProfileInsert = Database['public']['Tables']['user_profiles']['Insert'];
type UserProfileUpdate = Database['public']['Tables']['user_profiles']['Update'];

export class UserProfileService {
  /**
   * Create a new user profile
   */
  static async createProfile(profile: UserProfileInsert): Promise<{ data: UserProfile | null; error: { message: string } | null }> {
    const normalizedProfile = {
      ...profile,
      username: profile.username?.toLowerCase(),
    };

    return handleRequest(
      supabase
        .from('user_profiles')
        .insert(normalizedProfile)
        .select()
        .single(),
      'Failed to create user profile'
    );
  }

  /**
   * Get user profile by user ID
   */
  static async getProfileByUserId(userId: string): Promise<{ data: UserProfile | null; error: { message: string } | null }> {
    return handleRequest(
      supabase
        .from('user_profiles')
        .select('*')
        .eq('user_id', userId)
        .single(),
      'Failed to get user profile'
    );
  }

  /**
   * Get user profile by username
   */
  static async getProfileByUsername(username: string): Promise<{ data: UserProfile | null; error: { message: string } | null }> {
    return handleRequest(
      supabase
        .from('user_profiles')
        .select('*')
        .eq('username', username)
        .single(),
      'Failed to get user profile by username'
    );
  }

  /**
   * Update user profile
   */
  static async updateProfile(userId: string, updates: UserProfileUpdate): Promise<{ data: UserProfile | null; error: { message: string } | null }> {
    return handleRequest(
      supabase
        .from('user_profiles')
        .update(updates)
        .eq('user_id', userId)
        .select()
        .single(),
      'Failed to update user profile'
    );
  }

  /**
   * Update username for a user
   */
  static async updateUsername(userId: string, newUsername: string): Promise<{ data: UserProfile | null; error: { message: string } | null }> {
    const username = newUsername.trim().toLowerCase();

    if (!username) {
      return {
        data: null,
        error: { message: 'Username is required' }
      };
    }

    if (username.length < 3 || username.length > 20) {
      return {
        data: null,
        error: { message: 'Username must be between 3 and 20 characters' }
      };
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return {
        data: null,
        error: { message: 'Invalid username format' }
      };
    }

    const { data: available, error } = await this.isUsernameAvailable(username, userId);
    if (error) {
      return { data: null, error };
    }

    if (!available) {
      return {
        data: null,
        error: { message: 'Username is already taken' }
      };
    }

    return this.updateProfile(userId, { username });
  }

  /**
   * Check if username is available
   */
  static async isUsernameAvailable(username: string, excludeUserId?: string): Promise<{ data: boolean; error: { message: string } | null }> {
    try {
      const normalized = username.toLowerCase();
      const { data: existingProfile } = await this.getProfileByUsername(normalized);
      
      if (!existingProfile) {
        return { data: true, error: null };
      }

      // If we're checking for a specific user (e.g., during update), allow them to keep their current username
      if (excludeUserId && existingProfile.user_id === excludeUserId) {
        return { data: true, error: null };
      }

      return { data: false, error: null };
    } catch {
      return {
        data: false,
        error: { message: 'Failed to check username availability' }
      };
    }
  }

  /**
   * Generate a default username from email
   */
  static generateDefaultUsername(email: string): string {
    const baseUsername = email.split('@')[0];
    return baseUsername.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  }

  /**
   * Generate a unique username from email with fallback
   */
  static async generateUniqueUsername(email: string): Promise<{ data: string; error: { message: string } | null }> {
    try {
      const baseUsername = this.generateDefaultUsername(email);
      let username = baseUsername;
      let counter = 1;

      // Try the base username first
      const { data: isAvailable } = await this.isUsernameAvailable(username);
      if (isAvailable) {
        return { data: username, error: null };
      }

      // If not available, try with numbers
      while (counter <= 100) { // Prevent infinite loop
        username = `${baseUsername}_${counter}`;
        const { data: isAvailable } = await this.isUsernameAvailable(username);
        if (isAvailable) {
          return { data: username, error: null };
        }
        counter++;
      }

      return {
        data: '',
        error: { message: 'Unable to generate unique username' }
      };
    } catch {
      return {
        data: '',
        error: { message: 'Failed to generate unique username' }
      };
    }
  }

  /**
   * Delete user profile
   */
  static async deleteProfile(userId: string): Promise<{ data: null; error: { message: string } | null }> {
    return handleRequest(
      supabase
        .from('user_profiles')
        .delete()
        .eq('user_id', userId),
      'Failed to delete user profile'
    );
  }
}
