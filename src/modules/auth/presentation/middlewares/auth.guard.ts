import { NextRequest, NextResponse } from 'next/server';
import { JoseTokenService } from '../../infrastructure/services/jose-token.service';
import { SupabaseAuthSessionRepository } from '../../infrastructure/repositories/supabase-auth-session.repository';
import { getSupabaseServerClient } from '@/src/shared/infrastructure/supabase/client';
import { AuthRole, AuthenticatedUser, TokenPayload } from '../../domain/entities/auth-user.entity';
import { UnauthorizedError, ForbiddenError } from '@/src/shared/domain/errors';

const tokenService = new JoseTokenService();

export interface AuthGuardOptions {
  requiredRole?: AuthRole | AuthRole[];
  validateSessionInDb?: boolean;
}

export async function authenticateRequest(
  req: NextRequest,
  options: AuthGuardOptions = {}
): Promise<{ user: AuthenticatedUser; payload: TokenPayload; token: string }> {
  // 1. Extract token from Authorization header or cookies
  let token: string | null = null;
  const authHeader = req.headers.get('Authorization') || req.headers.get('authorization');

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7).trim();
  } else {
    // Check cookies
    token = req.cookies.get('auth_token')?.value || req.cookies.get('access_token')?.value || null;
  }

  if (!token) {
    throw new UnauthorizedError('Token de autenticación no proporcionado. Inicia sesión para continuar.');
  }

  // 2. Verify JWT signature & expiration
  const payload = await tokenService.verifyAccessToken(token);
  if (!payload) {
    throw new UnauthorizedError('Token de autenticación inválido o expirado.');
  }

  // 3. Optional DB session check (default true for strong security & revocations)
  const shouldValidateDb = options.validateSessionInDb !== false;
  if (shouldValidateDb && payload.sessionId) {
    const supabase = getSupabaseServerClient();
    const sessionRepo = new SupabaseAuthSessionRepository(supabase);
    const session = await sessionRepo.findById(payload.sessionId);

    if (!session || !session.isValid()) {
      throw new UnauthorizedError('La sesión ha sido revocada o ha expirado. Por favor inicia sesión nuevamente.');
    }
  }

  // 4. Check role restrictions
  if (options.requiredRole) {
    const requiredRoles = Array.isArray(options.requiredRole) ? options.requiredRole : [options.requiredRole];
    if (!requiredRoles.includes(payload.role)) {
      throw new ForbiddenError(
        `Acceso denegado. Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}.`
      );
    }
  }

  const user: AuthenticatedUser = {
    id: payload.userId,
    businessId: payload.businessId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
    userType: payload.userType,
  };

  return { user, payload, token };
}

export function setAuthCookies(
  res: NextResponse,
  tokens: { accessToken: string; refreshToken?: string }
): void {
  // Set access token cookie (2 hours)
  res.cookies.set('auth_token', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 2 * 60 * 60, // 2 hours
  });

  // Set refresh token cookie if provided (30 days)
  if (tokens.refreshToken) {
    res.cookies.set('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
  }
}

export function clearAuthCookies(res: NextResponse): void {
  res.cookies.delete('auth_token');
  res.cookies.delete('access_token');
  res.cookies.delete('refresh_token');
}
