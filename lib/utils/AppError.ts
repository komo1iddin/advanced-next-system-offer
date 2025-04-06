export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code?: string,
    details?: any,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;

    // Capture stack trace
    Error.captureStackTrace(this, this.constructor);
  }

  // Common error types
  static badRequest(message: string, details?: any) {
    return new AppError(message, 400, 'BAD_REQUEST', details);
  }

  static unauthorized(message: string = 'Unauthorized', details?: any) {
    return new AppError(message, 401, 'UNAUTHORIZED', details);
  }

  static forbidden(message: string = 'Forbidden', details?: any) {
    return new AppError(message, 403, 'FORBIDDEN', details);
  }

  static notFound(message: string = 'Resource not found', details?: any) {
    return new AppError(message, 404, 'NOT_FOUND', details);
  }

  static conflict(message: string = 'Conflict', details?: any) {
    return new AppError(message, 409, 'CONFLICT', details);
  }

  static validation(message: string = 'Validation error', details?: any) {
    return new AppError(message, 422, 'VALIDATION_ERROR', details);
  }

  static tooManyRequests(message: string = 'Too many requests', details?: any) {
    return new AppError(message, 429, 'TOO_MANY_REQUESTS', details);
  }

  static internal(message: string = 'Internal server error', details?: any) {
    return new AppError(message, 500, 'INTERNAL_ERROR', details, false);
  }

  static serviceUnavailable(message: string = 'Service unavailable', details?: any) {
    return new AppError(message, 503, 'SERVICE_UNAVAILABLE', details);
  }

  // Database errors
  static database(message: string = 'Database error', details?: any) {
    return new AppError(message, 500, 'DATABASE_ERROR', details, false);
  }

  static uniqueConstraint(message: string = 'Unique constraint violation', details?: any) {
    return new AppError(message, 409, 'UNIQUE_CONSTRAINT', details);
  }

  static foreignKey(message: string = 'Foreign key constraint violation', details?: any) {
    return new AppError(message, 409, 'FOREIGN_KEY_CONSTRAINT', details);
  }

  // Authentication errors
  static invalidCredentials(message: string = 'Invalid credentials', details?: any) {
    return new AppError(message, 401, 'INVALID_CREDENTIALS', details);
  }

  static tokenExpired(message: string = 'Token expired', details?: any) {
    return new AppError(message, 401, 'TOKEN_EXPIRED', details);
  }

  static invalidToken(message: string = 'Invalid token', details?: any) {
    return new AppError(message, 401, 'INVALID_TOKEN', details);
  }

  // File upload errors
  static fileTooLarge(message: string = 'File too large', details?: any) {
    return new AppError(message, 413, 'FILE_TOO_LARGE', details);
  }

  static invalidFileType(message: string = 'Invalid file type', details?: any) {
    return new AppError(message, 400, 'INVALID_FILE_TYPE', details);
  }

  // Business logic errors
  static insufficientFunds(message: string = 'Insufficient funds', details?: any) {
    return new AppError(message, 400, 'INSUFFICIENT_FUNDS', details);
  }

  static resourceUnavailable(message: string = 'Resource unavailable', details?: any) {
    return new AppError(message, 503, 'RESOURCE_UNAVAILABLE', details);
  }

  // API errors
  static apiError(message: string = 'API error', details?: any) {
    return new AppError(message, 500, 'API_ERROR', details);
  }

  static rateLimitExceeded(message: string = 'Rate limit exceeded', details?: any) {
    return new AppError(message, 429, 'RATE_LIMIT_EXCEEDED', details);
  }

  // Format error response
  toJSON() {
    return {
      status: 'error',
      statusCode: this.statusCode,
      message: this.message,
      code: this.code,
      details: this.details,
      ...(process.env.NODE_ENV === 'development' && {
        stack: this.stack,
      }),
    };
  }
} 