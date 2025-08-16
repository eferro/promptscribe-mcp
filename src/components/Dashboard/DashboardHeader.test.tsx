import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DashboardHeader } from './DashboardHeader';

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: '2023-01-01T00:00:00Z'
};

describe('DashboardHeader', () => {
  it('should display user email', () => {
    const onSignOut = vi.fn();
    const onCreateNew = vi.fn();
    
    render(<DashboardHeader user={mockUser} onSignOut={onSignOut} onCreateNew={onCreateNew} />);
    
    expect(screen.getByText('Welcome, test@example.com')).toBeInTheDocument();
  });

  it('should display app title', () => {
    const onSignOut = vi.fn();
    const onCreateNew = vi.fn();
    
    render(<DashboardHeader user={mockUser} onSignOut={onSignOut} onCreateNew={onCreateNew} />);
    
    expect(screen.getByText('MCP Prompt Manager')).toBeInTheDocument();
  });

  it('should call onCreateNew when new template clicked', () => {
    const onSignOut = vi.fn();
    const onCreateNew = vi.fn();
    
    render(<DashboardHeader user={mockUser} onSignOut={onSignOut} onCreateNew={onCreateNew} />);
    
    fireEvent.click(screen.getByText('New Template'));
    expect(onCreateNew).toHaveBeenCalledOnce();
  });

  it('should call onSignOut when sign out clicked', () => {
    const onSignOut = vi.fn();
    const onCreateNew = vi.fn();
    
    render(<DashboardHeader user={mockUser} onSignOut={onSignOut} onCreateNew={onCreateNew} />);
    
    fireEvent.click(screen.getByText('Sign Out'));
    expect(onSignOut).toHaveBeenCalledOnce();
  });

  it('should render new template button with plus icon', () => {
    const onSignOut = vi.fn();
    const onCreateNew = vi.fn();
    
    render(<DashboardHeader user={mockUser} onSignOut={onSignOut} onCreateNew={onCreateNew} />);
    
    const newTemplateButton = screen.getByText('New Template');
    expect(newTemplateButton).toBeInTheDocument();
  });

  it('should render sign out button with logout icon', () => {
    const onSignOut = vi.fn();
    const onCreateNew = vi.fn();
    
    render(<DashboardHeader user={mockUser} onSignOut={onSignOut} onCreateNew={onCreateNew} />);
    
    const signOutButton = screen.getByText('Sign Out');
    expect(signOutButton).toBeInTheDocument();
  });
});