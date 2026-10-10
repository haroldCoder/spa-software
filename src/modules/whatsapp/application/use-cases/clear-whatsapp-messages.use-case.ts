import { IWhatsAppMessageRepository } from '../../domain/repositories/whatsapp-message.repository.interface';

export class ClearWhatsAppMessagesUseCase {
  constructor(private readonly repository: IWhatsAppMessageRepository) {}

  public async execute(): Promise<void> {
    await this.repository.clearAll();
  }
}
