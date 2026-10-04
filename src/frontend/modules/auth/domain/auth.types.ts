export interface RegisterBusinessFormValues {
  name: string;
  legalName?: string;
  taxId?: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  currency?: string;
}

export interface RegisterWorkerFormValues {
  businessId: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword?: string;
  phone: string;
  specialty?: string;
  commissionPercentage?: number;
}

export interface LoginFormValues {
  email: string;
  password: string;
  userType?: 'BUSINESS' | 'WORKER';
}

export interface AuthSessionResponse {
  user: {
    id: string;
    businessId: string;
    email: string;
    name: string;
    role: 'BUSINESS_OWNER' | 'WORKER';
    userType: 'BUSINESS' | 'WORKER';
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: string;
    tokenType: string;
  };
  session: {
    id: string;
    expiresAt: string;
  };
}
