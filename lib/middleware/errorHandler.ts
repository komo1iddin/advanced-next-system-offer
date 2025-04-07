import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from '../utils/AppError';
import { logService } from '../services/LogService';

export class ErrorHandler {
  static handle(error: unknown) {
    // Log the error
    logService.error('Error occurred:', error);

    // Handle specific error types
    if (error instanceof AppError) {
      return NextResponse.json(
        { 
          success: false, 
          error: {
            code: error.statusCode,
            message: error.message,
            details: error.details
          }
        },
        { status: error.statusCode }
      );
    }

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 400,
            message: 'Validation error',
            details: error.errors
          }
        },
        { status: 400 }
      );
    }

    // Handle unknown errors
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 500,
          message: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error occurred'
        }
      },
      { status: 500 }
    );
  }
} 