import { Supply, SupplyItemType } from '../entities/supply.entity';
import { PaginatedResult } from '@/src/shared/domain/pagination';

export interface SupplyFilter {
  itemType?: SupplyItemType;
  category?: string;
  lowStockOnly?: boolean;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SupplySummaryData {
  totalSuppliesCount: number;
  activeSuppliesCount: number;
  lowStockCount: number;
  totalInventoryCost: number;
  monthlyPurchasesCost: number;
  monthlyConsumptionsCost: number;
}

export interface ISupplyRepository {
  findById(id: string): Promise<Supply | null>;
  findByBusinessId(businessId: string, filter?: SupplyFilter): Promise<PaginatedResult<Supply>>;
  findLowStockByBusiness(businessId: string): Promise<Supply[]>;
  getSummaryByBusiness(businessId: string): Promise<SupplySummaryData>;
  save(supply: Supply): Promise<Supply>;
  update(supply: Supply): Promise<Supply>;
  delete(id: string): Promise<void>;
}
