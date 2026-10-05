export interface RegisterClientFormValues {
  businessId: string;
  primaryWorkerId?: string | null;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone: string;
  identificationNumber?: string | null;
  birthDate?: string | null;
  notes?: string | null;
}

export interface ClientItem {
  id: string;
  businessId: string;
  primaryWorkerId: string | null;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string | null;
  phone: string;
  identificationNumber: string | null;
  birthDate: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientApiResponse {
  success: boolean;
  data: ClientItem;
  message?: string;
}
