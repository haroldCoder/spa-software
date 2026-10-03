import { CatalogItem, CatalogItemType } from '../entities/catalog-item.entity';

export interface CatalogFilter {
  itemType?: CatalogItemType;
  category?: string;
  isActive?: boolean;
}

export interface ICatalogRepository {
  findById(id: string): Promise<CatalogItem | null>;
  findByBusinessId(businessId: string, filter?: CatalogFilter): Promise<CatalogItem[]>;
  save(item: CatalogItem): Promise<CatalogItem>;
  update(item: CatalogItem): Promise<CatalogItem>;
  delete(id: string): Promise<void>;
}
