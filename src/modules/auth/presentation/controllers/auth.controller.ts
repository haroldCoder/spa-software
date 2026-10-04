import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/src/shared/infrastructure/supabase/client';
import { SupabaseBusinessRepository } from '@/src/modules/business/infrastructure/repositories/supabase-business.repository';
import { SupabaseWorkerRepository } from '@/src/modules/workers/infrastructure/repositories/supabase-worker.repository';
import { SupabaseAuthRepository } from '../../infrastructure/repositories/supabase-auth.repository';
import { SupabaseAuthSessionRepository } from '../../infrastructure/repositories/supabase-auth-session.repository';
import { BcryptPasswordHasher } from '../../infrastructure/services/bcrypt-password-hasher.service';
import { JoseTokenService } from '../../infrastructure/services/jose-token.service';

import { RegisterBusinessUseCase } from '../../application/use-cases/register-business.use-case';
import { RegisterWorkerUseCase } from '../../application/use-cases/register-worker.use-case';
import { LoginBusinessUseCase } from '../../application/use-cases/login-business.use-case';
import { LoginWorkerUseCase } from '../../application/use-cases/login-worker.use-case';
import { RefreshTokenUseCase } from '../../application/use-cases/refresh-token.use-case';
import { LogoutUseCase } from '../../application/use-cases/logout.use-case';
import { GetCurrentUserUseCase } from '../../application/use-cases/get-current-user.use-case';

import {
  RegisterBusinessSchema,
  RegisterWorkerSchema,
  LoginBusinessSchema,
  LoginWorkerSchema,
  LoginUnifiedSchema,
  RefreshTokenSchema,
} from '../../application/dtos/auth.dto';
import { HttpResponse } from '@/src/shared/presentation/http-response';
import { authenticateRequest, setAuthCookies, clearAuthCookies } from '../middlewares/auth.guard';

export class AuthController {
  private static getDependencies() {
    const supabase = getSupabaseServerClient();
    const businessRepo = new SupabaseBusinessRepository(supabase);
    const workerRepo = new SupabaseWorkerRepository(supabase);
    const authRepo = new SupabaseAuthRepository(supabase);
    const sessionRepo = new SupabaseAuthSessionRepository(supabase);
    const passwordHasher = new BcryptPasswordHasher();
    const tokenService = new JoseTokenService();

    return {
      registerBusinessUseCase: new RegisterBusinessUseCase(businessRepo, passwordHasher, tokenService, sessionRepo),
      registerWorkerUseCase: new RegisterWorkerUseCase(workerRepo, businessRepo, passwordHasher, tokenService, sessionRepo),
      loginBusinessUseCase: new LoginBusinessUseCase(authRepo, passwordHasher, tokenService, sessionRepo),
      loginWorkerUseCase: new LoginWorkerUseCase(authRepo, businessRepo, passwordHasher, tokenService, sessionRepo),
      refreshTokenUseCase: new RefreshTokenUseCase(sessionRepo, tokenService, businessRepo, workerRepo),
      logoutUseCase: new LogoutUseCase(sessionRepo),
      getCurrentUserUseCase: new GetCurrentUserUseCase(sessionRepo, businessRepo, workerRepo),
    };
  }

  private static extractClientMetadata(request: NextRequest) {
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : request.headers.get('x-real-ip');
    const userAgent = request.headers.get('user-agent');
    return { ipAddress, userAgent };
  }

  public static async registerBusiness(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedData = RegisterBusinessSchema.parse(body);
      const metadata = this.extractClientMetadata(request);

      const { registerBusinessUseCase } = this.getDependencies();
      const result = await registerBusinessUseCase.execute(validatedData, metadata);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const data = result.getValue();
      const response = HttpResponse.created(data);
      setAuthCookies(response, {
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      });
      return response;
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async registerWorker(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedData = RegisterWorkerSchema.parse(body);
      const metadata = this.extractClientMetadata(request);

      const { registerWorkerUseCase } = this.getDependencies();
      const result = await registerWorkerUseCase.execute(validatedData, metadata);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const data = result.getValue();
      const response = HttpResponse.created(data);
      setAuthCookies(response, {
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      });
      return response;
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async loginBusiness(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedData = LoginBusinessSchema.parse(body);
      const metadata = this.extractClientMetadata(request);

      const { loginBusinessUseCase } = this.getDependencies();
      const result = await loginBusinessUseCase.execute(validatedData, metadata);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const data = result.getValue();
      const response = HttpResponse.ok(data);
      setAuthCookies(response, {
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      });
      return response;
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async loginWorker(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedData = LoginWorkerSchema.parse(body);
      const metadata = this.extractClientMetadata(request);

      const { loginWorkerUseCase } = this.getDependencies();
      const result = await loginWorkerUseCase.execute(validatedData, metadata);

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const data = result.getValue();
      const response = HttpResponse.ok(data);
      setAuthCookies(response, {
        accessToken: data.tokens.accessToken,
        refreshToken: data.tokens.refreshToken,
      });
      return response;
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async loginUnified(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const validatedData = LoginUnifiedSchema.parse(body);
      const metadata = this.extractClientMetadata(request);
      const { loginBusinessUseCase, loginWorkerUseCase } = this.getDependencies();

      // If userType explicitly specified, route directly
      if (validatedData.userType === 'WORKER') {
        const result = await loginWorkerUseCase.execute(validatedData, metadata);
        if (result.isFailure) return HttpResponse.handleDomainError(result.getError());
        const data = result.getValue();
        const response = HttpResponse.ok(data);
        setAuthCookies(response, { accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken });
        return response;
      }

      if (validatedData.userType === 'BUSINESS') {
        const result = await loginBusinessUseCase.execute(validatedData, metadata);
        if (result.isFailure) return HttpResponse.handleDomainError(result.getError());
        const data = result.getValue();
        const response = HttpResponse.ok(data);
        setAuthCookies(response, { accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken });
        return response;
      }

      // Auto-detect: first try business login, if not found or unauthorized try worker
      const bizResult = await loginBusinessUseCase.execute(validatedData, metadata);
      if (bizResult.isSuccess) {
        const data = bizResult.getValue();
        const response = HttpResponse.ok(data);
        setAuthCookies(response, { accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken });
        return response;
      }

      // Try worker
      const workerResult = await loginWorkerUseCase.execute(validatedData, metadata);
      if (workerResult.isSuccess) {
        const data = workerResult.getValue();
        const response = HttpResponse.ok(data);
        setAuthCookies(response, { accessToken: data.tokens.accessToken, refreshToken: data.tokens.refreshToken });
        return response;
      }

      // Return failure from business attempt or unauthorized
      return HttpResponse.handleDomainError(bizResult.getError());
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async refreshToken(request: NextRequest): Promise<NextResponse> {
    try {
      let refreshToken: string | undefined;

      // Try from request body
      try {
        const body = await request.json();
        const parsed = RefreshTokenSchema.safeParse(body);
        if (parsed.success) {
          refreshToken = parsed.data.refreshToken;
        }
      } catch {
        // Body might be empty, will check cookie
      }

      // Fallback to cookie
      if (!refreshToken) {
        refreshToken = request.cookies.get('refresh_token')?.value;
      }

      if (!refreshToken) {
        return HttpResponse.badRequest('Se requiere refreshToken en el cuerpo o en la cookie.');
      }

      const { refreshTokenUseCase } = this.getDependencies();
      const result = await refreshTokenUseCase.execute({ refreshToken });

      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      const data = result.getValue();
      const response = HttpResponse.ok(data);
      setAuthCookies(response, {
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return response;
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async logout(request: NextRequest): Promise<NextResponse> {
    try {
      let sessionId: string | undefined;

      // Extract session ID from active token if available
      try {
        const auth = await authenticateRequest(request, { validateSessionInDb: false });
        sessionId = auth.payload.sessionId;
      } catch {
        // User may be logging out with an already expired access token
      }

      // Or from body
      if (!sessionId) {
        try {
          const body = await request.json();
          sessionId = body?.sessionId;
        } catch {
          // ignore
        }
      }

      if (sessionId) {
        const { logoutUseCase } = this.getDependencies();
        await logoutUseCase.execute({ sessionId });
      }

      const response = HttpResponse.ok({ message: 'Sesión cerrada exitosamente.' });
      clearAuthCookies(response);
      return response;
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }

  public static async me(request: NextRequest): Promise<NextResponse> {
    try {
      const { payload } = await authenticateRequest(request);
      const { getCurrentUserUseCase } = this.getDependencies();

      const result = await getCurrentUserUseCase.execute(payload);
      if (result.isFailure) {
        return HttpResponse.handleDomainError(result.getError());
      }

      return HttpResponse.ok(result.getValue());
    } catch (error) {
      return HttpResponse.handleGenericError(error);
    }
  }
}
