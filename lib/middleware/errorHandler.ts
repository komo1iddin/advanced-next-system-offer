import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { LogService } from '../services/LogService';

export class ErrorHandler {
  static handle(error: unknown) {
    // Log the error
    LogService.error('Error occurred:', error);

    // Handle specific error types
    if (error instanceof AppError) {
      return NextResponse.json(
        { 
          success: false, 
          error: {
            code: error.code,
            message: error.message,
            details: error.details
          }
        },
        { status: error.statusCode }
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Validation failed',
            details: error.errors
          }
        },
        { status: 400 }
      );
    }

    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: {
            code: 'INTERNAL_ERROR',
            message: error.message || 'An unexpected error occurred'
          }
        },
        { status: 500 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      { 
        success: false, 
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred'
        }
      },
      { status: 500 }
    );
  }
} 