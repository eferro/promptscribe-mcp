import { describe, it, expect } from 'vitest';
import { cn, generateTimestamps } from './utils';

describe('cn utility function', () => {
  it('joins class names correctly', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('merges Tailwind class names', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4');
  });

  it('returns empty string when no inputs are provided', () => {
    expect(cn()).toBe('');
  });
});

describe('generateTimestamps', () => {
  it('returns matching ISO timestamps', () => {
    const { created_at, updated_at } = generateTimestamps();
    expect(created_at).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(updated_at).toBe(created_at);
  });
});