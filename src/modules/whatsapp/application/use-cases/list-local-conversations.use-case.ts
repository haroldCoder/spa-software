import { WhatsAppConversationProps } from '../../domain/entities/whatsapp-conversation.entity';
import {
  IWhatsAppStorageRepository,
  ConversationFilter,
} from '../../domain/repositories/whatsapp-storage.repository.interface';

export class ListLocalConversationsUseCase {
  constructor(private readonly repository: IWhatsAppStorageRepository) {}

  async execute(filter?: ConversationFilter | string): Promise<WhatsAppConversationProps[]> {
    const list = await this.repository.findConversations(filter);
    return list.map((c) => c.toJSON());
  }
}
