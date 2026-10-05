import { CatalogFormValues } from "../use-create-catalog-item";
import { SPA_CATALOG_CATEGORIES } from "../../domain/constants/catalog-categories";
import { CatalogItemType } from "../../domain/catalog.types";

export const INITIAL_FORM_VALUES: CatalogFormValues = {
    name: '',
    description: '',
    itemType: CatalogItemType.SERVICE,
    category: SPA_CATALOG_CATEGORIES[0],
    price: '',
    costPrice: '',
    durationMinutes: '45',
    sku: '',
    stockQuantity: '0',
    minStockThreshold: '3',
    imageUrl: '',
};