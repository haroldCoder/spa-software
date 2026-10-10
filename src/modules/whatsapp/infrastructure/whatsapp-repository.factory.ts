import { IWhatsAppMessageRepository } from '../domain/repositories/whatsapp-message.repository.interface';
import { SupabaseWhatsAppMessageRepository } from './repositories/supabase-whatsapp-message.repository';
import { localWhatsAppMessageRepository } from './repositories/local-file-whatsapp-message.repository';
import { getSupabaseServerClient } from '@/src/shared/infrastructure/supabase/client';

let cachedRepository: IWhatsAppMessageRepository | null = null;

export function getWhatsAppMessageRepository(): IWhatsAppMessageRepository {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseKey) {
    if (!cachedRepository) {
      try {
        const client = getSupabaseServerClient();
        cachedRepository = new SupabaseWhatsAppMessageRepository(client);
      } catch (err) {
        console.warn('[WhatsAppRepositoryFactory] Error initializing Supabase, using local fallback:', err);
        return localWhatsAppMessageRepository;
      }
    }
    return cachedRepository;
  }

  return localWhatsAppMessageRepository;
}
