import { Appointment, AppointmentStatus } from '../entities/appointment.entity';
import { PaginatedResult } from '@/src/shared/domain/pagination';

export interface AppointmentFilter {
  status?: AppointmentStatus | AppointmentStatus[];
  workerId?: string;
  clientId?: string;
  serviceId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export type PaginatedAppointments = PaginatedResult<Appointment>;

export interface IAppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByBusinessId(businessId: string, filter?: AppointmentFilter): Promise<PaginatedAppointments>;
  findByWorkerId(workerId: string, filter?: AppointmentFilter): Promise<PaginatedAppointments>;
  findByClientId(clientId: string, filter?: AppointmentFilter): Promise<PaginatedAppointments>;
  findOverlapping(
    workerId: string,
    startTime: Date,
    endTime: Date,
    excludeAppointmentId?: string
  ): Promise<Appointment[]>;
  findByCompletedStatus(businessId: string): Promise<Appointment[]>;
  save(appointment: Appointment): Promise<Appointment>;
  update(appointment: Appointment): Promise<Appointment>;
  delete(id: string): Promise<void>;
}
