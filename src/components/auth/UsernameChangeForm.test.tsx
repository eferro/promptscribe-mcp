import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import UsernameChangeForm from './UsernameChangeForm';

// Mock the toast hook
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));

// Mock UserProfileService
vi.mock('@/services/userProfileService', () => ({
  UserProfileService: {
    isUsernameAvailable: vi.fn(),
    updateUsername: vi.fn(),
  },
}));

// Mock the services
const mockUserProfileService = {
  isUsernameAvailable: vi.fn(),
  updateUsername: vi.fn(),
};

// Mock dynamic import
vi.mock('@/services/userProfileService', async () => {
  const actual = await vi.importActual('@/services/userProfileService');
  return {
    ...actual,
    UserProfileService: mockUserProfileService,
  };
});

describe('UsernameChangeForm', () => {
  const mockOnUsernameChanged = vi.fn();
  const mockOnCancel = vi.fn();
  const mockUser = { id: 'user-123', username: 'testuser' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserProfileService.isUsernameAvailable.mockResolvedValue({ data: true, error: null });
    mockUserProfileService.updateUsername.mockResolvedValue({ data: { username: 'newuser' }, error: null });
  });

  it('renders with current username', () => {
    render(
      <UsernameChangeForm
        user={mockUser}
        onUsernameChanged={mockOnUsernameChanged}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Change Username')).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockUser.username)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter new username')).toBeInTheDocument();
  });

  it('shows username availability status', async () => {
    mockUserProfileService.isUsernameAvailable.mockResolvedValue({ data: false, error: null });

    render(
      <UsernameChangeForm
        user={mockUser}
        onUsernameChanged={mockOnUsernameChanged}
        onCancel={mockOnCancel}
      />
    );

    const newUsernameInput = screen.getByPlaceholderText('Enter new username');
    fireEvent.change(newUsernameInput, { target: { value: 'takenuser' } });

    await waitFor(() => {
      expect(screen.getByText('✗ Username already taken')).toBeInTheDocument();
    });
  });

  it('validates username length', async () => {
    render(
      <UsernameChangeForm
        user={mockUser}
        onUsernameChanged={mockOnUsernameChanged}
        onCancel={mockOnCancel}
      />
    );

    const newUsernameInput = screen.getByPlaceholderText('Enter new username');
    fireEvent.change(newUsernameInput, { target: { value: 'ab' } });

    await waitFor(() => {
      expect(screen.getByText('Username must be at least 3 characters')).toBeInTheDocument();
    });
  });

  it('validates username format', async () => {
    render(
      <UsernameChangeForm
        user={mockUser}
        onUsernameChanged={mockOnUsernameChanged}
        onCancel={mockOnCancel}
      />
    );

    const newUsernameInput = screen.getByPlaceholderText('Enter new username');
    fireEvent.change(newUsernameInput, { target: { value: 'user@name' } });

    await waitFor(() => {
      expect(screen.getByText('✗ Invalid characters')).toBeInTheDocument();
    });
  });

  it('prevents submission with same username', async () => {
    render(
      <UsernameChangeForm
        user={mockUser}
        onUsernameChanged={mockOnUsernameChanged}
        onCancel={mockOnCancel}
      />
    );

    const newUsernameInput = screen.getByPlaceholderText('Enter new username');
    fireEvent.change(newUsernameInput, { target: { value: mockUser.username } });

    const submitButton = screen.getByText('Update Username');
    fireEvent.click(submitButton);

    expect(mockToast).toHaveBeenCalledWith({
      title: 'No changes',
      description: 'New username is the same as current username'
    });
  });

  it('prevents submission with unavailable username', async () => {
    mockUserProfileService.isUsernameAvailable.mockResolvedValue({ data: false, error: null });

    render(
      <UsernameChangeForm
        user={mockUser}
        onUsernameChanged={mockOnUsernameChanged}
        onCancel={mockOnCancel}
      />
    );

    const newUsernameInput = screen.getByPlaceholderText('Enter new username');
    fireEvent.change(newUsernameInput, { target: { value: 'takenuser' } });

    await waitFor(() => {
      expect(screen.getByText('✗ Username already taken')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Update Username');
    expect(submitButton).toBeDisabled();
  });

  it('prevents submission with invalid username format', async () => {
    render(
      <UsernameChangeForm
        user={mockUser}
        onUsernameChanged={mockOnUsernameChanged}
        onCancel={mockOnCancel}
      />
    );

    const newUsernameInput = screen.getByPlaceholderText('Enter new username');
    fireEvent.change(newUsernameInput, { target: { value: 'user@name' } });

    await waitFor(() => {
      expect(screen.getByText('✗ Invalid characters')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Update Username');
    expect(submitButton).toBeDisabled();
  });

  it('handles successful username update', async () => {
    const newUsername = 'newuser';
    mockUserProfileService.updateUsername.mockResolvedValue({ 
      data: { username: newUsername }, 
      error: null 
    });

    render(
      <UsernameChangeForm
        user={mockUser}
        onUsernameChanged={mockOnUsernameChanged}
        onCancel={mockOnCancel}
      />
    );

    const newUsernameInput = screen.getByPlaceholderText('Enter new username');
    fireEvent.change(newUsernameInput, { target: { value: newUsername } });

    // Wait for availability check
    await waitFor(() => {
      expect(screen.getByText('✓ Username available')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Update Username');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUserProfileService.updateUsername).toHaveBeenCalledWith(mockUser.id, newUsername);
      expect(mockToast).toHaveBeenCalledWith({
        title: 'Username updated',
        description: 'Your username has been successfully changed'
      });
      expect(mockOnUsernameChanged).toHaveBeenCalledWith(newUsername);
    });
  });

  it('handles username update errors', async () => {
    const errorMessage = 'Username update failed';
    mockUserProfileService.updateUsername.mockResolvedValue({ 
      data: null, 
      error: { message: errorMessage } 
    });

    render(
      <UsernameChangeForm
        user={mockUser}
        onUsernameChanged={mockOnUsernameChanged}
        onCancel={mockOnCancel}
      />
    );

    const newUsernameInput = screen.getByPlaceholderText('Enter new username');
    fireEvent.change(newUsernameInput, { target: { value: 'newuser' } });

    // Wait for availability check
    await waitFor(() => {
      expect(screen.getByText('✓ Username available')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Update Username');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Username change failed',
        description: errorMessage
      });
    });
  });

  it('handles unexpected errors', async () => {
    mockUserProfileService.updateUsername.mockRejectedValue(new Error('Network error'));

    render(
      <UsernameChangeForm
        user={mockUser}
        onUsernameChanged={mockOnUsernameChanged}
        onCancel={mockOnCancel}
      />
    );

    const newUsernameInput = screen.getByPlaceholderText('Enter new username');
    fireEvent.change(newUsernameInput, { target: { value: 'newuser' } });

    // Wait for availability check
    await waitFor(() => {
      expect(screen.getByText('✓ Username available')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Update Username');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: 'destructive',
        title: 'Error',
        description: 'An unexpected error occurred while changing username'
      });
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <UsernameChangeForm
        user={mockUser}
        onUsernameChanged={mockOnUsernameChanged}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('shows loading state during submission', async () => {
    // Mock a slow response
    mockUserProfileService.updateUsername.mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ data: { username: 'newuser' }, error: null }), 100))
    );

    render(
      <UsernameChangeForm
        user={mockUser}
        onUsernameChanged={mockOnUsernameChanged}
        onCancel={mockOnCancel}
      />
    );

    const newUsernameInput = screen.getByPlaceholderText('Enter new username');
    fireEvent.change(newUsernameInput, { target: { value: 'newuser' } });

    // Wait for availability check
    await waitFor(() => {
      expect(screen.getByText('✓ Username available')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Update Username');
    fireEvent.click(submitButton);

    expect(screen.getByText('Updating...')).toBeInTheDocument();
  });

  it('debounces username availability checks', async () => {
    const user = userEvent.setup();
    
    render(
      <UsernameChangeForm
        user={mockUser}
        onUsernameChanged={mockOnUsernameChanged}
        onCancel={mockOnCancel}
      />
    );

    const newUsernameInput = screen.getByPlaceholderText('Enter new username');
    
    // Type quickly
    await user.type(newUsernameInput, 'newuser');
    
    // Should not call the service immediately
    expect(mockUserProfileService.isUsernameAvailable).not.toHaveBeenCalled();
    
    // Wait for debounce
    await waitFor(() => {
      expect(mockUserProfileService.isUsernameAvailable).toHaveBeenCalledWith('newuser', mockUser.id);
    }, { timeout: 1000 });
  });
});
