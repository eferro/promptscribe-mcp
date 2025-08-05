import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PasswordChangeForm from './PasswordChangeForm';
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      updateUser: vi.fn(),
    }
  }
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

const mockOnPasswordChanged = vi.fn();
const mockOnCancel = vi.fn();

describe('PasswordChangeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders password change form correctly', () => {
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Change Your Password')).toBeInTheDocument();
    expect(screen.getByText('Enter your new password below')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByText('Change Password')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('handles form input changes', () => {
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    const newPasswordInput = screen.getByLabelText('New Password');
    const confirmPasswordInput = screen.getByLabelText('Confirm Password');
    
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    
    expect(newPasswordInput).toHaveValue('newpassword123');
    expect(confirmPasswordInput).toHaveValue('newpassword123');
  });

  it('shows error when passwords do not match', async () => {
    const mockToast = vi.fn();
    vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({ toast: mockToast });
    
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.change(screen.getByLabelText('New Password'), { 
      target: { value: 'password123' } 
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { 
      target: { value: 'differentpassword' } 
    });
    
    fireEvent.click(screen.getByText('Change Password'));
    
    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Password mismatch",
      description: "The passwords you entered don't match."
    });
  });

  it('shows error when password is too short', async () => {
    const mockToast = vi.fn();
    vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({ toast: mockToast });
    
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.change(screen.getByLabelText('New Password'), { 
      target: { value: '123' } 
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { 
      target: { value: '123' } 
    });
    
    fireEvent.click(screen.getByText('Change Password'));
    
    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Password too short",
      description: "Password must be at least 6 characters long."
    });
  });

  it('successfully changes password', async () => {
    const mockToast = vi.fn();
    const mockUpdateUser = vi.mocked(supabase.auth.updateUser);
    mockUpdateUser.mockResolvedValue({ data: { user: {} }, error: null });
    vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({ toast: mockToast });
    
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.change(screen.getByLabelText('New Password'), { 
      target: { value: 'newpassword123' } 
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { 
      target: { value: 'newpassword123' } 
    });
    
    fireEvent.click(screen.getByText('Change Password'));
    
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'newpassword123'
      });
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: "Password updated",
      description: "Your password has been successfully changed."
    });
    
    expect(mockOnPasswordChanged).toHaveBeenCalled();
  });

  it('handles password update error', async () => {
    const mockToast = vi.fn();
    const mockUpdateUser = vi.mocked(supabase.auth.updateUser);
    mockUpdateUser.mockResolvedValue({ 
      data: { user: null }, 
      error: { message: 'Password update failed' } 
    });
    vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({ toast: mockToast });
    
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.change(screen.getByLabelText('New Password'), { 
      target: { value: 'newpassword123' } 
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { 
      target: { value: 'newpassword123' } 
    });
    
    fireEvent.click(screen.getByText('Change Password'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Password update failed",
        description: "Password update failed"
      });
    });
    
    expect(mockOnPasswordChanged).not.toHaveBeenCalled();
  });

  it('handles unexpected errors', async () => {
    const mockToast = vi.fn();
    const mockUpdateUser = vi.mocked(supabase.auth.updateUser);
    mockUpdateUser.mockRejectedValue(new Error('Network error'));
    vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({ toast: mockToast });
    
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.change(screen.getByLabelText('New Password'), { 
      target: { value: 'newpassword123' } 
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { 
      target: { value: 'newpassword123' } 
    });
    
    fireEvent.click(screen.getByText('Change Password'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred"
      });
    });
  });

  it('disables form during loading', async () => {
    const mockUpdateUser = vi.mocked(supabase.auth.updateUser);
    mockUpdateUser.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.change(screen.getByLabelText('New Password'), { 
      target: { value: 'newpassword123' } 
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { 
      target: { value: 'newpassword123' } 
    });
    
    fireEvent.click(screen.getByText('Change Password'));
    
    expect(screen.getByText('Changing Password...')).toBeInTheDocument();
    expect(screen.getByText('Changing Password...')).toBeDisabled();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('prevents form submission with empty passwords', () => {
    const mockToast = vi.fn();
    vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({ toast: mockToast });
    
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.click(screen.getByText('Change Password'));
    
    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Password mismatch",
      description: "The passwords you entered don't match."
    });
  });

  it('validates minimum password length boundary', () => {
    const mockToast = vi.fn();
    vi.mocked(require('@/hooks/use-toast').useToast).mockReturnValue({ toast: mockToast });
    
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    // Test exactly 6 characters (minimum valid length)
    fireEvent.change(screen.getByLabelText('New Password'), { 
      target: { value: '123456' } 
    });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { 
      target: { value: '123456' } 
    });
    
    fireEvent.click(screen.getByText('Change Password'));
    
    // Should not show password too short error
    expect(mockToast).not.toHaveBeenCalledWith({
      variant: "destructive",
      title: "Password too short",
      description: "Password must be at least 6 characters long."
    });
  });
});