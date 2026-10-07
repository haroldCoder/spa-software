import { Sale } from '../../domain/entities/sale.entity';
import { SaleItem, SaleItemType } from '../../domain/entities/sale-item.entity';
import { SaleResponseDTO, SaleItemResponseDTO } from '../../application/dtos/sale.dto';

export interface SupabaseSaleItemRow {
  id: string;
  sale_id: string;
  catalog_item_id: string | null;
  item_type: SaleItemType;
  item_name: string;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
  created_at: string;
}

export interface SupabaseSaleRow {
  id: string;
  business_id: string;
  client_id: string;
  worker_id: string | null;
  total_amount: number | string;
  service_amount: number | string;
  product_amount: number | string;
  created_by_id: string | null;
  created_by_role: string | null;
  created_at: string;
  updated_at: string;
  clients?: {
    id: string;
    first_name: string;
    last_name: string;
    phone: string;
    email: string | null;
  } | null;
  workers?: {
    id: string;
    first_name: string;
    last_name: string;
    specialty: string | null;
    phone: string;
  } | null;
  sale_items?: SupabaseSaleItemRow[] | null;
}

export class SaleMapper {
  public static toDomain(row: SupabaseSaleRow): Sale {
    const domainItems: SaleItem[] = [];

    if (row.sale_items && Array.isArray(row.sale_items)) {
      for (const itemRow of row.sale_items) {
        domainItems.push(
          SaleItem.create({
            id: itemRow.id,
            saleId: itemRow.sale_id,
            catalogItemId: itemRow.catalog_item_id,
            itemType: itemRow.item_type,
            itemName: itemRow.item_name,
            quantity: itemRow.quantity,
            unitPrice: Number(itemRow.unit_price),
            subtotal: Number(itemRow.subtotal),
            createdAt: new Date(itemRow.created_at),
          })
        );
      }
    }

    return Sale.create({
      id: row.id,
      businessId: row.business_id,
      clientId: row.client_id,
      workerId: row.worker_id,
      totalAmount: Number(row.total_amount),
      serviceAmount: Number(row.service_amount),
      productAmount: Number(row.product_amount),
      createdById: row.created_by_id,
      createdByRole: row.created_by_role,
      items: domainItems,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  public static toPersistence(sale: Sale): {
    saleRow: Partial<SupabaseSaleRow>;
    itemRows: Partial<SupabaseSaleItemRow>[];
  } {
    const saleRow: Partial<SupabaseSaleRow> = {
      business_id: sale.businessId,
      client_id: sale.clientId,
      worker_id: sale.workerId,
      total_amount: sale.totalAmount,
      service_amount: sale.serviceAmount,
      product_amount: sale.productAmount,
      created_by_id: sale.createdById,
      created_by_role: sale.createdByRole,
    };

    if (sale.id) {
      saleRow.id = sale.id;
    }

    const itemRows: Partial<SupabaseSaleItemRow>[] = sale.items.map((item) => {
      const row: Partial<SupabaseSaleItemRow> = {
        sale_id: sale.id,
        catalog_item_id: item.catalogItemId,
        item_type: item.itemType,
        item_name: item.itemName,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        subtotal: item.subtotal,
      };
      if (item.id) {
        row.id = item.id;
      }
      return row;
    });

    return { saleRow, itemRows };
  }

  public static rowToDTO(row: SupabaseSaleRow): SaleResponseDTO {
    const clientName = row.clients
      ? `${row.clients.first_name} ${row.clients.last_name}`.trim()
      : 'Cliente General';

    const workerName = row.workers
      ? `${row.workers.first_name} ${row.workers.last_name}`.trim()
      : null;

    const itemsDto: SaleItemResponseDTO[] = (row.sale_items || []).map((item) => ({
      id: item.id,
      catalogItemId: item.catalog_item_id,
      itemType: item.item_type,
      itemName: item.item_name,
      quantity: item.quantity,
      unitPrice: Number(item.unit_price),
      subtotal: Number(item.subtotal),
    }));

    let hasService = false;
    let hasProduct = false;
    const summaries: string[] = [];

    for (const item of itemsDto) {
      if (item.itemType === SaleItemType.SERVICE) hasService = true;
      if (item.itemType === SaleItemType.PRODUCT) hasProduct = true;
      summaries.push(`${item.itemName}${item.quantity > 1 ? ` (x${item.quantity})` : ''}`);
    }

    let overallType: 'SERVICE' | 'PRODUCT' | 'MIXED' = 'SERVICE';
    if (hasService && hasProduct) {
      overallType = 'MIXED';
    } else if (hasProduct) {
      overallType = 'PRODUCT';
    }

    const serviceAmount = Number(row.service_amount || 0);
    const productAmount = Number(row.product_amount || 0);
    const totalAmount = Number(row.total_amount || 0);

    return {
      id: row.id,
      businessId: row.business_id,
      clientId: row.client_id,
      clientName,
      client: row.clients
        ? {
            id: row.clients.id,
            firstName: row.clients.first_name,
            lastName: row.clients.last_name,
            phone: row.clients.phone,
            email: row.clients.email,
          }
        : null,
      workerId: row.worker_id,
      workerName,
      worker: row.workers
        ? {
            id: row.workers.id,
            firstName: row.workers.first_name,
            lastName: row.workers.last_name,
            specialty: row.workers.specialty,
            phone: row.workers.phone,
          }
        : null,
      totalAmount,
      serviceValue: serviceAmount, // Campo explícito para el frontend (valor del servicio)
      serviceAmount,
      productAmount,
      itemType: overallType,
      itemsSummary: summaries.join(', ') || 'Sin ítems especificados',
      items: itemsDto,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  public static toDTO(
    sale: Sale,
    joinedData?: {
      client?: SupabaseSaleRow['clients'];
      worker?: SupabaseSaleRow['workers'];
    }
  ): SaleResponseDTO {
    const clientName = joinedData?.client
      ? `${joinedData.client.first_name} ${joinedData.client.last_name}`.trim()
      : 'Cliente General';

    const workerName = joinedData?.worker
      ? `${joinedData.worker.first_name} ${joinedData.worker.last_name}`.trim()
      : null;

    const itemsDto: SaleItemResponseDTO[] = sale.items.map((item) => ({
      id: item.id || '',
      catalogItemId: item.catalogItemId,
      itemType: item.itemType,
      itemName: item.itemName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.subtotal,
    }));

    let hasService = false;
    let hasProduct = false;
    const summaries: string[] = [];

    for (const item of itemsDto) {
      if (item.itemType === SaleItemType.SERVICE) hasService = true;
      if (item.itemType === SaleItemType.PRODUCT) hasProduct = true;
      summaries.push(`${item.itemName}${item.quantity > 1 ? ` (x${item.quantity})` : ''}`);
    }

    let overallType: 'SERVICE' | 'PRODUCT' | 'MIXED' = 'SERVICE';
    if (hasService && hasProduct) {
      overallType = 'MIXED';
    } else if (hasProduct) {
      overallType = 'PRODUCT';
    }

    return {
      id: sale.id || '',
      businessId: sale.businessId,
      clientId: sale.clientId,
      clientName,
      client: joinedData?.client
        ? {
            id: joinedData.client.id,
            firstName: joinedData.client.first_name,
            lastName: joinedData.client.last_name,
            phone: joinedData.client.phone,
            email: joinedData.client.email,
          }
        : null,
      workerId: sale.workerId,
      workerName,
      worker: joinedData?.worker
        ? {
            id: joinedData.worker.id,
            firstName: joinedData.worker.first_name,
            lastName: joinedData.worker.last_name,
            specialty: joinedData.worker.specialty,
            phone: joinedData.worker.phone,
          }
        : null,
      totalAmount: sale.totalAmount,
      serviceValue: sale.serviceAmount,
      serviceAmount: sale.serviceAmount,
      productAmount: sale.productAmount,
      itemType: overallType,
      itemsSummary: summaries.join(', ') || 'Sin ítems especificados',
      items: itemsDto,
      createdAt: sale.createdAt.toISOString(),
      updatedAt: sale.updatedAt.toISOString(),
    };
  }
}
