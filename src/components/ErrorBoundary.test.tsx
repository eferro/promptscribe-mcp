import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';
import { logger } from '@/lib/logger';

// Component that throws an error when shouldThrow is true
function ThrowError({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No Error</div>;
}

test('shouldRenderChildrenWhenNoError', () => {
  render(
    <ErrorBoundary>
      <ThrowError shouldThrow={false} />
    </ErrorBoundary>
  );

  expect(screen.getByText('No Error')).toBeInTheDocument();
});

test('shouldRenderErrorUIWhenChildThrowsError', () => {
  // Suppress logger.error and console.error for this test
  const loggerSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  render(
    <ErrorBoundary>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  );

  expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  expect(screen.getByText("We're sorry, but something unexpected happened.")).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();

  loggerSpy.mockRestore();
  consoleSpy.mockRestore();
});

test('shouldLogErrorWhenCaught', () => {
  const loggerSpy = vi.spyOn(logger, 'error').mockImplementation(() => {});
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  render(
    <ErrorBoundary>
      <ThrowError shouldThrow={true} />
    </ErrorBoundary>
  );

  expect(loggerSpy).toHaveBeenCalledWith(
    'Error caught by boundary:',
    expect.any(Error),
    expect.any(Object)
  );

  loggerSpy.mockRestore();
  consoleSpy.mockRestore();
});