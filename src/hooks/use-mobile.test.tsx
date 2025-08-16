import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useIsMobile } from './use-mobile';

describe('useIsMobile', () => {
  let mockMatchMedia: ReturnType<typeof vi.fn>;
  let listeners: (() => void)[] = [];

  beforeEach(() => {
    listeners = [];
    
    mockMatchMedia = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn((event: string, handler: () => void) => {
        if (event === 'change') {
          listeners.push(handler);
        }
      }),
      removeEventListener: vi.fn((event: string, handler: () => void) => {
        if (event === 'change') {
          const index = listeners.indexOf(handler);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        }
      }),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });

    // Mock window.innerWidth
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  afterEach(() => {
    listeners = [];
  });

  it('returns false for desktop width initially', () => {
    // Set desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true for mobile width initially', () => {
    // Set mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('uses correct breakpoint (768px)', () => {
    renderHook(() => useIsMobile());
    expect(mockMatchMedia).toHaveBeenCalledWith('(max-width: 767px)');
  });

  it('responds to window resize changes', () => {
    // Start with desktop width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate window resize to mobile width
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });
      
      // Trigger the change listener
      listeners.forEach(listener => listener());
    });

    expect(result.current).toBe(true);
  });

  it('responds to resize from mobile to desktop', () => {
    // Start with mobile width
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);

    // Simulate window resize to desktop width
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1024,
      });
      
      // Trigger the change listener
      listeners.forEach(listener => listener());
    });

    expect(result.current).toBe(false);
  });

  it('handles exact breakpoint boundary (767px = mobile)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 767,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('handles exact breakpoint boundary (768px = desktop)', () => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 768,
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('cleans up event listeners on unmount', () => {
    const removeEventListenerSpy = vi.fn();
    mockMatchMedia.mockReturnValue({
      matches: false,
      media: '(max-width: 767px)',
      addEventListener: vi.fn(),
      removeEventListener: removeEventListenerSpy,
    });

    const { unmount } = renderHook(() => useIsMobile());
    
    unmount();
    
    expect(removeEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('returns boolean even with undefined initial state', () => {
    const { result } = renderHook(() => useIsMobile());
    
    // Should return a boolean, not undefined
    expect(typeof result.current).toBe('boolean');
  });

  it('handles multiple simultaneous listeners correctly', () => {
    const { result: result1 } = renderHook(() => useIsMobile());
    const { result: result2 } = renderHook(() => useIsMobile());
    
    expect(result1.current).toBe(result2.current);
    
    // Both should respond to changes
    act(() => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600,
      });
      
      listeners.forEach(listener => listener());
    });
    
    expect(result1.current).toBe(true);
    expect(result2.current).toBe(true);
  });

  it('works correctly with different window sizes', () => {
    const testSizes = [
      { width: 320, expected: true },   // Mobile
      { width: 480, expected: true },   // Small mobile
      { width: 767, expected: true },   // Boundary mobile
      { width: 768, expected: false },  // Boundary desktop
      { width: 1024, expected: false }, // Desktop
      { width: 1920, expected: false }, // Large desktop
    ];

    testSizes.forEach(({ width, expected }) => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: width,
      });

      const { result } = renderHook(() => useIsMobile());
      expect(result.current).toBe(expected);
    });
  });
});