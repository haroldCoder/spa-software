import {
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppStats,
  WhatsAppFilterCriteria,
  SendMessagePayload,
} from '../domain/whatsapp.types';

export interface IWhatsAppApi {
  getConversations(filter?: WhatsAppFilterCriteria): Promise<WhatsAppConversation[]>;
  getMessages(conversationId: string): Promise<WhatsAppMessage[]>;
  sendMessage(payload: SendMessagePayload): Promise<WhatsAppMessage>;
  getStats(): Promise<WhatsAppStats | null>;
  clearData(): Promise<boolean>;
}
