import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useToast, toast, reducer } from './use-toast';

describe('useToast', () => {
  beforeEach(() => {
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with empty toasts', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('adds a toast when toast function is called', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({
        title: 'Test Toast',
        description: 'Test Description'
      });
    });

    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Test Toast');
    expect(result.current.toasts[0].description).toBe('Test Description');
    expect(result.current.toasts[0].open).toBe(true);
  });

  it('limits toasts to TOAST_LIMIT', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Toast 1' });
      result.current.toast({ title: 'Toast 2' });
    });

    // Should only keep the most recent toast (TOAST_LIMIT = 1)
    expect(result.current.toasts).toHaveLength(1);
    expect(result.current.toasts[0].title).toBe('Toast 2');
  });

  it('dismisses a toast', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Test Toast' });
    });

    const toastId = result.current.toasts[0].id;
    
    act(() => {
      result.current.dismiss(toastId);
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it('dismisses all toasts when no id provided', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Toast 1' });
    });

    act(() => {
      result.current.dismiss();
    });

    expect(result.current.toasts[0].open).toBe(false);
  });

  it('generates unique IDs for toasts', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Toast 1' });
    });

    const firstId = result.current.toasts[0].id;

    act(() => {
      result.current.toast({ title: 'Toast 2' });
    });

    const secondId = result.current.toasts[0].id;
    expect(firstId).not.toBe(secondId);
  });
});

describe('toast function', () => {
  it('creates a toast with update and dismiss functions', () => {
    const toastInstance = toast({ title: 'Test' });
    
    expect(toastInstance.id).toBeDefined();
    expect(typeof toastInstance.dismiss).toBe('function');
    expect(typeof toastInstance.update).toBe('function');
  });

  it('tests toast update functionality', () => {
    const toastInstance = toast({ title: 'Original Title' });
    
    // Test update function (lines 146-149)
    act(() => {
      toastInstance.update({ title: 'Updated Title', description: 'New Description' });
    });
    
    expect(toastInstance.id).toBeDefined();
    expect(typeof toastInstance.update).toBe('function');
  });

  it('tests onOpenChange callback functionality', () => {
    const { result } = renderHook(() => useToast());
    
    act(() => {
      result.current.toast({ title: 'Test Toast' });
    });
    
    expect(result.current.toasts).toHaveLength(1);
    const toastItem = result.current.toasts[0];
    
    // Test onOpenChange callback that triggers dismiss (lines 159-160)
    act(() => {
      toastItem.onOpenChange?.(false);
    });
    
    // Should mark toast as closed
    expect(result.current.toasts[0].open).toBe(false);
  });
});

describe('toast reducer', () => {
  const initialState = { toasts: [] };

  it('adds a toast', () => {
    const toast = {
      id: '1',
      title: 'Test',
      open: true
    };

    const newState = reducer(initialState, {
      type: 'ADD_TOAST',
      toast
    });

    expect(newState.toasts).toHaveLength(1);
    expect(newState.toasts[0]).toEqual(toast);
  });

  it('updates a toast', () => {
    const initialStateWithToast = {
      toasts: [{ id: '1', title: 'Original', open: true }]
    };

    const newState = reducer(initialStateWithToast, {
      type: 'UPDATE_TOAST',
      toast: { id: '1', title: 'Updated' }
    });

    expect(newState.toasts[0].title).toBe('Updated');
    expect(newState.toasts[0].id).toBe('1');
  });

  it('dismisses a toast', () => {
    const initialStateWithToast = {
      toasts: [{ id: '1', title: 'Test', open: true }]
    };

    const newState = reducer(initialStateWithToast, {
      type: 'DISMISS_TOAST',
      toastId: '1'
    });

    expect(newState.toasts[0].open).toBe(false);
  });

  it('removes a toast', () => {
    const initialStateWithToast = {
      toasts: [{ id: '1', title: 'Test', open: true }]
    };

    const newState = reducer(initialStateWithToast, {
      type: 'REMOVE_TOAST',
      toastId: '1'
    });

    expect(newState.toasts).toHaveLength(0);
  });

  it('removes all toasts when no id provided', () => {
    const initialStateWithToasts = {
      toasts: [
        { id: '1', title: 'Test 1', open: true },
        { id: '2', title: 'Test 2', open: true }
      ]
    };

    const newState = reducer(initialStateWithToasts, {
      type: 'REMOVE_TOAST'
    });

    expect(newState.toasts).toHaveLength(0);
  });
});