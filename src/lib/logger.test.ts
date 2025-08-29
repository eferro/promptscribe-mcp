import { describe, it, expect, vi } from 'vitest';
import { logger } from './logger';

describe('logger', () => {
  it('logs errors using console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    logger.error('test');
    expect(spy).toHaveBeenCalledWith('test');
    spy.mockRestore();
  });
});
