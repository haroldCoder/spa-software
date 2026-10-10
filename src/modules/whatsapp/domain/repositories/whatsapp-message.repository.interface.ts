import { WhatsAppMessage } from '../entities/whatsapp-message.entity';

export interface WhatsAppMessageFilter {
  businessId?: string;
  workerId?: string;
  senderPhone?: string;
  searchQuery?: string;
}

export interface WhatsAppMessageStats {
  totalMessages: number;
  lastReceivedAt: string | null;
}

export interface IWhatsAppMessageRepository {
  save(message: WhatsAppMessage): Promise<void>;
  saveBatch(messages: WhatsAppMessage[]): Promise<void>;
  findMessages(filter?: WhatsAppMessageFilter): Promise<WhatsAppMessage[]>;
  getStats(): Promise<WhatsAppMessageStats>;
  clearAll(): Promise<void>;
}
