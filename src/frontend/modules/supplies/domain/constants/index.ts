import { SupplyItemType, SupplyMovementType, SupplyUnitMeasure } from "../supplies.types";

export const SUPPLY_TYPE_LABELS: Record<SupplyItemType, string> = {
  [SupplyItemType.CONSUMABLE]: 'Consumible de Cabina',
  [SupplyItemType.DISPOSABLE]: 'Desechable',
  [SupplyItemType.TOOL_UTILITY]: 'Útil / Herramienta',
  [SupplyItemType.CLEANING_HYGIENE]: 'Aseo & Desinfección',
};

export const SUPPLY_TYPE_BADGE_VARIANT: Record<SupplyItemType, 'default' | 'secondary' | 'outline' | 'spa'> = {
  [SupplyItemType.CONSUMABLE]: 'spa',
  [SupplyItemType.DISPOSABLE]: 'secondary',
  [SupplyItemType.TOOL_UTILITY]: 'default',
  [SupplyItemType.CLEANING_HYGIENE]: 'outline',
};

export const SUPPLY_UNIT_LABELS: Record<SupplyUnitMeasure, string> = {
  [SupplyUnitMeasure.UNIT]: 'Unidades',
  [SupplyUnitMeasure.ML]: 'Mililitros (ml)',
  [SupplyUnitMeasure.L]: 'Litros (L)',
  [SupplyUnitMeasure.GR]: 'Gramos (g)',
  [SupplyUnitMeasure.KG]: 'Kilos (kg)',
  [SupplyUnitMeasure.PACK]: 'Paquetes',
  [SupplyUnitMeasure.BOX]: 'Cajas',
  [SupplyUnitMeasure.ROLL]: 'Rollos',
};

export const SUPPLY_MOVEMENT_LABELS: Record<SupplyMovementType, string> = {
  [SupplyMovementType.PURCHASE]: 'Compra',
  [SupplyMovementType.CONSUMPTION]: 'Consumo',
  [SupplyMovementType.WASTE]: 'Merma',
  [SupplyMovementType.ADJUSTMENT]: 'Ajuste',
};

