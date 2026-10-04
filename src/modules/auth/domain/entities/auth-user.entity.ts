export type AuthRole = 'BUSINESS_OWNER' | 'WORKER';
export type UserType = 'BUSINESS' | 'WORKER';

export interface AuthenticatedUser {
  id: string;
  businessId: string;
  email: string;
  name: string;
  role: AuthRole;
  userType: UserType;
}

export interface TokenPayload {
  userId: string;
  businessId: string;
  email: string;
  name: string;
  role: AuthRole;
  userType: UserType;
  sessionId: string;
}
