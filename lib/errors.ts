/**
 * Base error class for the application
 * Extends the built-in Error class with additional properties
 */
export class BaseError extends Error {
  public readonly name: string;
  public readonly cause?: Error;
  public readonly metadata?: Record<string, any>;

  constructor(message: string, options?: {
    cause?: Error;
    name?: string;
    metadata?: Record<string, any>;
  }) {
    super(message);
    
    this.name = options?.name || this.constructor.name;
    this.cause = options?.cause;
    this.metadata = options?.metadata;
    
    // Ensure the prototype chain is properly maintained
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Represents an error that occurs during API requests
 */
export class ApiRequestError extends BaseError {
  public readonly status: number;
  
  constructor(message: string, status: number, options?: {
    cause?: Error;
    metadata?: Record<string, any>;
  }) {
    super(message, {
      name: 'ApiRequestError',
      cause: options?.cause,
      metadata: options?.metadata
    });
    
    this.status = status;
  }
  
  /**
   * Checks if the error represents a not found (404) condition
   */
  isNotFound(): boolean {
    return this.status === 404;
  }
  
  /**
   * Checks if the error represents an unauthorized (401) condition
   */
  isUnauthorized(): boolean {
    return this.status === 401;
  }
  
  /**
   * Checks if the error represents a forbidden (403) condition
   */
  isForbidden(): boolean {
    return this.status === 403;
  }
}

/**
 * Represents a validation error
 */
export class ValidationError extends BaseError {
  public readonly errors: Record<string, string[]>;
  
  constructor(message: string, errors: Record<string, string[]>, options?: {
    cause?: Error;
    metadata?: Record<string, any>;
  }) {
    super(message, {
      name: 'ValidationError',
      cause: options?.cause,
      metadata: options?.metadata
    });
    
    this.errors = errors;
  }
}

/**
 * Represents an error that occurs during authentication
 */
export class AuthenticationError extends BaseError {
  constructor(message: string = 'Authentication failed', options?: {
    cause?: Error;
    metadata?: Record<string, any>;
  }) {
    super(message, {
      name: 'AuthenticationError',
      cause: options?.cause,
      metadata: options?.metadata
    });
  }
} 