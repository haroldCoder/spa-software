import { Worker } from '../entities/worker.entity';

export interface IWorkerRepository {
  findById(id: string): Promise<Worker | null>;
  findByEmail(email: string): Promise<Worker | null>;
  findByBusinessId(businessId: string, filter?: { isActive?: boolean }): Promise<Worker[]>;
  save(worker: Worker): Promise<Worker>;
  update(worker: Worker): Promise<Worker>;
  delete(id: string): Promise<void>;
}

