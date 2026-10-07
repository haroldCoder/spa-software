import { Result } from '@/src/shared/domain/result';
import { NotFoundError, DomainError, DatabaseError, BadRequestError } from '@/src/shared/domain/errors';
import { ISaleRepository } from '../../domain/repositories/sale.repository.interface';
import { IBusinessRepository } from '@/src/modules/business/domain/repositories/business.repository.interface';
import { IClientRepository } from '@/src/modules/clients/domain/repositories/client.repository.interface';
import { IWorkerRepository } from '@/src/modules/workers/domain/repositories/worker.repository.interface';
import { ICatalogRepository } from '@/src/modules/catalog/domain/repositories/catalog.repository.interface';
import { Sale } from '../../domain/entities/sale.entity';
import { SaleItem, SaleItemType } from '../../domain/entities/sale-item.entity';
import { SaleCreationPolicy } from '../../domain/policies/sale-creation.policy';
import { CreateSaleDTO, CreateSaleItemDTO } from '../dtos/sale.dto';

export interface CreateSaleActor {
  id: string;
  role: 'BUSINESS_OWNER' | 'WORKER';
}

export class CreateSaleUseCase {
  constructor(
    private readonly saleRepository: ISaleRepository,
    private readonly businessRepository: IBusinessRepository,
    private readonly clientRepository: IClientRepository,
    private readonly workerRepository: IWorkerRepository,
    private readonly catalogRepository: ICatalogRepository
  ) {}

  public async execute(
    dto: CreateSaleDTO,
    actor?: CreateSaleActor
  ): Promise<Result<Sale, DomainError>> {
    try {
      // 1. Validar Negocio / Spa
      const business = await this.businessRepository.findById(dto.businessId);
      if (!business) {
        return Result.fail(new NotFoundError('Negocio o Spa', dto.businessId));
      }

      // 2. Validar Cliente y política de pertenencia
      const client = await this.clientRepository.findById(dto.clientId);
      if (!client) {
        return Result.fail(new NotFoundError('Cliente', dto.clientId));
      }
      SaleCreationPolicy.validateClientBelongsToBusiness(client.businessId, dto.businessId);

      // 3. Resolver y validar Trabajadora
      let resolvedWorkerId = dto.workerId ?? null;
      if (!resolvedWorkerId && actor?.role === 'WORKER') {
        resolvedWorkerId = actor.id;
      }

      if (resolvedWorkerId) {
        const worker = await this.workerRepository.findById(resolvedWorkerId);
        if (!worker) {
          return Result.fail(new NotFoundError('Trabajadora o especialista', resolvedWorkerId));
        }
        SaleCreationPolicy.validateWorkerBelongsToBusiness(worker.businessId, dto.businessId);
      }

      // 4. Normalizar lista de ítems a vender
      const rawItems: CreateSaleItemDTO[] = [];
      if (dto.items && dto.items.length > 0) {
        rawItems.push(...dto.items);
      } else if (dto.itemName && dto.unitPrice !== undefined && dto.itemType) {
        rawItems.push({
          catalogItemId: dto.catalogItemId ?? null,
          itemType: dto.itemType as SaleItemType,
          itemName: dto.itemName,
          quantity: dto.quantity ?? 1,
          unitPrice: dto.unitPrice,
        });
      }

      if (rawItems.length === 0) {
        return Result.fail(
          new BadRequestError('Debe incluir al menos un servicio o producto para registrar la venta.')
        );
      }

      // 5. Validar ítems de catálogo y preparar entidades de dominio
      const domainItems: SaleItem[] = [];
      const stockUpdates: { catalogItem: any; newStock: number }[] = [];

      for (const itemDto of rawItems) {
        let catalogItemId = itemDto.catalogItemId ?? null;
        let finalItemName = itemDto.itemName;
        let finalPrice = itemDto.unitPrice;
        let finalType: SaleItemType = itemDto.itemType;

        if (catalogItemId) {
          const catalogItem = await this.catalogRepository.findById(catalogItemId);
          if (!catalogItem) {
            return Result.fail(new NotFoundError('Artículo del catálogo', catalogItemId));
          }
          SaleCreationPolicy.validateCatalogItemBelongsToBusiness(
            catalogItem.businessId,
            dto.businessId,
            catalogItem.name
          );

          if (!finalItemName) {
            finalItemName = catalogItem.name;
          }
          if (finalPrice === undefined || finalPrice === null) {
            finalPrice = catalogItem.price;
          }
          finalType =
            catalogItem.itemType === 'PRODUCT' ? SaleItemType.PRODUCT : SaleItemType.SERVICE;

          // Si es producto físico, validar stock
          if (finalType === SaleItemType.PRODUCT) {
            SaleCreationPolicy.validateStockAvailability(catalogItem, itemDto.quantity);
            if (catalogItem.stockQuantity !== null && catalogItem.stockQuantity !== undefined) {
              stockUpdates.push({
                catalogItem,
                newStock: catalogItem.stockQuantity - itemDto.quantity,
              });
            }
          }
        }

        const domainItem = SaleItem.create({
          catalogItemId,
          itemType: finalType,
          itemName: finalItemName,
          quantity: itemDto.quantity,
          unitPrice: finalPrice,
        });

        domainItems.push(domainItem);
      }

      // 6. Crear la venta en el dominio
      const sale = Sale.create({
        businessId: dto.businessId,
        clientId: dto.clientId,
        workerId: resolvedWorkerId,
        createdById: actor?.id ?? null,
        createdByRole: actor?.role ?? null,
        items: domainItems,
      });

      // 7. Persistir venta y actualizar stock en catálogo si aplica
      const savedSale = await this.saleRepository.save(sale);

      for (const update of stockUpdates) {
        try {
          update.catalogItem.updateStock(update.newStock);
          await this.catalogRepository.update(update.catalogItem);
        } catch {
          // Continuar sin interrumpir la venta si la actualización de stock opcional falla
        }
      }

      return Result.ok(savedSale);
    } catch (error) {
      if (error instanceof DomainError) {
        return Result.fail(error);
      }
      return Result.fail(
        new DatabaseError(
          error instanceof Error ? error.message : 'Error inesperado al registrar la venta.'
        )
      );
    }
  }
}
