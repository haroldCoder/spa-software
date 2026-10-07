export type SaleItemType = 'SERVICE' | 'PRODUCT';

export interface SaleItemDetail {
  id: string;
  catalogItemId?: string | null;
  itemType: SaleItemType;
  itemName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface SaleClientInfo {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
}

export interface SaleWorkerInfo {
  id: string;
  firstName: string;
  lastName: string;
  specialty?: string | null;
  phone?: string | null;
}

export interface SaleItem {
  id: string;
  businessId: string;
  clientId: string;
  clientName: string;
  client?: SaleClientInfo | null;
  workerId?: string | null;
  workerName?: string | null;
  worker?: SaleWorkerInfo | null;
  totalAmount: number;
  serviceValue: number;
  serviceAmount: number;
  productAmount: number;
  itemType: 'SERVICE' | 'PRODUCT' | 'MIXED';
  itemsSummary: string;
  items: SaleItemDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedSalesResponse {
  items: SaleItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface SaleFilter {
  page?: number;
  limit?: number;
  itemType?: 'SERVICE' | 'PRODUCT' | 'ALL';
  clientId?: string;
  workerId?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateSaleItemPayload {
  catalogItemId?: string | null;
  itemType: SaleItemType;
  itemName: string;
  quantity: number;
  unitPrice: number;
}

export interface CreateSalePayload {
  businessId: string;
  clientId: string;
  workerId?: string | null;
  catalogItemId?: string | null;
  itemType?: SaleItemType;
  itemName?: string;
  quantity?: number;
  unitPrice?: number;
  items?: CreateSaleItemPayload[];
}
