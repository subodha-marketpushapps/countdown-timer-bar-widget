import { _DEV } from "../../constants";

interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  step: string;
  message: string;
  data?: any;
}

class DebugLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 50;

  log(level: 'info' | 'warn' | 'error', step: string, message: string, data?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      step,
      message,
      data,
    };

    this.logs.push(entry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Only log to console in development
    if (_DEV) {
      const prefix = `[${step.toUpperCase()}]`;
      switch (level) {
        case 'info':
          console.log(`${prefix} ${message}`, data || '');
          break;
        case 'warn':
          console.warn(`${prefix} ${message}`, data || '');
          break;
        case 'error':
          console.error(`${prefix} ${message}`, data || '');
          break;
      }
    }
  }

  info(step: string, message: string, data?: any) {
    this.log('info', step, message, data);
  }

  warn(step: string, message: string, data?: any) {
    this.log('warn', step, message, data);
  }

  error(step: string, message: string, data?: any) {
    this.log('error', step, message, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const debugLogger = new DebugLogger();

// Add to window for debugging in development
if (_DEV && typeof window !== 'undefined') {
  (window as any).debugLogger = debugLogger;
}
