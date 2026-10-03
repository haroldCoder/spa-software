import { SupabaseClient } from '@supabase/supabase-js';
import { ICatalogRepository, CatalogFilter } from '../../domain/repositories/catalog.repository.interface';
import { CatalogItem } from '../../domain/entities/catalog-item.entity';
import { CatalogItemMapper, SupabaseCatalogItemRow } from '../mappers/catalog-item.mapper';
import { DatabaseError } from '@/src/shared/domain/errors';

export class SupabaseCatalogRepository implements ICatalogRepository {
  private readonly tableName = 'catalog_items';

  constructor(private readonly client: SupabaseClient) {}

  public async findById(id: string): Promise<CatalogItem | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new DatabaseError(`Error al consultar elemento del catálogo con id ${id}: ${error.message}`, error);
    }

    if (!data) return null;
    return CatalogItemMapper.toDomain(data as SupabaseCatalogItemRow);
  }

  public async findByBusinessId(businessId: string, filter?: CatalogFilter): Promise<CatalogItem[]> {
    let query = this.client
      .from(this.tableName)
      .select('*')
      .eq('business_id', businessId)
      .order('name', { ascending: true });

    if (filter?.itemType) {
      query = query.eq('item_type', filter.itemType);
    }

    if (filter?.category) {
      query = query.eq('category', filter.category);
    }

    if (filter?.isActive !== undefined) {
      query = query.eq('is_active', filter.isActive);
    }

    const { data, error } = await query;
    if (error) {
      throw new DatabaseError(`Error al consultar catálogo del negocio ${businessId}: ${error.message}`, error);
    }

    return (data as SupabaseCatalogItemRow[]).map(CatalogItemMapper.toDomain);
  }

  public async save(item: CatalogItem): Promise<CatalogItem> {
    const row = CatalogItemMapper.toPersistence(item);
    const { data, error } = await this.client
      .from(this.tableName)
      .insert(row)
      .select('*')
      .single();

    if (error) {
      throw new DatabaseError(`Error al guardar elemento en el catálogo: ${error.message}`, error);
    }

    return CatalogItemMapper.toDomain(data as SupabaseCatalogItemRow);
  }

  public async update(item: CatalogItem): Promise<CatalogItem> {
    if (!item.id) {
      throw new DatabaseError('No se puede actualizar un artículo del catálogo sin identificador.');
    }

    const row = CatalogItemMapper.toPersistence(item);
    const { data, error } = await this.client
      .from(this.tableName)
      .update(row)
      .eq('id', item.id)
      .select('*')
      .single();

    if (error) {
      throw new DatabaseError(`Error al actualizar elemento del catálogo: ${error.message}`, error);
    }

    return CatalogItemMapper.toDomain(data as SupabaseCatalogItemRow);
  }

  public async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id);

    if (error) {
      throw new DatabaseError(`Error al eliminar elemento del catálogo: ${error.message}`, error);
    }
  }
}
