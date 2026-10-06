import { Appointment, AppointmentStatus } from '../../domain/entities/appointment.entity';
import { AppointmentResponseDTO } from '../../application/dtos/appointment.dto';

export interface SupabaseAppointmentRow {
  id: string;
  business_id: string;
  worker_id: string | null;
  client_id: string;
  service_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  end_time: string;
  status: AppointmentStatus;
  price: number | string;
  notes: string | null;
  cancellation_reason: string | null;
  created_by_id: string | null;
  created_by_role: string | null;
  created_at: string;
  updated_at: string;
  // Joined relation fields if requested
  clients?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string | null;
  } | null;
  workers?: {
    id: string;
    first_name: string;
    last_name: string;
    specialty: string | null;
    phone: string;
  } | null;
  catalog_items?: {
    id: string;
    name: string;
    category: string | null;
    price: number | string;
    duration_minutes: number | null;
    image_url: string | null;
  } | null;
}

export class AppointmentMapper {
  public static toDomain(row: SupabaseAppointmentRow): Appointment {
    return Appointment.create({
      id: row.id,
      businessId: row.business_id,
      workerId: row.worker_id,
      clientId: row.client_id,
      serviceId: row.service_id,
      scheduledAt: new Date(row.scheduled_at),
      durationMinutes: row.duration_minutes,
      endTime: new Date(row.end_time),
      status: row.status,
      price: Number(row.price),
      notes: row.notes,
      cancellationReason: row.cancellation_reason,
      createdById: row.created_by_id,
      createdByRole: row.created_by_role,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  public static toPersistence(appointment: Appointment): Partial<SupabaseAppointmentRow> {
    const data: Partial<SupabaseAppointmentRow> = {
      business_id: appointment.businessId,
      worker_id: appointment.workerId,
      client_id: appointment.clientId,
      service_id: appointment.serviceId,
      scheduled_at: appointment.scheduledAt.toISOString(),
      duration_minutes: appointment.durationMinutes,
      end_time: appointment.endTime.toISOString(),
      status: appointment.status,
      price: appointment.price,
      notes: appointment.notes,
      cancellation_reason: appointment.cancellationReason,
      created_by_id: appointment.createdById,
      created_by_role: appointment.createdByRole,
    };

    if (appointment.id) {
      data.id = appointment.id;
    }

    return data;
  }

  public static toDTO(
    appointment: Appointment,
    joinedData?: {
      client?: SupabaseAppointmentRow['clients'];
      worker?: SupabaseAppointmentRow['workers'];
      service?: SupabaseAppointmentRow['catalog_items'];
    }
  ): AppointmentResponseDTO {
    return {
      id: appointment.id!,
      businessId: appointment.businessId,
      workerId: appointment.workerId,
      clientId: appointment.clientId,
      serviceId: appointment.serviceId,
      scheduledAt: appointment.scheduledAt.toISOString(),
      durationMinutes: appointment.durationMinutes,
      endTime: appointment.endTime.toISOString(),
      status: appointment.status,
      price: appointment.price,
      notes: appointment.notes,
      cancellationReason: appointment.cancellationReason,
      createdById: appointment.createdById,
      createdByRole: appointment.createdByRole,
      createdAt: appointment.createdAt.toISOString(),
      updatedAt: appointment.updatedAt.toISOString(),
      client: joinedData?.client
        ? {
            id: joinedData.client.id,
            firstName: joinedData.client.first_name,
            lastName: joinedData.client.last_name,
            phone: joinedData.client.phone,
            email: joinedData.client.email,
          }
        : undefined,
      worker: joinedData?.worker
        ? {
            id: joinedData.worker.id,
            firstName: joinedData.worker.first_name,
            lastName: joinedData.worker.last_name,
            specialty: joinedData.worker.specialty,
            phone: joinedData.worker.phone,
          }
        : undefined,
      service: joinedData?.service
        ? {
            id: joinedData.service.id,
            name: joinedData.service.name,
            category: joinedData.service.category,
            price: Number(joinedData.service.price),
            durationMinutes: joinedData.service.duration_minutes,
            imageUrl: joinedData.service.image_url,
          }
        : undefined,
    };
  }

  public static rowToDTO(row: SupabaseAppointmentRow): AppointmentResponseDTO {
    const domain = this.toDomain(row);
    return this.toDTO(domain, {
      client: row.clients,
      worker: row.workers,
      service: row.catalog_items,
    });
  }
}
