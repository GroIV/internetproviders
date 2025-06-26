// Custom error classes for better error handling

export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends APIError {
  constructor(message = 'Network error occurred') {
    super(message);
    this.name = 'NetworkError';
    this.code = 'NETWORK_ERROR';
  }
}

export class ValidationError extends APIError {
  constructor(message: string, public fields?: Record<string, string[]>) {
    super(message, 400, 'VALIDATION_ERROR');
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends APIError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'AUTH_ERROR');
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends APIError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends APIError {
  constructor(message = 'Resource not found') {
    super(message, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class ServerError extends APIError {
  constructor(message = 'Server error occurred') {
    super(message, 500, 'SERVER_ERROR');
    this.name = 'ServerError';
  }
}

// Helper function to create appropriate error based on response
export function createAPIError(response: Response, message?: string): APIError {
  const defaultMessage = message || `Request failed: ${response.statusText}`;
  
  switch (response.status) {
    case 400:
      return new ValidationError(defaultMessage);
    case 401:
      return new AuthenticationError(defaultMessage);
    case 403:
      return new AuthorizationError(defaultMessage);
    case 404:
      return new NotFoundError(defaultMessage);
    case 500:
    case 502:
    case 503:
    case 504:
      return new ServerError(defaultMessage);
    default:
      return new APIError(defaultMessage, response.status);
  }
}

// Type guard functions
export const isAPIError = (error: any): error is APIError => {
  return error instanceof APIError;
};

export const isNetworkError = (error: any): error is NetworkError => {
  return error instanceof NetworkError || 
         (error instanceof TypeError && error.message.includes('fetch'));
};

export const isValidationError = (error: any): error is ValidationError => {
  return error instanceof ValidationError;
};

// User-friendly error messages
export function getErrorMessage(error: any): string {
  if (isNetworkError(error)) {
    return 'Unable to connect. Please check your internet connection and try again.';
  }
  
  if (error instanceof AuthenticationError) {
    return 'Please log in to continue.';
  }
  
  if (error instanceof AuthorizationError) {
    return 'You do not have permission to perform this action.';
  }
  
  if (error instanceof NotFoundError) {
    return 'The requested resource was not found.';
  }
  
  if (error instanceof ServerError) {
    return 'A server error occurred. Please try again later.';
  }
  
  if (error instanceof ValidationError) {
    return error.message || 'Please check your input and try again.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}