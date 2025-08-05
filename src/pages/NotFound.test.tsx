import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import NotFound from './NotFound';

// Mock console.error to test error logging
const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

describe('NotFound', () => {
  beforeEach(() => {
    consoleSpy.mockClear();
  });

  it('renders 404 error page with correct content', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Oops! Page not found')).toBeInTheDocument();
    expect(screen.getByText('Return to Home')).toBeInTheDocument();
  });

  it('has correct link to home page', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    
    const homeLink = screen.getByText('Return to Home');
    expect(homeLink).toHaveAttribute('href', '/');
  });

  it('logs error to console with current pathname', () => {
    const testPath = '/some/nonexistent/path';
    
    render(
      <MemoryRouter initialEntries={[testPath]}>
        <NotFound />
      </MemoryRouter>
    );
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '404 Error: User attempted to access non-existent route:',
      testPath
    );
  });

  it('logs error for different paths', () => {
    const testPath = '/another/invalid/route';
    
    render(
      <MemoryRouter initialEntries={[testPath]}>
        <NotFound />
      </MemoryRouter>
    );
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '404 Error: User attempted to access non-existent route:',
      testPath
    );
  });

  it('applies correct CSS classes for styling', () => {
    render(
      <BrowserRouter>
        <NotFound />
      </BrowserRouter>
    );
    
    const mainContainer = screen.getByText('404').closest('div')?.parentElement;
    expect(mainContainer).toHaveClass('min-h-screen', 'flex', 'items-center', 'justify-center', 'bg-gray-100');
    
    const contentContainer = screen.getByText('404').closest('div');
    expect(contentContainer).toHaveClass('text-center');
    
    const homeLink = screen.getByText('Return to Home');
    expect(homeLink).toHaveClass('text-blue-500', 'hover:text-blue-700', 'underline');
  });

  it('handles pathname changes correctly', () => {
    // First render
    render(
      <MemoryRouter initialEntries={['/first-path']}>
        <NotFound />
      </MemoryRouter>
    );
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '404 Error: User attempted to access non-existent route:',
      '/first-path'
    );
    
    consoleSpy.mockClear();
    
    // Second render with different path
    render(
      <MemoryRouter initialEntries={['/second-path']}>
        <NotFound />
      </MemoryRouter>
    );
    
    expect(consoleSpy).toHaveBeenCalledWith(
      '404 Error: User attempted to access non-existent route:',
      '/second-path'
    );
  });

  it('renders consistently regardless of path', () => {
    const { rerender } = render(
      <MemoryRouter initialEntries={['/any/path']}>
        <NotFound />
      </MemoryRouter>
    );
    
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Oops! Page not found')).toBeInTheDocument();
    
    rerender(
      <MemoryRouter initialEntries={['/completely/different/path']}>
        <NotFound />
      </MemoryRouter>
    );
    
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Oops! Page not found')).toBeInTheDocument();
  });
});