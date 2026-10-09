import { IWhatsAppStorageRepository } from '../../domain/repositories/whatsapp-storage.repository.interface';

export class ClearLocalWhatsAppUseCase {
  constructor(private readonly repository: IWhatsAppStorageRepository) {}

  async execute(): Promise<void> {
    await this.repository.clearAllData();
  }
}
