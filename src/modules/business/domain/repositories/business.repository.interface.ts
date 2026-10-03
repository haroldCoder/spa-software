import { Business } from '../entities/business.entity';

export interface IBusinessRepository {
  findById(id: string): Promise<Business | null>;
  findByEmail(email: string): Promise<Business | null>;
  findAll(filter?: { isActive?: boolean }): Promise<Business[]>;
  save(business: Business): Promise<Business>;
  update(business: Business): Promise<Business>;
  delete(id: string): Promise<void>;
}
