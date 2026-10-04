import { HttpClient } from '@/src/frontend/shared/infrastructure/http-client';
import { RegisterBusinessFormValues, RegisterWorkerFormValues, AuthSessionResponse } from '../domain/auth.types';

export class AuthApi {
  public static async registerBusiness(values: RegisterBusinessFormValues): Promise<AuthSessionResponse> {
    const { confirmPassword, ...payload } = values;
    return HttpClient.post<AuthSessionResponse>('/api/auth/register', payload);
  }

  public static async registerWorker(values: RegisterWorkerFormValues): Promise<AuthSessionResponse> {
    const { confirmPassword, ...payload } = values;
    return HttpClient.post<AuthSessionResponse>('/api/auth/worker/register', payload);
  }

  public static async getCurrentUser(): Promise<AuthSessionResponse['user']> {
    return HttpClient.get<AuthSessionResponse['user']>('/api/auth/me');
  }

  public static async logout(): Promise<void> {
    return HttpClient.post<void>('/api/auth/logout');
  }
}
