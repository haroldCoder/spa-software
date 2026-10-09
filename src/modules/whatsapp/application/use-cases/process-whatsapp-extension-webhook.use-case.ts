import { WhatsAppConversation } from '../../domain/entities/whatsapp-conversation.entity';
import {
  WhatsAppMessage,
  MessageDirection,
} from '../../domain/entities/whatsapp-message.entity';
import { IWhatsAppStorageRepository } from '../../domain/repositories/whatsapp-storage.repository.interface';

export interface RawWebhookItem {
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
  from?: string;
  to?: string;

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
  fromMe?: boolean;
  isOutgoing?: boolean;
  direction?: 'INBOUND' | 'OUTBOUND' | 'inbound' | 'outbound' | 'incoming' | 'outgoing';

  // Worker and Business ID identifiers
  workerId?: string;
  worker_id?: string;
  idTrabajadora?: string;
  id_trabajadora?: string;
  trabajadoraId?: string;
  userId?: string;

  businessId?: string;
  business_id?: string;
  idNegocio?: string;
  id_negocio?: string;
  negocioId?: string;

  [key: string]: unknown;
}

export interface WebhookContextIds {
  businessId?: string;
  workerId?: string;
}

export interface WebhookProcessResult {
  success: boolean;
  message: string;
  processedCount: number;
  conversationsUpdated: number;
  businessId?: string;
  workerId?: string;
  details: Array<{
    phone: string;
    name: string;
    messagePreview: string;
    businessId?: string;
    workerId?: string;
  }>;
}

export class ProcessWhatsAppExtensionWebhookUseCase {
  constructor(private readonly repository: IWhatsAppStorageRepository) {}

  async execute(
    payload: unknown,
    contextIds?: WebhookContextIds
  ): Promise<WebhookProcessResult> {
    const { items, rootContext } = this.normalizePayload(payload);

    if (items.length === 0) {
      return {
        success: false,
        message: 'No se encontraron mensajes válidos con nombre, número y contenido en la carga recibida.',
        processedCount: 0,
        conversationsUpdated: 0,
        details: [],
      };
    }

    const effectiveContext: WebhookContextIds = {
      businessId: rootContext.businessId || contextIds?.businessId,
      workerId: rootContext.workerId || contextIds?.workerId,
    };

    const conversationsMap = new Map<string, WhatsAppConversation>();
    const messagesToSave: WhatsAppMessage[] = [];
    const details: WebhookProcessResult['details'] = [];

    for (const raw of items) {
      const extracted = this.extractFields(raw, effectiveContext);
      if (!extracted) continue;

      const { phone, name, content, timestamp, direction, messageId, businessId, workerId } = extracted;

      // 1. Get or create conversation in memory
      let conversation = conversationsMap.get(phone);
      if (!conversation) {
        const existingInRepo = await this.repository.findConversationById(phone);
        if (existingInRepo) {
          conversation = existingInRepo;
        } else {
          conversation = new WhatsAppConversation({
            id: phone,
            customerName: name || phone,
            customerPhone: phone,
            lastMessageText: content,
            lastMessageAt: timestamp,
            unreadCount: direction === 'INBOUND' ? 1 : 0,
            businessId,
            workerId,
          });
        }
        conversationsMap.set(phone, conversation);
      }

      // Update name if we have a better name now
      if (name && name !== phone) {
        conversation.updateCustomerName(name);
      }

      // Update ownership if not already set
      conversation.updateOwnership(businessId, workerId);

      // Update last message if this message is newer
      const msgTime = new Date(timestamp).getTime();
      const currentLastTime = new Date(conversation.lastMessageAt).getTime();
      if (msgTime >= currentLastTime || isNaN(currentLastTime)) {
        conversation.updateLastMessage(content, timestamp, direction === 'INBOUND');
      }

      // 2. Prepare message entity
      const msgEntity = new WhatsAppMessage({
        id: messageId,
        conversationId: phone,
        senderName: direction === 'OUTBOUND' ? 'Spa' : name || phone,
        senderPhone: phone,
        content,
        timestamp,
        direction,
        businessId,
        workerId,
        rawPayload: raw as Record<string, unknown>,
      });

      messagesToSave.push(msgEntity);
      details.push({
        phone,
        name: conversation.customerName,
        messagePreview: content.slice(0, 60),
        businessId,
        workerId,
      });
    }

    // Persist all conversations
    for (const conv of conversationsMap.values()) {
      await this.repository.saveConversation(conv);
    }

    // Persist all messages batch
    await this.repository.saveMessagesBatch(messagesToSave);

    return {
      success: true,
      message: `Se procesaron exitosamente ${messagesToSave.length} mensajes en ${conversationsMap.size} conversaciones.`,
      processedCount: messagesToSave.length,
      conversationsUpdated: conversationsMap.size,
      businessId: effectiveContext.businessId,
      workerId: effectiveContext.workerId,
      details,
    };
  }

  private normalizePayload(payload: unknown): {
    items: RawWebhookItem[];
    rootContext: WebhookContextIds;
  } {
    if (!payload) return { items: [], rootContext: {} };

    if (Array.isArray(payload)) {
      return {
        items: payload.filter((item) => typeof item === 'object' && item !== null),
        rootContext: {},
      };
    }

    if (typeof payload === 'object') {
      const obj = payload as Record<string, unknown>;

      const rootContext: WebhookContextIds = {
        businessId:
          (obj.businessId as string) ||
          (obj.business_id as string) ||
          (obj.idNegocio as string) ||
          (obj.negocioId as string),
        workerId:
          (obj.workerId as string) ||
          (obj.worker_id as string) ||
          (obj.idTrabajadora as string) ||
          (obj.trabajadoraId as string) ||
          (obj.userId as string),
      };

      // Check if messages array is inside
      if (Array.isArray(obj.messages)) {
        const contactName =
          (obj.name as string) ||
          (obj.nombre as string) ||
          (obj.customerName as string) ||
          (obj.contactName as string);
        const contactPhone =
          (obj.phone as string) ||
          (obj.numero as string) ||
          (obj.numeroContacto as string) ||
          (obj.customerPhone as string);

        const mapped = obj.messages.map((m) => {
          if (typeof m === 'object' && m !== null) {
            return {
              ...(contactName ? { name: contactName } : {}),
              ...(contactPhone ? { phone: contactPhone } : {}),
              ...(rootContext.businessId ? { businessId: rootContext.businessId } : {}),
              ...(rootContext.workerId ? { workerId: rootContext.workerId } : {}),
              ...(m as RawWebhookItem),
            };
          }
          return {
            name: contactName,
            phone: contactPhone,
            message: String(m),
            businessId: rootContext.businessId,
            workerId: rootContext.workerId,
          };
        });

        return { items: mapped, rootContext };
      }

      return { items: [obj as RawWebhookItem], rootContext };
    }

    return { items: [], rootContext: {} };
  }

  private extractFields(
    item: RawWebhookItem,
    context?: WebhookContextIds
  ): {
    phone: string;
    name: string;
    content: string;
    timestamp: string;
    direction: MessageDirection;
    messageId: string;
    businessId?: string;
    workerId?: string;
  } | null {
    // 1. Phone number
    const rawPhone =
      item.numeroContacto ||
      item.numero ||
      item.phone ||
      item.phoneNumber ||
      item.customerPhone ||
      item.senderPhone ||
      item.jid ||
      item.chatId ||
      item.from ||
      item.to ||
      '';

    const cleanPhone = String(rawPhone)
      .replace(/@s\.whatsapp\.net|@c\.us|@g\.us/g, '')
      .replace(/\D/g, '');

    if (!cleanPhone || cleanPhone.length < 5) {
      return null;
    }

    // 2. Message Content (mensaje completo)
    const rawContent =
      item.mensajeCompleto ||
      item.mensaje ||
      item.message ||
      item.text ||
      item.body ||
      item.content ||
      item.texto ||
      '';

    const content = String(rawContent).trim();
    if (!content) {
      return null;
    }

    // 3. Name (nombre)
    const rawName =
      item.nombre ||
      item.name ||
      item.customerName ||
      item.contactName ||
      item.senderName ||
      item.pushname ||
      cleanPhone;

    const name = String(rawName).trim() || cleanPhone;

    // 4. Direction
    let direction: MessageDirection = 'INBOUND';
    if (item.fromMe === true || item.isOutgoing === true) {
      direction = 'OUTBOUND';
    } else if (item.direction) {
      const dirLower = String(item.direction).toLowerCase();
      if (dirLower === 'outbound' || dirLower === 'outgoing') {
        direction = 'OUTBOUND';
      }
    }

    // 5. Timestamp
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

    // 6. Message ID
    const rawId = item.id || item.messageId;
    let messageId: string;
    if (rawId && String(rawId).trim()) {
      messageId = String(rawId).trim();
    } else {
      const timeSec = Math.floor(new Date(timestamp).getTime() / 1000);
      const snippet = content.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '');
      messageId = `msg_${cleanPhone}_${timeSec}_${snippet || Math.random().toString(36).slice(2, 7)}`;
    }

    // 7. WorkerId & BusinessId
    const workerId =
      item.workerId ||
      item.worker_id ||
      item.idTrabajadora ||
      item.id_trabajadora ||
      item.trabajadoraId ||
      item.userId ||
      context?.workerId;

    const businessId =
      item.businessId ||
      item.business_id ||
      item.idNegocio ||
      item.id_negocio ||
      item.negocioId ||
      context?.businessId;

    return {
      phone: cleanPhone,
      name,
      content,
      timestamp,
      direction,
      messageId,
      workerId: workerId ? String(workerId).trim() : undefined,
      businessId: businessId ? String(businessId).trim() : undefined,
    };
  }
}
