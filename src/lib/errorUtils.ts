/**
 * Standardized error handling utilities
 * Provides consistent error messages and toast patterns across the app
 */

import { toast } from '@/hooks/use-toast';
import { logger } from './logger';

export type ErrorType = 
  | 'network'
  | 'authentication'
  | 'authorization'
  | 'validation'
  | 'notFound'
  | 'conflict'
  | 'rateLimit'
  | 'server'
  | 'unknown';

interface ErrorConfig {
  title: string;
  description: string;
  action?: string;
}

const ERROR_CONFIGS: Record<ErrorType, ErrorConfig> = {
  network: {
    title: 'Connection Error',
    description: 'Unable to connect to the server. Please check your internet connection.',
    action: 'Retry',
  },
  authentication: {
    title: 'Session Expired',
    description: 'Your session has expired. Please log in again.',
    action: 'Log In',
  },
  authorization: {
    title: 'Access Denied',
    description: 'You do not have permission to perform this action.',
  },
  validation: {
    title: 'Invalid Input',
    description: 'Please check your input and try again.',
  },
  notFound: {
    title: 'Not Found',
    description: 'The requested resource could not be found.',
  },
  conflict: {
    title: 'Conflict',
    description: 'This operation conflicts with existing data.',
  },
  rateLimit: {
    title: 'Too Many Requests',
    description: 'Please wait a moment before trying again.',
  },
  server: {
    title: 'Server Error',
    description: 'An unexpected error occurred. Our team has been notified.',
  },
  unknown: {
    title: 'Error',
    description: 'An unexpected error occurred. Please try again.',
  },
};

/**
 * Determine error type from error object or HTTP status
 */
export function getErrorType(error: unknown): ErrorType {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network';
    }
    if (message.includes('unauthorized') || message.includes('jwt') || message.includes('token')) {
      return 'authentication';
    }
    if (message.includes('forbidden') || message.includes('permission')) {
      return 'authorization';
    }
    if (message.includes('validation') || message.includes('invalid')) {
      return 'validation';
    }
    if (message.includes('not found') || message.includes('404')) {
      return 'notFound';
    }
    if (message.includes('conflict') || message.includes('duplicate')) {
      return 'conflict';
    }
    if (message.includes('rate limit') || message.includes('too many')) {
      return 'rateLimit';
    }
  }

  // Check for HTTP status in error object
  if (error && typeof error === 'object' && 'status' in error) {
    const status = (error as { status: number }).status;
    if (status === 401) return 'authentication';
    if (status === 403) return 'authorization';
    if (status === 404) return 'notFound';
    if (status === 409) return 'conflict';
    if (status === 422) return 'validation';
    if (status === 429) return 'rateLimit';
    if (status >= 500) return 'server';
  }

  return 'unknown';
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Don't expose internal error messages to users
    const type = getErrorType(error);
    return ERROR_CONFIGS[type].description;
  }
  return ERROR_CONFIGS.unknown.description;
}

/**
 * Show error toast with standardized styling
 */
export function showErrorToast(
  error: unknown,
  customMessage?: string,
  context?: string
): void {
  const errorType = getErrorType(error);
  const config = ERROR_CONFIGS[errorType];
  
  // Log error for debugging
  logger.apiError(`Error in ${context || 'unknown context'}`, error, {
    errorType,
    context,
  });

  toast({
    title: config.title,
    description: customMessage || config.description,
    variant: 'destructive',
  });
}

/**
 * Show success toast with standardized styling
 */
export function showSuccessToast(
  message: string,
  title: string = 'Success'
): void {
  toast({
    title,
    description: message,
  });
}

/**
 * Show info toast
 */
export function showInfoToast(
  message: string,
  title: string = 'Info'
): void {
  toast({
    title,
    description: message,
  });
}

/**
 * Show warning toast
 */
export function showWarningToast(
  message: string,
  title: string = 'Warning'
): void {
  toast({
    title,
    description: message,
    variant: 'destructive',
  });
}

/**
 * Handle async operation with standardized error handling
 */
export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  options: {
    context: string;
    successMessage?: string;
    errorMessage?: string;
    showSuccess?: boolean;
    showError?: boolean;
  }
): Promise<{ data: T | null; error: Error | null }> {
  const {
    context,
    successMessage,
    errorMessage,
    showSuccess = true,
    showError = true,
  } = options;

  try {
    const data = await operation();
    
    if (showSuccess && successMessage) {
      showSuccessToast(successMessage);
    }
    
    logger.info(`Operation completed: ${context}`);
    
    return { data, error: null };
  } catch (error) {
    if (showError) {
      showErrorToast(error, errorMessage, context);
    }
    
    return { data: null, error: error instanceof Error ? error : new Error(String(error)) };
  }
}
