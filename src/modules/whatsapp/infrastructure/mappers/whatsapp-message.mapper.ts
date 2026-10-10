import { WhatsAppMessage } from '../../domain/entities/whatsapp-message.entity';

export interface SupabaseWhatsAppMessageRow {
  id: string;
  sender_name: string;
  sender_phone: string;
  content: string;
  timestamp: string;
  business_id: string | null;
  worker_id: string | null;
  created_at?: string;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function sanitizeUuid(val?: string | null): string | null {
  if (!val) return null;
  const trimmed = val.trim();
  return UUID_REGEX.test(trimmed) ? trimmed : null;
}

export class WhatsAppMessageMapper {
  public static toDomain(row: SupabaseWhatsAppMessageRow): WhatsAppMessage {
    return new WhatsAppMessage({
      id: row.id,
      senderName: row.sender_name,
      senderPhone: row.sender_phone,
      content: row.content,
      timestamp: row.timestamp,
      businessId: row.business_id ?? undefined,
      workerId: row.worker_id ?? undefined,
      createdAt: row.created_at,
    });
  }

  public static toPersistence(entity: WhatsAppMessage): SupabaseWhatsAppMessageRow {
    return {
      id: entity.id,
      sender_name: entity.senderName,
      sender_phone: entity.senderPhone,
      content: entity.content,
      timestamp: entity.timestamp,
      business_id: sanitizeUuid(entity.businessId),
      worker_id: sanitizeUuid(entity.workerId),
    };
  }
}
