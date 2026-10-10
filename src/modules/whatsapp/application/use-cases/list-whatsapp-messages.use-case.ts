import { WhatsAppMessageProps } from '../../domain/entities/whatsapp-message.entity';
import {
  IWhatsAppMessageRepository,
  WhatsAppMessageFilter,
} from '../../domain/repositories/whatsapp-message.repository.interface';

export interface GroupedWhatsAppConversation {
  id: string; // senderPhone / contact identifier
  customerName: string;
  customerPhone: string;
  lastMessageText: string;
  lastMessageAt: string;
  messageCount: number;
  businessId?: string;
  workerId?: string;
  messages: WhatsAppMessageProps[];
}

export interface ListWhatsAppMessagesResult {
  messages: WhatsAppMessageProps[];
  conversations: GroupedWhatsAppConversation[];
  totalMessages: number;
  totalConversations: number;
}

export class ListWhatsAppMessagesUseCase {
  constructor(private readonly repository: IWhatsAppMessageRepository) {}

  public async execute(filter?: WhatsAppMessageFilter): Promise<ListWhatsAppMessagesResult> {
    const messages = await this.repository.findMessages(filter);
    const messagePropsList = messages.map((m) => m.toJSON());

    // Group messages by contact phone into conversations
    const conversationMap = new Map<string, GroupedWhatsAppConversation>();

    for (const msg of messagePropsList) {
      const phone = msg.senderPhone;
      const existing = conversationMap.get(phone);

      if (!existing) {
        conversationMap.set(phone, {
          id: phone,
          customerName: msg.senderName || phone,
          customerPhone: phone,
          lastMessageText: msg.content,
          lastMessageAt: msg.timestamp,
          messageCount: 1,
          businessId: msg.businessId,
          workerId: msg.workerId,
          messages: [msg],
        });
      } else {
        existing.messages.push(msg);
        existing.messageCount += 1;

        if (new Date(msg.timestamp).getTime() > new Date(existing.lastMessageAt).getTime()) {
          existing.lastMessageText = msg.content;
          existing.lastMessageAt = msg.timestamp;
        }

        if (
          msg.senderName &&
          (existing.customerName === phone || existing.customerName === 'Contacto')
        ) {
          existing.customerName = msg.senderName;
        }
      }
    }

    // Sort messages in each conversation chronologically ascending (oldest to newest)
    for (const conv of conversationMap.values()) {
      conv.messages.sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    }

    // Sort conversations descending by latest message
    const conversations = Array.from(conversationMap.values()).sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    );

    return {
      messages: messagePropsList,
      conversations,
      totalMessages: messagePropsList.length,
      totalConversations: conversations.length,
    };
  }
}
