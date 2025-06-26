// Logger utility for production-safe logging
// In production, this could be replaced with a service like Sentry, LogRocket, etc.

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  source?: string;
}

class Logger {
  private isDevelopment = import.meta.env.DEV;
  private logs: LogEntry[] = [];
  private maxLogs = 100;

  private log(level: LogLevel, message: string, data?: any, source?: string) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
      source
    };

    // Store logs in memory (useful for debugging)
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // In development, log to console
    if (this.isDevelopment) {
      const consoleMethod = level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[${level.toUpperCase()}]`, message, data || '');
    }

    // In production, you would send critical errors to an error tracking service
    if (!this.isDevelopment && level === 'error') {
      // Example: Send to error tracking service
      // errorTracker.captureException(new Error(message), { extra: data });
    }
  }

  debug(message: string, data?: any, source?: string) {
    this.log('debug', message, data, source);
  }

  info(message: string, data?: any, source?: string) {
    this.log('info', message, data, source);
  }

  warn(message: string, data?: any, source?: string) {
    this.log('warn', message, data, source);
  }

  error(message: string, error?: Error | any, source?: string) {
    const errorData = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : error;
    
    this.log('error', message, errorData, source);
  }

  // Get recent logs for debugging
  getLogs(level?: LogLevel): LogEntry[] {
    if (level) {
      return this.logs.filter(log => log.level === level);
    }
    return this.logs;
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }
}

// Export singleton instance
export const logger = new Logger();

// Export for use in error boundaries or special cases
export type { LogLevel, LogEntry };