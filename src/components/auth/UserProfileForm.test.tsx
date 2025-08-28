import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// userEvent not used in final tests
import { vi } from 'vitest';
import UserProfileForm from './UserProfileForm';
import { UserProfile } from '@/integrations/supabase/types';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock UserProfileService
const mockUserProfileService = {
  isUsernameAvailable: vi.fn(),
  updateProfile: vi.fn(),
};

// Mock dynamic import
vi.mock('@/services/userProfileService', async () => {
  const actual = await vi.importActual('@/services/userProfileService');
  return {
    ...actual,
    UserProfileService: mockUserProfileService,
  };
});

describe('UserProfileForm', () => {
  const mockProfile: UserProfile = {
    id: 'profile-1',
    user_id: 'user-1',
    username: 'testuser',
    display_name: 'Test User',
    bio: 'Test bio',
    avatar_url: 'https://example.com/avatar.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  const mockOnProfileUpdated = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserProfileService.isUsernameAvailable.mockResolvedValue({ data: true, error: null });
    mockUserProfileService.updateProfile.mockResolvedValue({ data: mockProfile, error: null });
  });

  it('renders with profile data', () => {
    render(
      <UserProfileForm
        profile={mockProfile}
        onProfileUpdated={mockOnProfileUpdated}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
    expect(screen.getByDisplayValue('https://example.com/avatar.jpg')).toBeInTheDocument();
  });

  it('shows username availability status', async () => {
    mockUserProfileService.isUsernameAvailable.mockResolvedValue({ data: false, error: null });

    render(
      <UserProfileForm
        profile={mockProfile}
        onProfileUpdated={mockOnProfileUpdated}
        onCancel={mockOnCancel}
      />
    );

    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'takenuser' } });

    await waitFor(() => {
      expect(screen.getByText('✗ Username already taken')).toBeInTheDocument();
    });
  });

  it('validates username length', async () => {
    render(
      <UserProfileForm
        profile={mockProfile}
        onProfileUpdated={mockOnProfileUpdated}
        onCancel={mockOnCancel}
      />
    );

    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'ab' } });

    await waitFor(() => {
      expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
    });
  });

  it('validates username format', async () => {
    render(
      <UserProfileForm
        profile={mockProfile}
        onProfileUpdated={mockOnProfileUpdated}
        onCancel={mockOnCancel}
      />
    );

    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'user@name' } });

    await waitFor(() => {
      expect(screen.getByText('✗ Invalid characters')).toBeInTheDocument();
    });
  });

  it('shows character count for bio', () => {
    render(
      <UserProfileForm
        profile={mockProfile}
        onProfileUpdated={mockOnProfileUpdated}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/8\/500 characters/)).toBeInTheDocument();
  });

  it('updates character count when bio changes', async () => {
    render(
      <UserProfileForm
        profile={mockProfile}
        onProfileUpdated={mockOnProfileUpdated}
        onCancel={mockOnCancel}
      />
    );

    const bioTextarea = screen.getByDisplayValue('Test bio');
    fireEvent.change(bioTextarea, { target: { value: 'New longer bio text' } });

    expect(screen.getByText(/19\/500 characters/)).toBeInTheDocument();
  });

  it('detects changes in form data', async () => {
    render(
      <UserProfileForm
        profile={mockProfile}
        onProfileUpdated={mockOnProfileUpdated}
        onCancel={mockOnCancel}
      />
    );

    // Initially no changes
    expect(screen.getByText('Update Profile')).toBeDisabled();

    // Make a change
    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });

    // Wait for availability check
    await waitFor(() => {
      expect(screen.getByText('✓ Username available')).toBeInTheDocument();
    });

    // Now should be enabled
    expect(screen.getByText('Update Profile')).toBeEnabled();
  });

  it('handles successful profile update', async () => {
    const updatedProfile = { ...mockProfile, username: 'newuser' };
    mockUserProfileService.updateProfile.mockResolvedValue({ 
      data: updatedProfile, 
      error: null 
    });

    render(
      <UserProfileForm
        profile={mockProfile}
        onProfileUpdated={mockOnProfileUpdated}
        onCancel={mockOnCancel}
      />
    );

    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });

    // Wait for availability check
    await waitFor(() => {
      expect(screen.getByText('✓ Username available')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Update Profile');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUserProfileService.updateProfile).toHaveBeenCalledWith('user-1', {
        username: 'newuser'
      });
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Profile updated',
        description: 'Your profile has been successfully updated'
      });
      expect(mockOnProfileUpdated).toHaveBeenCalledWith(updatedProfile);
    });
  });

  it('handles profile update errors', async () => {
    const errorMessage = 'Profile update failed';
    mockUserProfileService.updateProfile.mockResolvedValue({ 
      data: null, 
      error: { message: errorMessage } 
    });

    render(
      <UserProfileForm
        profile={mockProfile}
        onProfileUpdated={mockOnProfileUpdated}
        onCancel={mockOnCancel}
      />
    );

    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });

    // Wait for availability check
    await waitFor(() => {
      expect(screen.getByText('✓ Username available')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Update Profile');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Profile update failed',
        description: errorMessage
      });
    });
  });

  it('handles unexpected errors', async () => {
    mockUserProfileService.updateProfile.mockRejectedValue(new Error('Network error'));

    render(
      <UserProfileForm
        profile={mockProfile}
        onProfileUpdated={mockOnProfileUpdated}
        onCancel={mockOnCancel}
      />
    );

    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });

    // Wait for availability check
    await waitFor(() => {
      expect(screen.getByText('✓ Username available')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Update Profile');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred while updating profile'
      });
    });
  });

  it('resets form data when reset button is clicked', async () => {
    render(
      <UserProfileForm
        profile={mockProfile}
        onProfileUpdated={mockOnProfileUpdated}
        onCancel={mockOnCancel}
      />
    );

    // Make changes
    const usernameInput = screen.getByDisplayValue('testuser');
    const bioTextarea = screen.getByDisplayValue('Test bio');
    
    fireEvent.change(usernameInput, { target: { value: 'changeduser' } });
    fireEvent.change(bioTextarea, { target: { value: 'Changed bio' } });

    // Verify changes
    expect(screen.getByDisplayValue('changeduser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Changed bio')).toBeInTheDocument();

    // Click reset
    const resetButton = screen.getByText('Reset');
    fireEvent.click(resetButton);

    // Verify reset
    expect(screen.getByDisplayValue('testuser')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test bio')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <UserProfileForm
        profile={mockProfile}
        onProfileUpdated={mockOnProfileUpdated}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state during submission', async () => {
    // Mock a slow response
    mockUserProfileService.updateProfile.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: mockProfile, error: null }), 100))
    );

    render(
      <UserProfileForm
        profile={mockProfile}
        onProfileUpdated={mockOnProfileUpdated}
        onCancel={mockOnCancel}
      />
    );

    const usernameInput = screen.getByDisplayValue('testuser');
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });

    // Wait for availability check
    await waitFor(() => {
      expect(screen.getByText('✓ Username available')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Update Profile');
    fireEvent.click(submitButton);

    expect(screen.getByText('Updating...')).toBeInTheDocument();
  });

  it('debounces username availability checks', async () => {
    render(
      <UserProfileForm
        profile={mockProfile}
        onProfileUpdated={mockOnProfileUpdated}
        onCancel={mockOnCancel}
      />
    );

    const usernameInput = screen.getByDisplayValue('testuser');
    
    // Change to a new value
    fireEvent.change(usernameInput, { target: { value: 'newuser' } });
    
    // Should not call the service immediately
    expect(mockUserProfileService.isUsernameAvailable).not.toHaveBeenCalled();
    
    // Wait for debounce
    await waitFor(() => {
      expect(mockUserProfileService.isUsernameAvailable).toHaveBeenCalledWith('newuser');
    }, { timeout: 1000 });
  });

  it('only updates changed fields', async () => {
    render(
      <UserProfileForm
        profile={mockProfile}
        onProfileUpdated={mockOnProfileUpdated}
        onCancel={mockOnCancel}
      />
    );

    // Only change bio
    const bioTextarea = screen.getByDisplayValue('Test bio');
    fireEvent.change(bioTextarea, { target: { value: 'New bio' } });

    const submitButton = screen.getByText('Update Profile');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUserProfileService.updateProfile).toHaveBeenCalledWith('user-1', {
        bio: 'New bio'
      });
    });
  });

  it('handles empty optional fields correctly', async () => {
    const profileWithEmptyFields: UserProfile = {
      ...mockProfile,
      display_name: null,
      bio: null,
      avatar_url: null
    };

    render(
      <UserProfileForm
        profile={profileWithEmptyFields}
        onProfileUpdated={mockOnProfileUpdated}
        onCancel={mockOnCancel}
      />
    );

    // Add values to empty fields
    const displayNameInput = screen.getByPlaceholderText('Enter display name');
    const bioTextarea = screen.getByPlaceholderText('Tell us about yourself...');
    
    fireEvent.change(displayNameInput, { target: { value: 'New Name' } });
    fireEvent.change(bioTextarea, { target: { value: 'New bio' } });

    const submitButton = screen.getByText('Update Profile');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUserProfileService.updateProfile).toHaveBeenCalledWith('user-1', {
        display_name: 'New Name',
        bio: 'New bio'
      });
    });
  });
});
