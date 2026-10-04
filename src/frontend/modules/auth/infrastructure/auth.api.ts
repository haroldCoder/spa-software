import { HttpClient } from '@/src/frontend/shared/infrastructure/http-client';
import {
  RegisterBusinessFormValues,
  RegisterWorkerFormValues,
  LoginFormValues,
  AuthSessionResponse,
} from '../domain/auth.types';

export async function registerBusiness(values: RegisterBusinessFormValues): Promise<AuthSessionResponse> {
  const { confirmPassword, ...payload } = values;
  return HttpClient.post<AuthSessionResponse>('/api/auth/register', payload);
}

export async function registerWorker(values: RegisterWorkerFormValues): Promise<AuthSessionResponse> {
  const { confirmPassword, ...payload } = values;
  return HttpClient.post<AuthSessionResponse>('/api/auth/worker/register', payload);
}

export async function login(values: LoginFormValues): Promise<AuthSessionResponse> {
  return HttpClient.post<AuthSessionResponse>('/api/auth/login', values);
}

export async function loginBusiness(values: { email: string; password: string }): Promise<AuthSessionResponse> {
  return HttpClient.post<AuthSessionResponse>('/api/auth/business/login', values);
}

export async function loginWorker(values: { email: string; password: string }): Promise<AuthSessionResponse> {
  return HttpClient.post<AuthSessionResponse>('/api/auth/worker/login', values);
}

export async function getCurrentUser(): Promise<AuthSessionResponse['user']> {
  return HttpClient.get<AuthSessionResponse['user']>('/api/auth/me');
}

export async function logout(): Promise<void> {
  return HttpClient.post<void>('/api/auth/logout');
}

export const AuthApi = {
  registerBusiness,
  registerWorker,
  login,
  loginBusiness,
  loginWorker,
  getCurrentUser,
  logout,
};
