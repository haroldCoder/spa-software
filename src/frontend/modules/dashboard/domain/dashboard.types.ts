export interface BusinessWorkerItem {
  id: string;
  businessId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email: string;
  phone: string;
  specialty?: string;
  commissionPercentage: number;
  isActive: boolean;
  createdAt: string;
}

export interface BusinessClientItem {
  id: string;
  businessId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  email?: string;
  phone: string;
  primaryWorkerId?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  legalName?: string;
  taxId?: string;
  phone?: string;
  email: string;
  address?: string;
  city?: string;
  country?: string;
  currency?: string;
  isActive: boolean;
  createdAt: string;
}

export interface DashboardMetrics {
  totalWorkers: number;
  activeWorkers: number;
  inactiveWorkers: number;
  averageCommission: number;
  specialtiesCount: number;
  totalClients: number;
  activeClients: number;
}
