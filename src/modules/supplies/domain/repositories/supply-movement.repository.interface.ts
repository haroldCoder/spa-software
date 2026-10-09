import { SupplyMovement, SupplyMovementType } from '../entities/supply-movement.entity';
import { PaginatedResult } from '@/src/shared/domain/pagination';

export interface SupplyMovementFilter {
  supplyId?: string;
  movementType?: SupplyMovementType;
  workerId?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface ISupplyMovementRepository {
  save(movement: SupplyMovement): Promise<SupplyMovement>;
  findBySupplyId(supplyId: string, filter?: SupplyMovementFilter): Promise<PaginatedResult<SupplyMovement>>;
  findByBusinessId(businessId: string, filter?: SupplyMovementFilter): Promise<PaginatedResult<SupplyMovement>>;
}
