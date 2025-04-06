import { NextRequest, NextResponse } from 'next/server';
import { ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

export class ValidateRequest {
  static async validate(schema: ZodSchema, data: unknown) {
    try {
      return await schema.parseAsync(data);
    } catch (error) {
      throw new AppError('VALIDATION_ERROR', 'Invalid request data', 400, error);
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
      throw new AppError('INVALID_BODY', 'Invalid request body', 400);
    }
  }

  static async validateParams(schema: ZodSchema, params: Record<string, string>) {
    return await this.validate(schema, params);
  }
} 