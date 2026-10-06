export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface AppointmentClient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
}

export interface AppointmentWorker {
  id: string;
  firstName: string;
  lastName: string;
  specialty?: string | null;
  phone: string;
}

export interface AppointmentService {
  id: string;
  name: string;
  category?: string | null;
  price: number;
  durationMinutes?: number | null;
  imageUrl?: string | null;
}

export interface AppointmentItem {
  id: string;
  businessId: string;
  workerId: string | null;
  clientId: string;
  serviceId: string | null;
  scheduledAt: string;
  durationMinutes: number;
  endTime: string;
  status: AppointmentStatus;
  price: number;
  notes: string | null;
  cancellationReason: string | null;
  createdById: string | null;
  createdByRole: string | null;
  createdAt: string;
  updatedAt: string;
  client?: AppointmentClient;
  worker?: AppointmentWorker;
  service?: AppointmentService;
}

export interface PaginatedAppointmentsResponse {
  items: AppointmentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface AppointmentFilters {
  page: number;
  limit: number;
  status?: AppointmentStatus | 'ALL';
  workerId?: string;
  clientId?: string;
  serviceId?: string;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
}
