import { Sale } from '../entities/sale.entity';
import { PaginatedResult } from '@/src/shared/domain/pagination';

export interface SaleFilter {
  itemType?: 'SERVICE' | 'PRODUCT';
  clientId?: string;
  workerId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export type PaginatedSales = PaginatedResult<Sale>;

export interface ISaleRepository {
  findById(id: string): Promise<Sale | null>;
  findByBusinessId(businessId: string, filter?: SaleFilter): Promise<PaginatedSales>;
  findByClientId(clientId: string, filter?: SaleFilter): Promise<PaginatedSales>;
  findByWorkerId(workerId: string, filter?: SaleFilter): Promise<PaginatedSales>;
  findCompletedServices(businessId: string): Promise<Sale[]>;
  save(sale: Sale): Promise<Sale>;
}
