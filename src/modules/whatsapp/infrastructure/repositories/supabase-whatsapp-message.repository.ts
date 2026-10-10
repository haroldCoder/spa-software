import { SupabaseClient } from '@supabase/supabase-js';
import { WhatsAppMessage } from '../../domain/entities/whatsapp-message.entity';
import {
  IWhatsAppMessageRepository,
  WhatsAppMessageFilter,
  WhatsAppMessageStats,
} from '../../domain/repositories/whatsapp-message.repository.interface';
import {
  WhatsAppMessageMapper,
  SupabaseWhatsAppMessageRow,
  sanitizeUuid,
} from '../mappers/whatsapp-message.mapper';
import { DatabaseError } from '@/src/shared/domain/errors';

export class SupabaseWhatsAppMessageRepository implements IWhatsAppMessageRepository {
  private readonly tableName = 'whatsapp_messages';

  constructor(private readonly client: SupabaseClient) {}

  public async save(message: WhatsAppMessage): Promise<void> {
    const row = WhatsAppMessageMapper.toPersistence(message);
    const { error } = await this.client
      .from(this.tableName)
      .upsert(row, { onConflict: 'id' });

    if (error) {
      throw new DatabaseError(`Error al guardar mensaje de WhatsApp: ${error.message}`, error);
    }
  }

  public async saveBatch(messages: WhatsAppMessage[]): Promise<void> {
    if (!messages.length) return;
    const rows = messages.map(WhatsAppMessageMapper.toPersistence);
    const { error } = await this.client
      .from(this.tableName)
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      throw new DatabaseError(`Error al guardar lote de mensajes de WhatsApp: ${error.message}`, error);
    }
  }

  public async findMessages(filter?: WhatsAppMessageFilter): Promise<WhatsAppMessage[]> {
    let query = this.client
      .from(this.tableName)
      .select('*')
      .order('timestamp', { ascending: false });

    const businessId = sanitizeUuid(filter?.businessId);
    if (businessId) {
      query = query.or(`business_id.eq.${businessId},business_id.is.null`);
    }

    const workerId = sanitizeUuid(filter?.workerId);
    if (workerId) {
      query = query.or(`worker_id.eq.${workerId},worker_id.is.null`);
    }

    if (filter?.senderPhone) {
      query = query.eq('sender_phone', filter.senderPhone);
    }

    const { data, error } = await query;
    if (error) {
      throw new DatabaseError(`Error al consultar mensajes de WhatsApp: ${error.message}`, error);
    }

    let list = ((data as SupabaseWhatsAppMessageRow[]) || []).map(WhatsAppMessageMapper.toDomain);

    if (filter?.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.trim().toLowerCase();
      list = list.filter(
        (m) =>
          m.senderName.toLowerCase().includes(q) ||
          m.senderPhone.includes(q) ||
          m.content.toLowerCase().includes(q)
      );
    }

    return list;
  }

  public async getStats(): Promise<WhatsAppMessageStats> {
    const [countRes, latestRes] = await Promise.all([
      this.client.from(this.tableName).select('*', { count: 'exact', head: true }),
      this.client
        .from(this.tableName)
        .select('timestamp')
        .order('timestamp', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    return {
      totalMessages: countRes.count ?? 0,
      lastReceivedAt: latestRes.data?.timestamp ?? null,
    };
  }

  public async clearAll(): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .neq('id', '___NEVER_MATCH___');

    if (error) {
      throw new DatabaseError(`Error al reiniciar mensajes de WhatsApp en base de datos: ${error.message}`, error);
    }
  }
}
