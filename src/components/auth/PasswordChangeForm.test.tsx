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
const mockToast = vi.fn();
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: mockToast
  })
}));

const mockOnPasswordChanged = vi.fn();
const mockOnCancel = vi.fn();

describe('PasswordChangeForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockToast.mockClear();
  });

  it('renders password change form correctly', () => {
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    expect(screen.getByText('Change Your Password')).toBeInTheDocument();
    expect(screen.getByText('Please enter your new password to complete the reset process.')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByText('Update Password')).toBeInTheDocument();
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
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password');
    
    fireEvent.change(newPasswordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'newpassword123' } });
    
    expect(newPasswordInput).toHaveValue('newpassword123');
    expect(confirmPasswordInput).toHaveValue('newpassword123');
  });

  it('shows error when passwords do not match', async () => {
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.change(screen.getByLabelText('New Password'), { 
      target: { value: 'password123' } 
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { 
      target: { value: 'differentpassword' } 
    });
    
    fireEvent.click(screen.getByText('Update Password'));
    
    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Password mismatch",
      description: "The passwords you entered don't match."
    });
  });

  it('shows error when password is too short', async () => {
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.change(screen.getByLabelText('New Password'), { 
      target: { value: '123' } 
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { 
      target: { value: '123' } 
    });
    
    fireEvent.click(screen.getByText('Update Password'));
    
    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Password too short",
      description: "Password must be at least 6 characters long."
    });
  });

  it('successfully changes password', async () => {
    const mockUpdateUser = vi.mocked(supabase.auth.updateUser);
    mockUpdateUser.mockResolvedValue({ data: { user: {} }, error: null });
    
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.change(screen.getByLabelText('New Password'), { 
      target: { value: 'newpassword123' } 
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { 
      target: { value: 'newpassword123' } 
    });
    
    fireEvent.click(screen.getByText('Update Password'));
    
    await waitFor(() => {
      expect(mockUpdateUser).toHaveBeenCalledWith({
        password: 'newpassword123'
      });
    });
    
    expect(mockToast).toHaveBeenCalledWith({
      title: "Password updated",
      description: "Your password has been successfully updated."
    });
    
    expect(mockOnPasswordChanged).toHaveBeenCalled();
  });

  it('handles password update error', async () => {
    const mockUpdateUser = vi.mocked(supabase.auth.updateUser);
    mockUpdateUser.mockResolvedValue({ 
      data: { user: null }, 
      error: { message: 'Password update failed' } 
    });
    
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.change(screen.getByLabelText('New Password'), { 
      target: { value: 'newpassword123' } 
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { 
      target: { value: 'newpassword123' } 
    });
    
    fireEvent.click(screen.getByText('Update Password'));
    
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
    const mockUpdateUser = vi.mocked(supabase.auth.updateUser);
    mockUpdateUser.mockRejectedValue(new Error('Network error'));
    
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    fireEvent.change(screen.getByLabelText('New Password'), { 
      target: { value: 'newpassword123' } 
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { 
      target: { value: 'newpassword123' } 
    });
    
    fireEvent.click(screen.getByText('Update Password'));
    
    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred while updating your password."
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
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { 
      target: { value: 'newpassword123' } 
    });
    
    fireEvent.click(screen.getByText('Update Password'));
    
    expect(screen.getByText('Updating Password...')).toBeInTheDocument();
    expect(screen.getByText('Updating Password...')).toBeDisabled();
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
    render(
      <PasswordChangeForm 
        onPasswordChanged={mockOnPasswordChanged}
        onCancel={mockOnCancel}
      />
    );
    
    const form = screen.getByText('Update Password').closest('form')!;
    fireEvent.submit(form);
    
    expect(mockToast).toHaveBeenCalledWith({
      variant: "destructive",
      title: "Password too short",
      description: "Password must be at least 6 characters long."
    });
  });

  it('validates minimum password length boundary', () => {
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
    fireEvent.change(screen.getByLabelText('Confirm New Password'), { 
      target: { value: '123456' } 
    });
    
    fireEvent.click(screen.getByText('Update Password'));
    
    // Should not show password too short error
    expect(mockToast).not.toHaveBeenCalledWith({
      variant: "destructive",
      title: "Password too short",
      description: "Password must be at least 6 characters long."
    });
  });
});