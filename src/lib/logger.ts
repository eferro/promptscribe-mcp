const levels = ['debug', 'info', 'warn', 'error'] as const;
type LogLevel = typeof levels[number];
const envLevel = (import.meta.env?.VITE_LOG_LEVEL as LogLevel) || 'info';

function shouldLog(level: LogLevel) {
  return levels.indexOf(level) >= levels.indexOf(envLevel);
}

export const logger = {
  debug: (...args: unknown[]) => { if (shouldLog('debug')) console.debug(...args); },
  info: (...args: unknown[]) => { if (shouldLog('info')) console.info(...args); },
  warn: (...args: unknown[]) => { if (shouldLog('warn')) console.warn(...args); },
  error: (...args: unknown[]) => { if (shouldLog('error')) console.error(...args); }
};
