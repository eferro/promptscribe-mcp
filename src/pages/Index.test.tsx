import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import Index from './Index';
import { supabase } from '@/integrations/supabase/client';

// Mock the supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(),
      getSession: vi.fn(),
      signOut: vi.fn(),
    }
  }
}));

// Mock the components
vi.mock('@/components/auth/AuthForm', () => ({
  default: ({ onAuthSuccess }: any) => (
    <div data-testid="auth-form">
      <button onClick={onAuthSuccess}>Sign In Success</button>
    </div>
  )
}));

vi.mock('@/pages/Dashboard', () => ({
  default: ({ user, onSignOut }: any) => (
    <div data-testid="dashboard">
      <span>Dashboard for {user.email}</span>
      <button onClick={onSignOut}>Sign Out</button>
    </div>
  )
}));

vi.mock('@/components/auth/PasswordChangeForm', () => ({
  default: ({ onPasswordChanged, onCancel }: any) => (
    <div data-testid="password-change-form">
      <button onClick={onPasswordChanged}>Password Changed</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  )
}));

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  })
}));

const mockUser = {
  id: 'user-123',
  email: 'test@example.com'
};

const mockSession = {
  user: mockUser,
  access_token: 'access-token',
  refresh_token: 'refresh-token'
};

const IndexWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

describe('Index', () => {
  let mockOnAuthStateChange: any;
  let mockGetSession: any;
  let mockSignOut: any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockOnAuthStateChange = vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }));
    
    mockGetSession = vi.fn(() => 
      Promise.resolve({ data: { session: null } })
    );
    
    mockSignOut = vi.fn(() => Promise.resolve({ error: null }));
    
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation(mockOnAuthStateChange);
    vi.mocked(supabase.auth.getSession).mockImplementation(mockGetSession);
    vi.mocked(supabase.auth.signOut).mockImplementation(mockSignOut);

    // Clear URL parameters
    delete (window as any).location;
    (window as any).location = {
      search: '',
      pathname: '/',
    };
    Object.defineProperty(window, 'history', {
      value: { replaceState: vi.fn() },
      writable: true
    });
  });

  it('shows loading state initially', () => {
    render(
      <IndexWrapper>
        <Index />
      </IndexWrapper>
    );
    
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows auth form when user is not authenticated', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null } });
    
    render(
      <IndexWrapper>
        <Index />
      </IndexWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-form')).toBeInTheDocument();
    });
  });

  it('shows dashboard when user is authenticated', async () => {
    mockGetSession.mockResolvedValue({ data: { session: mockSession } });
    
    render(
      <IndexWrapper>
        <Index />
      </IndexWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      expect(screen.getByText(`Dashboard for ${mockUser.email}`)).toBeInTheDocument();
    });
  });

  it('handles auth state changes', async () => {
    let authCallback: any;
    mockOnAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    
    render(
      <IndexWrapper>
        <Index />
      </IndexWrapper>
    );
    
    // Simulate auth state change
    act(() => {
      authCallback('SIGNED_IN', mockSession);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  it('detects password recovery from URL parameters', async () => {
    // Mock URL with recovery parameters
    delete (window as any).location;
    (window as any).location = {
      search: '?access_token=token&refresh_token=refresh&type=recovery',
      pathname: '/',
    };
    
    mockGetSession.mockResolvedValue({ data: { session: mockSession } });
    
    render(
      <IndexWrapper>
        <Index />
      </IndexWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('password-change-form')).toBeInTheDocument();
    });
    
    expect(window.history.replaceState).toHaveBeenCalledWith({}, document.title, '/');
  });

  it('shows password change form on PASSWORD_RECOVERY event', async () => {
    let authCallback: any;
    mockOnAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });
    
    mockGetSession.mockResolvedValue({ data: { session: mockSession } });
    
    render(
      <IndexWrapper>
        <Index />
      </IndexWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
    
    // Simulate password recovery event
    act(() => {
      authCallback('PASSWORD_RECOVERY', mockSession);
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('password-change-form')).toBeInTheDocument();
    });
  });

  it('handles password change completion', async () => {
    // Start with password change form visible
    delete (window as any).location;
    (window as any).location = {
      search: '?access_token=token&refresh_token=refresh&type=recovery',
      pathname: '/',
    };
    
    mockGetSession.mockResolvedValue({ data: { session: mockSession } });
    
    render(
      <IndexWrapper>
        <Index />
      </IndexWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('password-change-form')).toBeInTheDocument();
    });
    
    // Complete password change
    act(() => {
      screen.getByText('Password Changed').click();
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  it('handles password change cancellation', async () => {
    // Start with password change form visible
    delete (window as any).location;
    (window as any).location = {
      search: '?access_token=token&refresh_token=refresh&type=recovery',
      pathname: '/',
    };
    
    mockGetSession.mockResolvedValue({ data: { session: mockSession } });
    
    render(
      <IndexWrapper>
        <Index />
      </IndexWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('password-change-form')).toBeInTheDocument();
    });
    
    // Cancel password change
    act(() => {
      screen.getByText('Cancel').click();
    });
    
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('handles sign out from dashboard', async () => {
    mockGetSession.mockResolvedValue({ data: { session: mockSession } });
    
    render(
      <IndexWrapper>
        <Index />
      </IndexWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
    
    // Sign out
    act(() => {
      screen.getByText('Sign Out').click();
    });
    
    expect(mockSignOut).toHaveBeenCalled();
  });

  it('clunsubscribes from auth state changes on cleanup', async () => {
    const unsubscribeMock = vi.fn();
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } }
    });
    
    const { unmount } = render(
      <IndexWrapper>
        <Index />
      </IndexWrapper>
    );
    
    unmount();
    expect(unsubscribeMock).toHaveBeenCalled();
  });

  it('handles URL parameters correctly when no recovery tokens present', async () => {
    delete (window as any).location;
    (window as any).location = {
      search: '?some_other_param=value',
      pathname: '/',
    };
    
    mockGetSession.mockResolvedValue({ data: { session: null } });
    
    render(
      <IndexWrapper>
        <Index />
      </IndexWrapper>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('auth-form')).toBeInTheDocument();
    });
    
    // Should not trigger password change form
    expect(screen.queryByTestId('password-change-form')).not.toBeInTheDocument();
  });
});