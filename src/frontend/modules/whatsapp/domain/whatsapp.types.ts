/**
 * WhatsApp Module Domain Types & Interfaces
 * Following DDD & SOLID (Interface Segregation Principle)
 */

export interface WhatsAppConversation {
  id: string;
  customerName: string;
  customerPhone: string;
  lastMessageText: string;
  lastMessageAt: string;
  unreadCount: number;
  businessId?: string;
  workerId?: string;
  createdAt: string;
  updatedAt: string;
  messages?: WhatsAppMessage[];
}

export type WhatsAppMessageDirection = 'INBOUND' | 'OUTBOUND';
export type WhatsAppMessageStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface WhatsAppMessage {
  id: string;
  conversationId: string;
  senderName: string;
  senderPhone: string;
  content: string;
  timestamp: string;
  direction: WhatsAppMessageDirection;
  status: WhatsAppMessageStatus;
  businessId?: string;
  workerId?: string;
  rawPayload?: Record<string, unknown>;
}

export interface WhatsAppStats {
  totalConversations: number;
  totalMessages: number;
  lastWebhookReceivedAt: string | null;
}

export interface WhatsAppFilterCriteria {
  searchQuery?: string;
  businessId?: string;
  workerId?: string;
}

export interface SendMessagePayload {
  conversationId: string;
  content: string;
  senderName?: string;
  businessId?: string;
  workerId?: string;
}

export interface QuickMessageTemplate {
  id: string;
  label: string;
  icon?: string;
  text: (customerName: string) => string;
}

// Backward-compatibility aliases
export type WhatsAppConversationDTO = WhatsAppConversation;
export type WhatsAppMessageDTO = WhatsAppMessage;
export type WhatsAppStatsDTO = WhatsAppStats;
