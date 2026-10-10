import { WhatsAppMessage } from '../../domain/entities/whatsapp-message.entity';
import { IWhatsAppMessageRepository } from '../../domain/repositories/whatsapp-message.repository.interface';

export interface RawWebhookPayloadItem {
  nombre?: string;
  name?: string;
  customerName?: string;
  contactName?: string;
  senderName?: string;
  pushname?: string;

  numero?: string;
  numeroContacto?: string;
  phone?: string;
  phoneNumber?: string;
  customerPhone?: string;
  senderPhone?: string;
  jid?: string;
  chatId?: string;

  mensaje?: string;
  mensajeCompleto?: string;
  message?: string;
  text?: string;
  body?: string;
  content?: string;
  texto?: string;

  id?: string;
  messageId?: string;
  timestamp?: string | number;
  time?: string | number;
  date?: string | number;
  fecha?: string | number;

  workerId?: string;
  worker_id?: string;
  businessId?: string;
  business_id?: string;

  [key: string]: unknown;
}

export interface WebhookContext {
  businessId?: string;
  workerId?: string;
}

export interface SaveMessagesResult {
  success: boolean;
  message: string;
  savedCount: number;
  businessId?: string;
  workerId?: string;
  savedMessages: Array<{
    id: string;
    senderName: string;
    senderPhone: string;
    preview: string;
  }>;
}

export class SaveWhatsAppMessagesUseCase {
  constructor(private readonly repository: IWhatsAppMessageRepository) {}

  public async execute(
    payload: unknown,
    context?: WebhookContext
  ): Promise<SaveMessagesResult> {
    const { items, rootContext } = this.normalize(payload);

    if (items.length === 0) {
      return {
        success: false,
        message: 'No se encontraron mensajes válidos en la carga recibida.',
        savedCount: 0,
        savedMessages: [],
      };
    }

    const effectiveBusinessId = rootContext.businessId || context?.businessId;
    const effectiveWorkerId = rootContext.workerId || context?.workerId;

    const entities: WhatsAppMessage[] = [];
    const details: SaveMessagesResult['savedMessages'] = [];

    for (const item of items) {
      const extracted = this.extract(item, {
        businessId: effectiveBusinessId,
        workerId: effectiveWorkerId,
      });

      if (!extracted) continue;

      const entity = new WhatsAppMessage(extracted);
      entities.push(entity);
      details.push({
        id: entity.id,
        senderName: entity.senderName,
        senderPhone: entity.senderPhone,
        preview: entity.content.slice(0, 60),
      });
    }

    if (entities.length === 0) {
      return {
        success: false,
        message: 'No se pudo procesar ningún mensaje con texto válido.',
        savedCount: 0,
        savedMessages: [],
      };
    }

    await this.repository.saveBatch(entities);

    return {
      success: true,
      message: `Se registraron exitosamente ${entities.length} mensaje(s).`,
      savedCount: entities.length,
      businessId: effectiveBusinessId,
      workerId: effectiveWorkerId,
      savedMessages: details,
    };
  }

  private normalize(payload: unknown): {
    items: RawWebhookPayloadItem[];
    rootContext: WebhookContext;
  } {
    if (!payload) return { items: [], rootContext: {} };

    if (Array.isArray(payload)) {
      return { items: payload as RawWebhookPayloadItem[], rootContext: {} };
    }

    if (typeof payload === 'object') {
      const obj = payload as Record<string, unknown>;
      const rootContext: WebhookContext = {
        businessId: (obj.businessId || obj.business_id) as string | undefined,
        workerId: (obj.workerId || obj.worker_id) as string | undefined,
      };

      if (Array.isArray(obj.messages)) {
        return { items: obj.messages as RawWebhookPayloadItem[], rootContext };
      }

      return { items: [obj as RawWebhookPayloadItem], rootContext };
    }

    return { items: [], rootContext: {} };
  }

  private extract(
    item: RawWebhookPayloadItem,
    context: WebhookContext
  ): {
    id: string;
    senderName: string;
    senderPhone: string;
    content: string;
    timestamp: string;
    businessId?: string;
    workerId?: string;
  } | null {
    const rawContent =
      item.mensajeCompleto ||
      item.mensaje ||
      item.message ||
      item.text ||
      item.body ||
      item.content ||
      item.texto;

    const content = String(rawContent || '').trim();
    if (!content) return null;

    let senderName = String(
      item.nombre ||
        item.name ||
        item.customerName ||
        item.contactName ||
        item.senderName ||
        item.pushname ||
        ''
    ).trim();

    const rawPhone = String(
      item.numeroContacto ||
        item.numero ||
        item.phone ||
        item.phoneNumber ||
        item.customerPhone ||
        item.senderPhone ||
        item.jid ||
        item.chatId ||
        ''
    )
      .replace(/@s\.whatsapp\.net|@c\.us|@g\.us/g, '')
      .trim();

    const digitsOnly = rawPhone.replace(/\D/g, '');
    let senderPhone = digitsOnly;

    if (!senderPhone || senderPhone.length < 5) {
      if (rawPhone && rawPhone.length >= 3) {
        senderPhone = rawPhone.replace(/[^a-zA-Z0-9_-]/g, '_');
      } else if (senderName) {
        const slug = senderName.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30);
        senderPhone = `chat_${slug || Date.now()}`;
      } else {
        senderPhone = `chat_${Date.now()}`;
      }
    }

    if (!senderName) {
      senderName = senderPhone.startsWith('chat_') ? 'Contacto WhatsApp' : `+${senderPhone}`;
    }

    let timestamp = new Date().toISOString();
    const rawTime = item.timestamp || item.time || item.date || item.fecha;
    if (rawTime) {
      if (typeof rawTime === 'number') {
        const ms = rawTime < 1e11 ? rawTime * 1000 : rawTime;
        const d = new Date(ms);
        if (!isNaN(d.getTime())) timestamp = d.toISOString();
      } else if (typeof rawTime === 'string') {
        const d = new Date(rawTime);
        if (!isNaN(d.getTime())) timestamp = d.toISOString();
      }
    }

    const rawId = item.id || item.messageId;
    let id: string;
    if (rawId && String(rawId).trim()) {
      id = String(rawId).trim();
    } else {
      const timeMs = new Date(timestamp).getTime() || Date.now();
      const rand = Math.random().toString(36).slice(2, 9);
      id = `msg_${senderPhone}_${timeMs}_${rand}`;
    }

    return {
      id,
      senderName,
      senderPhone,
      content,
      timestamp,
      businessId: (item.businessId || item.business_id || context.businessId) as string | undefined,
      workerId: (item.workerId || item.worker_id || context.workerId) as string | undefined,
    };
  }
}
