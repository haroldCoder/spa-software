import { WhatsAppConversation } from '../../domain/entities/whatsapp-conversation.entity';
import {
  WhatsAppMessage,
  WhatsAppMessageProps,
} from '../../domain/entities/whatsapp-message.entity';
import { IWhatsAppStorageRepository } from '../../domain/repositories/whatsapp-storage.repository.interface';

export interface SendLocalReplyInput {
  conversationId: string;
  content: string;
  senderName?: string;
}

export class SendLocalReplyUseCase {
  constructor(private readonly repository: IWhatsAppStorageRepository) {}

  async execute(input: SendLocalReplyInput): Promise<WhatsAppMessageProps> {
    const cleanId = input.conversationId.replace(/\D/g, '');
    const now = new Date().toISOString();

    let conversation = await this.repository.findConversationById(cleanId);
    if (!conversation) {
      conversation = new WhatsAppConversation({
        id: cleanId,
        customerName: cleanId,
        customerPhone: cleanId,
        lastMessageText: input.content,
        lastMessageAt: now,
        unreadCount: 0,
      });
    } else {
      conversation.updateLastMessage(input.content, now, false);
    }
    await this.repository.saveConversation(conversation);

    const message = new WhatsAppMessage({
      id: `out_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      conversationId: cleanId,
      senderName: input.senderName || 'AuraSpa',
      senderPhone: cleanId,
      content: input.content,
      timestamp: now,
      direction: 'OUTBOUND',
      status: 'SENT',
    });

    await this.repository.saveMessage(message);
    return message.toJSON();
  }
}
