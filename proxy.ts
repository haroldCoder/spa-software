import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { JoseTokenService } from '@/src/modules/auth/infrastructure/services/jose-token.service';

const tokenService = new JoseTokenService();

// Public routes that do NOT require authentication
const PUBLIC_API_ROUTES = [
  '/api/auth/register',
  '/api/auth/login',
  '/api/auth/business/register',
  '/api/auth/business/login',
  '/api/auth/worker/register',
  '/api/auth/worker/login',
  '/api/auth/refresh',
  '/api/openapi',
  '/api/whatsapp',
];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only handle /api routes
  if (!pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublic = PUBLIC_API_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isPublic) {
    return NextResponse.next();
  }

  // Extract Bearer token or session cookie
  let token: string | null = null;
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    token = request.cookies.get('auth_token')?.value || request.cookies.get('access_token')?.value || null;
  }

  if (!token) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No autorizado. Debes iniciar sesión o registrarte para acceder a este recurso.',
        },
      },
      { status: 401 }
    );
  }

  const payload = await tokenService.verifyAccessToken(token);
  if (!payload) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Token de autenticación inválido o expirado. Por favor inicia sesión nuevamente.',
        },
      },
      { status: 401 }
    );
  }

  // Inject authenticated user information into request headers for downstream handlers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-business-id', payload.businessId);
  requestHeaders.set('x-user-role', payload.role);
  requestHeaders.set('x-user-type', payload.userType);
  requestHeaders.set('x-session-id', payload.sessionId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

// For backwards-compatibility with Next.js versions that look for 'middleware'
export const middleware = proxy;

export const config = {
  matcher: ['/api/:path*'],
};
