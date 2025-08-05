import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuthForm from './AuthForm';
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      resetPasswordForEmail: vi.fn(),
    }
  }
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

const mockOnAuthSuccess = vi.fn();

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders sign in form by default', () => {
    render(<AuthForm onAuthSuccess={mockOnAuthSuccess} />);
    
    expect(screen.getByText('MCP Prompt Manager')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('switches to sign up tab', () => {
    render(<AuthForm onAuthSuccess={mockOnAuthSuccess} />);
    
    fireEvent.click(screen.getByText('Sign Up'));
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('handles sign in form submission', async () => {
    const mockSignIn = vi.mocked(supabase.auth.signInWithPassword);
    mockSignIn.mockResolvedValue({ data: { user: null, session: null }, error: null });

    render(<AuthForm onAuthSuccess={mockOnAuthSuccess} />);
    
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByText('Sign In'));
    
    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });
  });

  it('handles sign up form submission', async () => {
    const mockSignUp = vi.mocked(supabase.auth.signUp);
    mockSignUp.mockResolvedValue({ data: { user: null, session: null }, error: null });

    render(<AuthForm onAuthSuccess={mockOnAuthSuccess} />);
    
    fireEvent.click(screen.getByText('Sign Up'));
    
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByText('Create Account'));
    
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          emailRedirectTo: expect.stringContaining('/')
        }
      });
    });
  });

  it('shows password reset form', () => {
    render(<AuthForm onAuthSuccess={mockOnAuthSuccess} />);
    
    fireEvent.click(screen.getByText('Forgot your password?'));
    expect(screen.getByText('Send Reset Email')).toBeInTheDocument();
    expect(screen.getByText('Back to sign in')).toBeInTheDocument();
  });

  it('handles password reset submission', async () => {
    const mockResetPassword = vi.mocked(supabase.auth.resetPasswordForEmail);
    mockResetPassword.mockResolvedValue({ data: {}, error: null });

    render(<AuthForm onAuthSuccess={mockOnAuthSuccess} />);
    
    fireEvent.click(screen.getByText('Forgot your password?'));
    
    fireEvent.change(screen.getByRole('textbox', { name: /email/i }), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.click(screen.getByText('Send Reset Email'));
    
    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test@example.com', {
        redirectTo: expect.stringContaining('/')
      });
    });
  });

  it('validates required fields', () => {
    render(<AuthForm onAuthSuccess={mockOnAuthSuccess} />);
    
    const emailInput = screen.getByRole('textbox', { name: /email/i });
    const passwordInput = screen.getByLabelText('Password');
    
    expect(emailInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('required');
  });

  it('sets minimum password length for sign up', () => {
    render(<AuthForm onAuthSuccess={mockOnAuthSuccess} />);
    
    fireEvent.click(screen.getByText('Sign Up'));
    const passwordInput = screen.getByLabelText('Password');
    
    expect(passwordInput).toHaveAttribute('minLength', '6');
  });
});