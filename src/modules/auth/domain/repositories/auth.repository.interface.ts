import { Business } from '@/src/modules/business/domain/entities/business.entity';
import { Worker } from '@/src/modules/workers/domain/entities/worker.entity';

export interface IAuthRepository {
  findBusinessByEmail(email: string): Promise<{ business: Business; passwordHash: string | null } | null>;
  findWorkerByEmail(email: string): Promise<{ worker: Worker; passwordHash: string | null } | null>;
}
