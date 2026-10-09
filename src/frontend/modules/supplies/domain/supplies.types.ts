export enum SupplyItemType {
  CONSUMABLE = 'CONSUMABLE',
  DISPOSABLE = 'DISPOSABLE',
  TOOL_UTILITY = 'TOOL_UTILITY',
  CLEANING_HYGIENE = 'CLEANING_HYGIENE',
}

export enum SupplyUnitMeasure {
  UNIT = 'UNIT',
  ML = 'ML',
  L = 'L',
  GR = 'GR',
  KG = 'KG',
  PACK = 'PACK',
  BOX = 'BOX',
  ROLL = 'ROLL',
}

export enum SupplyMovementType {
  PURCHASE = 'PURCHASE',
  CONSUMPTION = 'CONSUMPTION',
  WASTE = 'WASTE',
  ADJUSTMENT = 'ADJUSTMENT',
}

export interface SupplyItem {
  id: string;
  businessId: string;
  name: string;
  description: string | null;
  itemType: SupplyItemType;
  category: string | null;
  unitMeasure: SupplyUnitMeasure;
  currentStock: number;
  minStockAlert: number;
  costPerUnit: number;
  totalStockValue: number;
  isLowStock: boolean;
  sku: string | null;
  supplierName: string | null;
  supplierContact: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SuppliesSummary {
  totalSuppliesCount: number;
  activeSuppliesCount: number;
  lowStockCount: number;
  totalInventoryCost: number;
  monthlyPurchasesCost: number;
  monthlyConsumptionsCost: number;
}

export interface PaginatedSuppliesResponse {
  items: SupplyItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SupplyFilter {
  page?: number;
  limit?: number;
  itemType?: SupplyItemType | 'ALL';
  category?: string;
  lowStockOnly?: boolean;
  isActive?: boolean;
  search?: string;
}

export interface CreateSupplyPayload {
  businessId: string;
  name: string;
  description?: string | null;
  itemType: SupplyItemType;
  category?: string | null;
  unitMeasure: SupplyUnitMeasure;
  currentStock: number;
  minStockAlert: number;
  costPerUnit: number;
  sku?: string | null;
  supplierName?: string | null;
  supplierContact?: string | null;
}

export interface UpdateSupplyPayload {
  name?: string;
  description?: string | null;
  itemType?: SupplyItemType;
  category?: string | null;
  unitMeasure?: SupplyUnitMeasure;
  minStockAlert?: number;
  costPerUnit?: number;
  sku?: string | null;
  supplierName?: string | null;
  supplierContact?: string | null;
  isActive?: boolean;
}

export interface RegisterMovementPayload {
  businessId: string;
  supplyId: string;
  movementType: SupplyMovementType;
  quantity: number;
  unitCost: number;
  reason?: string | null;
  invoiceNumber?: string | null;
  workerId?: string | null;
}