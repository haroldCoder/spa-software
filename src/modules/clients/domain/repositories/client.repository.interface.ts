import { Client } from '../entities/client.entity';

export interface IClientRepository {
  findById(id: string): Promise<Client | null>;
  findByBusinessId(businessId: string, filter?: { isActive?: boolean }): Promise<Client[]>;
  findByWorkerId(workerId: string, filter?: { isActive?: boolean }): Promise<Client[]>;
  save(client: Client): Promise<Client>;
  update(client: Client): Promise<Client>;
  delete(id: string): Promise<void>;
}
