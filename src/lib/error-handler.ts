// Comprehensive error handling utilities

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string> | string;
  timestamp?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
}

/**
 * Format error messages for user display
 */
export function formatErrorMessage(error: ApiError): string {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      if (error.details && typeof error.details === 'object') {
        const messages = Object.values(error.details);
        return `Gabime në validim:\n${messages.join('\n')}`;
      }
      return 'Të dhënat e futura nuk janë të vlefshme.';
    
    case 'DUPLICATE_EMAIL':
      return 'Ky email është tashmë në përdorim. Ju lutem përdorni një email tjetër.';
    
    case 'LAST_ADMIN_DELETION':
      return 'Nuk mund të fshini administratorin e fundit. Duhet të ketë të paktën një administrator në sistem.';
    
    case 'AGENT_NOT_FOUND':
      return 'Agjenti nuk u gjet. Mund të jetë fshirë tashmë.';
    
    case 'UNAUTHORIZED':
      return 'Nuk jeni të autorizuar për këtë veprim. Ju lutem kyçuni përsëri.';
    
    case 'FORBIDDEN':
      return 'Nuk keni të drejta të mjaftueshme për këtë veprim.';
    
    case 'INTERNAL_ERROR':
      return 'Gabim i brendshëm i serverit. Ju lutem provoni përsëri më vonë.';
    
    case 'NETWORK_ERROR':
      return 'Gabim në rrjet. Ju lutem kontrolloni lidhjen dhe provoni përsëri.';
    
    case 'PASSWORD_HASH_ERROR':
      return 'Gabim gjatë përpunimit të fjalëkalimit. Ju lutem provoni përsëri.';
    
    case 'FOREIGN_KEY_CONSTRAINT':
      return 'Nuk mund të fshihet sepse ka të dhëna të lidhura. Ju lutem kontaktoni administratorin.';
    
    default:
      return error.message || 'Ka ndodhur një gabim i papritur. Ju lutem provoni përsëri.';
  }
}

/**
 * Handle API response and extract error information
 */
export function handleApiResponse<T>(response: ApiResponse<T>): {
  success: boolean;
  data?: T;
  errorMessage?: string;
} {
  if (response.success && response.data) {
    return { success: true, data: response.data };
  }
  
  if (response.error) {
    return {
      success: false,
      errorMessage: formatErrorMessage(response.error),
    };
  }
  
  return {
    success: false,
    errorMessage: 'Ka ndodhur një gabim i papritur.',
  };
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(
  code: string,
  message: string,
  details?: Record<string, string> | string
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * Handle network errors and convert to ApiError
 */
export function handleNetworkError(error: unknown): ApiError {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      code: 'NETWORK_ERROR',
      message: 'Network connection failed',
      details: 'Please check your internet connection and try again',
    };
  }
  
  if (error instanceof Error) {
    return {
      code: 'UNKNOWN_ERROR',
      message: error.message,
    };
  }
  
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
  };
}

/**
 * Retry mechanism for API calls
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Don't retry on validation errors or client errors
      if (error instanceof Response && error.status >= 400 && error.status < 500) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
      }
    }
  }
  
  throw lastError;
}

/**
 * Validate form field and return user-friendly error message
 */
export function validateFormFieldWithMessage(fieldName: string, value: any): string | null {
  switch (fieldName) {
    case 'name':
      if (!value || typeof value !== 'string') {
        return 'Emri është i detyrueshëm';
      }
      if (value.trim().length < 2) {
        return 'Emri duhet të ketë të paktën 2 karaktere';
      }
      if (value.length > 100) {
        return 'Emri nuk mund të kalojë 100 karaktere';
      }
      break;

    case 'email':
      if (!value || typeof value !== 'string') {
        return 'Email është i detyrueshëm';
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value.trim())) {
        return 'Formati i email-it nuk është i vlefshëm';
      }
      break;

    case 'password':
      if (!value || typeof value !== 'string') {
        return 'Fjalëkalimi është i detyrueshëm';
      }
      if (value.length < 6) {
        return 'Fjalëkalimi duhet të ketë të paktën 6 karaktere';
      }
      if (value.length > 128) {
        return 'Fjalëkalimi nuk mund të kalojë 128 karaktere';
      }
      if (!/[a-zA-Z]/.test(value)) {
        return 'Fjalëkalimi duhet të përmbajë të paktën një shkronjë';
      }
      if (!/\d/.test(value)) {
        return 'Fjalëkalimi duhet të përmbajë të paktën një numër';
      }
      break;

    case 'phone':
      if (value && typeof value === 'string' && value.trim() !== '') {
        const phoneRegex = /^\+?[\d\s\-\(\)]{8,15}$/;
        if (!phoneRegex.test(value.trim())) {
          return 'Formati i telefonit nuk është i vlefshëm';
        }
      }
      break;

    default:
      break;
  }

  return null;
}

/**
 * Log errors for debugging while protecting sensitive information
 */
export function logError(context: string, error: unknown, additionalInfo?: Record<string, any>) {
  const errorInfo = {
    context,
    timestamp: new Date().toISOString(),
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : error,
    additionalInfo,
  };
  
  console.error('Application Error:', errorInfo);
  
  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, or similar
}