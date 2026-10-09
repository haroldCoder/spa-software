import { WhatsAppMessageProps } from '../../domain/entities/whatsapp-message.entity';
import { IWhatsAppStorageRepository } from '../../domain/repositories/whatsapp-storage.repository.interface';

export class GetLocalConversationMessagesUseCase {
  constructor(private readonly repository: IWhatsAppStorageRepository) {}

  async execute(conversationId: string): Promise<WhatsAppMessageProps[]> {
    const cleanId = conversationId.replace(/\D/g, '');
    const messages = await this.repository.findMessagesByConversationId(cleanId);

    // Also mark conversation unread count as read
    const conversation = await this.repository.findConversationById(cleanId);
    if (conversation && conversation.unreadCount > 0) {
      conversation.resetUnreadCount();
      await this.repository.saveConversation(conversation);
    }

    return messages.map((m) => m.toJSON());
  }
}
