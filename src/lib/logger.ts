/**
 * Secure logging utility that prevents PII exposure
 * Logs are sanitized and structured for debugging without exposing sensitive data
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
}

// Fields that should never be logged
const SENSITIVE_FIELDS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'apiKey',
  'secret',
  'ssn',
  'socialSecurityNumber',
  'creditCard',
  'cardNumber',
  'cvv',
  'pin',
  'dateOfBirth',
  'dob',
  'medicalHistory',
  'diagnosis',
  'treatment',
  'medications',
  'allergies',
  'insuranceId',
  'policyNumber',
  'licenseNumber',
];

// Fields to redact (show partial)
const REDACT_FIELDS = ['email', 'phone', 'address', 'name', 'firstName', 'lastName'];

/**
 * Sanitize sensitive data from log context
 */
function sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(context)) {
    const lowerKey = key.toLowerCase();
    
    // Check if field should be completely removed
    if (SENSITIVE_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
      continue;
    }

    // Check if field should be partially redacted
    if (REDACT_FIELDS.some(field => lowerKey.includes(field.toLowerCase()))) {
      if (typeof value === 'string' && value.length > 4) {
        sanitized[key] = value.substring(0, 2) + '***' + value.substring(value.length - 2);
      } else {
        sanitized[key] = '[REDACTED]';
      }
      continue;
    }

    // Recursively sanitize nested objects
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeContext(value as Record<string, unknown>);
      continue;
    }

    // Sanitize arrays
    if (Array.isArray(value)) {
      sanitized[key] = value.map(item => 
        typeof item === 'object' && item !== null 
          ? sanitizeContext(item as Record<string, unknown>)
          : item
      );
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}

/**
 * Format log entry for console output
 */
function formatLogEntry(entry: LogEntry): string {
  const levelColors: Record<LogLevel, string> = {
    debug: '\x1b[36m', // cyan
    info: '\x1b[32m',  // green
    warn: '\x1b[33m',  // yellow
    error: '\x1b[31m', // red
  };
  const reset = '\x1b[0m';
  
  return `${levelColors[entry.level]}[${entry.level.toUpperCase()}]${reset} ${entry.timestamp} - ${entry.message}`;
}

/**
 * Create a log entry
 */
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): LogEntry {
  return {
    level,
    message,
    context: context ? sanitizeContext(context) : undefined,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Main logger object
 */
export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    if (process.env.NODE_ENV === 'development') {
      const entry = createLogEntry('debug', message, context);
      console.debug(formatLogEntry(entry), entry.context || '');
    }
  },

  info(message: string, context?: Record<string, unknown>) {
    const entry = createLogEntry('info', message, context);
    console.info(formatLogEntry(entry), entry.context || '');
  },

  warn(message: string, context?: Record<string, unknown>) {
    const entry = createLogEntry('warn', message, context);
    console.warn(formatLogEntry(entry), entry.context || '');
  },

  error(message: string, context?: Record<string, unknown>) {
    const entry = createLogEntry('error', message, context);
    console.error(formatLogEntry(entry), entry.context || '');
    
    // In production, you could send to an error tracking service here
    // Example: sendToErrorService(entry);
  },

  /**
   * Log an API/network error with safe context
   */
  apiError(message: string, error: unknown, context?: Record<string, unknown>) {
    const errorContext: Record<string, unknown> = {
      ...context,
    };

    if (error instanceof Error) {
      errorContext.errorName = error.name;
      errorContext.errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorContext.errorMessage = error;
    }

    this.error(message, errorContext);
  },

  /**
   * Log a user action (without PII)
   */
  userAction(action: string, details?: Record<string, unknown>) {
    this.info(`User action: ${action}`, {
      action,
      ...details,
    });
  },

  /**
   * Log a performance metric
   */
  performance(metric: string, durationMs: number, context?: Record<string, unknown>) {
    this.info(`Performance: ${metric}`, {
      metric,
      durationMs,
      ...context,
    });
  },
};

export default logger;
