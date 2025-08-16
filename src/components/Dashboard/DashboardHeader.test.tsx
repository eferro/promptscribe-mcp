import { render, screen, fireEvent } from '@testing-library/react';
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
    expect(screen.getByText('Welcome, test@example.com')).toBeInTheDocument();
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
    expect(screen.getByText('Welcome, different@test.com')).toBeInTheDocument();
  });
});