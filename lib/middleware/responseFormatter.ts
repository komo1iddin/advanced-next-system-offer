import { NextResponse } from 'next/server';

export class ResponseFormatter {
  static success(data: unknown, message: string = 'Success', status: number = 200) {
    return NextResponse.json(
      {
        success: true,
        message,
        data
      },
      { status }
    );
  }

  static paginated(data: unknown, total: number, page: number, limit: number) {
    return NextResponse.json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  }

  static created(data: unknown, message: string = 'Resource created successfully') {
    return this.success(data, message, 201);
  }

  static updated(data: unknown, message: string = 'Resource updated successfully') {
    return this.success(data, message, 200);
  }

  static deleted(message: string = 'Resource deleted successfully') {
    return this.success(null, message, 200);
  }

  static notFound(message: string = 'Resource not found') {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_FOUND',
          message
        }
      },
      { status: 404 }
    );
  }

  static unauthorized(message: string = 'Unauthorized access') {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message
        }
      },
      { status: 401 }
    );
  }

  static forbidden(message: string = 'Forbidden access') {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FORBIDDEN',
          message
        }
      },
      { status: 403 }
    );
  }
} 