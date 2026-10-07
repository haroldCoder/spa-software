'use client';

import * as React from 'react';
import { useCurrentUser } from '@/src/frontend/modules/auth/application/use-current-user';
import { useSaleFormData } from '../../application/use-sale-form-data';
import { useCreateSale } from '../../application/use-create-sale';

interface UseCreateSaleFormOptions {
  onSuccess: () => void;
}

export function useCreateSaleForm({ onSuccess }: UseCreateSaleFormOptions) {
  const { user } = useCurrentUser();
  const isOwner = user?.role === 'BUSINESS_OWNER' || user?.userType === 'BUSINESS';
  const businessId = user?.businessId;

  const { clients, products, workers, isLoading: isFormDataLoading } = useSaleFormData(businessId);
  const { mutate, isPending, error: apiError } = useCreateSale();

  // Form states
  const [clientId, setClientId] = React.useState<string>('');
  const [productId, setProductId] = React.useState<string>('');
  const [workerId, setWorkerId] = React.useState<string>(!isOwner && user?.id ? user.id : '');
  const [quantity, setQuantity] = React.useState<number>(1);
  const [unitPrice, setUnitPrice] = React.useState<number>(0);
  const [validationError, setValidationError] = React.useState<string | null>(null);
  const [isSuccessFeedback, setIsSuccessFeedback] = React.useState<boolean>(false);

  // Selected product metadata
  const selectedProduct = React.useMemo(() => {
    return products.find((p) => p.id === productId);
  }, [products, productId]);

  // When product changes, sync default price and reset quantity
  const handleProductChange = (newProductId: string) => {
    setProductId(newProductId);
    setValidationError(null);
    const prod = products.find((p) => p.id === newProductId);
    if (prod) {
      setUnitPrice(prod.price || 0);
      setQuantity(1);
    } else {
      setUnitPrice(0);
    }
  };

  const currentStock = selectedProduct?.stockQuantity ?? null;
  const isOutOfStock = currentStock !== null && currentStock <= 0;

  const handleQuantityChange = (newQty: number) => {
    if (newQty < 1) return;
    if (currentStock !== null && newQty > currentStock) {
      setValidationError(`Solo hay ${currentStock} unidad(es) disponibles en stock para este producto.`);
      setQuantity(currentStock > 0 ? currentStock : 1);
      return;
    }
    setValidationError(null);
    setQuantity(newQty);
  };

  const calculatedTotal = Number((quantity * unitPrice).toFixed(2));

  const formatPrice = (amount: number) => {
    try {
      return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      return `$${amount.toLocaleString()}`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!businessId) {
      setValidationError('No se encontró el identificador del spa.');
      return;
    }
    if (!clientId) {
      setValidationError('Por favor, selecciona el cliente que realiza la compra.');
      return;
    }
    if (!productId || !selectedProduct) {
      setValidationError('Por favor, selecciona el producto físico a vender.');
      return;
    }
    if (currentStock !== null && currentStock <= 0) {
      setValidationError('El producto seleccionado no cuenta con unidades disponibles en stock.');
      return;
    }
    if (currentStock !== null && quantity > currentStock) {
      setValidationError(`La cantidad solicitada (${quantity}) excede el stock disponible (${currentStock}).`);
      return;
    }
    if (quantity <= 0) {
      setValidationError('La cantidad vendida debe ser al menos 1 unidad.');
      return;
    }
    if (unitPrice < 0) {
      setValidationError('El precio del producto no puede ser negativo.');
      return;
    }

    const payload = {
      businessId,
      clientId,
      workerId: workerId || null,
      catalogItemId: selectedProduct.id,
      itemType: 'PRODUCT' as const,
      itemName: selectedProduct.name,
      quantity,
      unitPrice,
    };

    mutate(payload, {
      onSuccess: () => {
        setIsSuccessFeedback(true);
        setTimeout(() => {
          onSuccess();
        }, 800);
      },
      onError: (err) => {
        setValidationError(err.message || 'Error inesperado al registrar la venta del producto.');
      },
    });
  };

  return {
    user,
    isOwner,
    businessId,
    clients,
    products,
    workers,
    isFormDataLoading,
    clientId,
    setClientId,
    productId,
    workerId,
    setWorkerId,
    quantity,
    unitPrice,
    setUnitPrice,
    selectedProduct,
    currentStock,
    isOutOfStock,
    calculatedTotal,
    formatPrice,
    handleProductChange,
    handleQuantityChange,
    handleSubmit,
    validationError,
    isPending,
    isSuccessFeedback,
    apiError,
  };
}
