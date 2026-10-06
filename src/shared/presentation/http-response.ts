import { NextResponse } from 'next/server';
import { DomainError } from '../domain/errors';
import { ZodError } from 'zod';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: unknown;
  };
}

export class HttpResponse {
  public static ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status }
    );
  }

  public static paginated<T>(
    items: T[],
    total: number,
    page: number,
    limit: number,
    status = 200
  ): NextResponse<
    ApiResponse<{
      items: T[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    }>
  > {
    const totalPages = Math.ceil(total / limit) || (total === 0 ? 0 : 1);
    return this.ok(
      {
        items,
        total,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
      status
    );
  }

  public static created<T>(data: T): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 201 }
    );
  }

  public static noContent(): NextResponse {
    return new NextResponse(null, { status: 204 });
  }

  public static badRequest(message: string, details?: unknown): NextResponse<ApiResponse<null>> {
    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code: 'BAD_REQUEST',
          details,
        },
      },
      { status: 400 }
    );
  }

  public static unauthorized(message = 'No autorizado', details?: unknown): NextResponse<ApiResponse<null>> {
    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code: 'UNAUTHORIZED',
          details,
        },
      },
      { status: 401 }
    );
  }

  public static forbidden(message = 'Acceso prohibido', details?: unknown): NextResponse<ApiResponse<null>> {
    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code: 'FORBIDDEN',
          details,
        },
      },
      { status: 403 }
    );
  }

  public static handleDomainError(error: DomainError): NextResponse<ApiResponse<null>> {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.name,
          details: 'details' in error ? (error as { details: unknown }).details : undefined,
        },
      },
      { status: error.statusCode }
    );
  }

  public static handleGenericError(error: unknown): NextResponse<ApiResponse<null>> {
    if (error instanceof DomainError) {
      return this.handleDomainError(error);
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Error de validación en los datos de entrada',
            code: 'VALIDATION_ERROR',
            details: error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const message = error instanceof Error ? error.message : 'Ha ocurrido un error inesperado en el servidor';
    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code: 'INTERNAL_SERVER_ERROR',
        },
      },
      { status: 500 }
    );
  }
}
