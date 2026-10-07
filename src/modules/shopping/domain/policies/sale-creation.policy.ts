import { BadRequestError, ForbiddenError } from '@/src/shared/domain/errors';
import { CatalogItem } from '@/src/modules/catalog/domain/entities/catalog-item.entity';
import { SaleItemType } from '../entities/sale-item.entity';

export class SaleCreationPolicy {
  public static validateClientBelongsToBusiness(clientBusinessId: string, businessId: string): void {
    if (clientBusinessId !== businessId) {
      throw new ForbiddenError('El cliente seleccionado no pertenece a este negocio o spa.');
    }
  }

  public static validateWorkerBelongsToBusiness(workerBusinessId: string, businessId: string): void {
    if (workerBusinessId !== businessId) {
      throw new ForbiddenError('La trabajadora o especialista asignada no pertenece a este negocio o spa.');
    }
  }

  public static validateCatalogItemBelongsToBusiness(
    itemBusinessId: string,
    businessId: string,
    itemName?: string
  ): void {
    if (itemBusinessId !== businessId) {
      throw new ForbiddenError(
        `El artículo '${itemName || 'solicitado'}' no pertenece al catálogo de este negocio o spa.`
      );
    }
  }

  public static validateStockAvailability(item: CatalogItem, requestedQuantity: number): void {
    if (item.itemType === SaleItemType.PRODUCT && item.stockQuantity !== null && item.stockQuantity !== undefined) {
      if (item.stockQuantity < requestedQuantity) {
        throw new BadRequestError(
          `Stock insuficiente para '${item.name}'. Disponible: ${item.stockQuantity}, solicitado: ${requestedQuantity}.`
        );
      }
    }
  }
}
