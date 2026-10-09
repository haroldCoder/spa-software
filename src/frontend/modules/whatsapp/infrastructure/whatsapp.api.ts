import { IWhatsAppApi } from './whatsapp.api.interface';
import {
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppStats,
  WhatsAppFilterCriteria,
  SendMessagePayload,
} from '../domain/whatsapp.types';
import { WHATSAPP_API_ENDPOINTS } from '../domain/whatsapp.constants';

export class WhatsAppApi implements IWhatsAppApi {
  async getConversations(filter?: WhatsAppFilterCriteria): Promise<WhatsAppConversation[]> {
    const params = new URLSearchParams();
    if (filter?.searchQuery) params.set('search', filter.searchQuery);
    if (filter?.businessId) params.set('businessId', filter.businessId);
    if (filter?.workerId) params.set('workerId', filter.workerId);

    const qs = params.toString();
    const url = qs ? `${WHATSAPP_API_ENDPOINTS.CONVERSATIONS}?${qs}` : WHATSAPP_API_ENDPOINTS.CONVERSATIONS;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: Failed to fetch WhatsApp conversations`);
    }

    const data = await res.json();
    return data.conversations || [];
  }

  async getMessages(conversationId: string): Promise<WhatsAppMessage[]> {
    const url = WHATSAPP_API_ENDPOINTS.CONVERSATION_MESSAGES(conversationId);
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Error ${res.status}: Failed to fetch messages for conversation ${conversationId}`);
    }

    const data = await res.json();
    return data.messages || [];
  }

  async sendMessage(payload: SendMessagePayload): Promise<WhatsAppMessage> {
    const url = WHATSAPP_API_ENDPOINTS.CONVERSATION_MESSAGES(payload.conversationId);
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: payload.content,
        senderName: payload.senderName || 'AuraSpa',
        businessId: payload.businessId,
        workerId: payload.workerId,
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `Error ${res.status}: Failed to send message`);
    }

    const data = await res.json();
    return data.message;
  }

  async getStats(): Promise<WhatsAppStats | null> {
    const res = await fetch(WHATSAPP_API_ENDPOINTS.WEBHOOK);
    if (!res.ok) return null;

    const data = await res.json();
    return data.stats || null;
  }

  async clearData(): Promise<boolean> {
    const res = await fetch(WHATSAPP_API_ENDPOINTS.WEBHOOK, { method: 'DELETE' });
    return res.ok;
  }
}

// Singleton instance for default dependency injection
export const whatsAppApi = new WhatsAppApi();
