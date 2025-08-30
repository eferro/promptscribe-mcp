import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DashboardHeader } from './DashboardHeader';

describe('DashboardHeader', () => {
  const mockUser = { email: 'test@example.com' };
  const mockOnSignOut = vi.fn();
  const mockOnCreateNew = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display user email', () => {
    render(<DashboardHeader user={mockUser} onSignOut={mockOnSignOut} onCreateNew={mockOnCreateNew} />);
    expect(screen.getByText(/Welcome,/)).toBeInTheDocument();
    expect(screen.getByText('test')).toBeInTheDocument();
  });

  it('should call onCreateNew when new template clicked', () => {
    render(<DashboardHeader user={mockUser} onSignOut={mockOnSignOut} onCreateNew={mockOnCreateNew} />);
    fireEvent.click(screen.getByText('New Template'));
    expect(mockOnCreateNew).toHaveBeenCalled();
  });

  it('should call onSignOut when sign out clicked', () => {
    render(<DashboardHeader user={mockUser} onSignOut={mockOnSignOut} onCreateNew={mockOnCreateNew} />);
    fireEvent.click(screen.getByText('Sign Out'));
    expect(mockOnSignOut).toHaveBeenCalled();
  });

  it('should render proper UI structure', () => {
    render(<DashboardHeader user={mockUser} onSignOut={mockOnSignOut} onCreateNew={mockOnCreateNew} />);
    expect(screen.getByText('MCP Prompt Manager')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /New Template/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
  });

  it('should render header with proper CSS classes', () => {
    render(<DashboardHeader user={mockUser} onSignOut={mockOnSignOut} onCreateNew={mockOnCreateNew} />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('border-b', 'border-border', 'bg-card/50', 'backdrop-blur');
  });

  it('should display user email with proper text', () => {
    const userWithDifferentEmail = { email: 'different@test.com' };
    render(<DashboardHeader user={userWithDifferentEmail} onSignOut={mockOnSignOut} onCreateNew={mockOnCreateNew} />);
    expect(screen.getByText(/Welcome,/)).toBeInTheDocument();
    expect(screen.getByText('different')).toBeInTheDocument();
  });

  it('should display username when userProfile is provided', () => {
    const mockUserProfile = {
      id: 'profile-1',
      user_id: 'user-1',
      username: 'testuser',
      display_name: 'Test User',
      bio: null,
      avatar_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };
    
    render(
      <DashboardHeader 
        user={mockUser} 
        userProfile={mockUserProfile}
        onSignOut={mockOnSignOut} 
        onCreateNew={mockOnCreateNew} 
      />
    );
    
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  it('should display username when only username is available', () => {
    const mockUserProfile = {
      id: 'profile-1',
      user_id: 'user-1',
      username: 'testuser',
      display_name: null,
      bio: null,
      avatar_url: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    };
    
    render(
      <DashboardHeader 
        user={mockUser} 
        userProfile={mockUserProfile}
        onSignOut={mockOnSignOut} 
        onCreateNew={mockOnCreateNew} 
      />
    );
    
    expect(screen.getByText('testuser')).toBeInTheDocument();
    expect(screen.getByText('@testuser')).toBeInTheDocument();
  });

  it('should trigger onEditProfile from profile menu', async () => {
    const mockOnEditProfile = vi.fn();

    render(
      <DashboardHeader
        user={mockUser}
        onSignOut={mockOnSignOut}
        onCreateNew={mockOnCreateNew}
        onEditProfile={mockOnEditProfile}
      />
    );

    const profileButton = screen.getByRole('button', { name: /profile/i });
    expect(profileButton).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(profileButton);
    const editItem = await screen.findByText('Edit Profile');
    await user.click(editItem);

    expect(mockOnEditProfile).toHaveBeenCalled();
  });

  it('should call onChangeUsername when menu item clicked', async () => {
    const mockOnChangeUsername = vi.fn();

    render(
      <DashboardHeader
        user={mockUser}
        onSignOut={mockOnSignOut}
        onCreateNew={mockOnCreateNew}
        onChangeUsername={mockOnChangeUsername}
      />
    );

    const profileButton = screen.getByRole('button', { name: /profile/i });
    const user = userEvent.setup();
    await user.click(profileButton);

    const changeItem = await screen.findByText('Change Username');
    await user.click(changeItem);

    expect(mockOnChangeUsername).toHaveBeenCalled();
  });

  it('should not show profile button when no profile actions provided', () => {
    render(
      <DashboardHeader
        user={mockUser}
        onSignOut={mockOnSignOut}
        onCreateNew={mockOnCreateNew}
      />
    );

    expect(screen.queryByRole('button', { name: /profile/i })).not.toBeInTheDocument();
  });
});