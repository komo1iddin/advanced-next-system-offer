import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

export class ValidateRequest {
  static async validate(schema: ZodSchema, data: unknown) {
    try {
      return await schema.parseAsync(data);
    } catch (error) {
      console.error('Validation error details:', JSON.stringify(error, null, 2));
      throw new AppError('Invalid request data', 400, 'VALIDATION_ERROR', error);
    }
  }

  static async validateQuery(schema: ZodSchema, request: NextRequest) {
    const query = Object.fromEntries(request.nextUrl.searchParams);
    return await this.validate(schema, query);
  }

  static async validateBody(schema: ZodSchema, request: NextRequest) {
    try {
      const body = await request.json();
      console.log('Request body:', JSON.stringify(body, null, 2));
      return await this.validate(schema, body);
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error('JSON parsing error:', error.message);
        throw new AppError('Invalid JSON in request body', 400, 'INVALID_JSON');
      }
      
      if (error instanceof AppError) {
        throw error;
      }
      
      console.error('Request body validation error:', error);
      throw new AppError('Invalid request body', 400, 'INVALID_BODY', error);
    }
  }

  static async validateParams(schema: ZodSchema, params: Record<string, string>) {
    return await this.validate(schema, params);
  }
} 