import { WhatsAppConversation } from '../entities/whatsapp-conversation.entity';
import { WhatsAppMessage } from '../entities/whatsapp-message.entity';

export interface WhatsAppStorageStats {
  totalConversations: number;
  totalMessages: number;
  lastWebhookReceivedAt: string | null;
}

export interface ConversationFilter {
  searchQuery?: string;
  businessId?: string;
  workerId?: string;
}

export interface IWhatsAppStorageRepository {
  findConversations(filter?: ConversationFilter | string): Promise<WhatsAppConversation[]>;
  findConversationById(id: string): Promise<WhatsAppConversation | null>;
  saveConversation(conversation: WhatsAppConversation): Promise<void>;

  findMessagesByConversationId(conversationId: string): Promise<WhatsAppMessage[]>;
  saveMessage(message: WhatsAppMessage): Promise<void>;
  saveMessagesBatch(messages: WhatsAppMessage[]): Promise<void>;

  getStats(): Promise<WhatsAppStorageStats>;
  clearAllData(): Promise<void>;
}
