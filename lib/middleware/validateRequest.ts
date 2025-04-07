import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

export class ValidateRequest {
  static async validate(schema: ZodSchema, data: unknown) {
    try {
      return await schema.parseAsync(data);
    } catch (error) {
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
      return await this.validate(schema, body);
    } catch (error) {
      throw new AppError('Invalid request body', 400, 'INVALID_BODY');
    }
  }

  static async validateParams(schema: ZodSchema, params: Record<string, string>) {
    return await this.validate(schema, params);
  }
} 