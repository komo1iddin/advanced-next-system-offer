export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (error: any) => {
  if (error instanceof AppError) {
    return {
      success: false,
      error: error.message,
      statusCode: error.statusCode
    };
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    return {
      success: false,
      error: Object.values(error.errors).map((err: any) => err.message).join(', '),
      statusCode: 400
    };
  }

  // Handle Mongoose duplicate key errors
  if (error.code === 11000) {
    return {
      success: false,
      error: 'Duplicate field value entered',
      statusCode: 400
    };
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return {
      success: false,
      error: 'Invalid token. Please log in again!',
      statusCode: 401
    };
  }

  if (error.name === 'TokenExpiredError') {
    return {
      success: false,
      error: 'Your token has expired! Please log in again.',
      statusCode: 401
    };
  }

  // Default error
  return {
    success: false,
    error: 'Something went wrong',
    statusCode: 500
  };
}; 