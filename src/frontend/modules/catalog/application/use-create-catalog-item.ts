'use client';

import * as React from 'react';
import { CatalogItemType, CreateCatalogItemInput } from '../domain/catalog.types';
import { CatalogApi } from '../infrastructure/catalog.api';
import { useCurrentUser } from '@/src/frontend/modules/auth/application/use-current-user';
import { INITIAL_FORM_VALUES } from './constants/initial-form-values';

export interface CatalogFormValues {
  name: string;
  description: string;
  itemType: CatalogItemType;
  category: string;
  price: string;
  costPrice: string;
  durationMinutes: string;
  sku: string;
  stockQuantity: string;
  minStockThreshold: string;
  imageUrl: string;
}

export function useCreateCatalogItem(onSuccess?: () => void) {
  const { user } = useCurrentUser();
  const businessId = user?.businessId;

  const [values, setValues] = React.useState<CatalogFormValues>(INITIAL_FORM_VALUES);
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const setField = React.useCallback(<K extends keyof CatalogFormValues>(field: K, val: CatalogFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: val }));
    setErrorMessage(null);
  }, []);

  const [isUploadingImage, setIsUploadingImage] = React.useState(false);

  const handleFileSelect = React.useCallback(
    async (file: File) => {
      setErrorMessage(null);

      // Validate size (max 30MB)
      const MAX_SIZE = 30 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        setErrorMessage('La imagen no debe superar los 30MB.');
        return;
      }

      // Validate type
      const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
      if (!validMimes.includes(file.type.toLowerCase())) {
        setErrorMessage('Formato de imagen inválido. Usa JPG, PNG, WEBP o AVIF.');
        return;
      }

      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      // Auto-upload immediately to Supabase Storage bucket products if businessId is available
      if (businessId) {
        try {
          setIsUploadingImage(true);
          setUploadProgress('Subiendo fotografía al bucket "products"...');
          const uploadResult = await CatalogApi.uploadCatalogImage(businessId, file);
          const resolvedUrl = uploadResult.imageUrl || uploadResult.publicUrl || '';
          if (resolvedUrl) {
            setValues((prev) => ({ ...prev, imageUrl: resolvedUrl }));
          }
        } catch (uploadErr) {
          console.warn('Subida inmediata pendiente, se asegurará al guardar el servicio:', uploadErr);
        } finally {
          setIsUploadingImage(false);
          setUploadProgress(null);
        }
      }
    },
    [businessId]
  );

  const removeSelectedFile = React.useCallback(() => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setField('imageUrl', '');
  }, [previewUrl, setField]);

  const resetForm = React.useCallback(() => {
    removeSelectedFile();
    setValues(INITIAL_FORM_VALUES);
    setErrorMessage(null);
    setSuccessMessage(null);
    setUploadProgress(null);
  }, [removeSelectedFile]);

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!businessId) {
      setErrorMessage('No se encontró el ID de tu negocio o Spa. Inicia sesión nuevamente.');
      return;
    }

    // Basic Validations
    if (!values.name.trim()) {
      setErrorMessage('El nombre del servicio o producto es obligatorio.');
      return;
    }

    const priceNum = parseFloat(values.price);
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMessage('El precio de venta debe ser un número válido mayor o igual a 0.');
      return;
    }

    if (values.itemType === CatalogItemType.SERVICE) {
      const durNum = parseInt(values.durationMinutes, 10);
      if (isNaN(durNum) || durNum <= 0) {
        setErrorMessage('Los servicios deben especificar una duración en minutos mayor a 0 (ej. 45 min).');
        return;
      }
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);
      setSuccessMessage(null);

      let finalImageUrl = values.imageUrl.trim() || undefined;

      // 1. Ensure image is uploaded if file selected but no URL stored yet
      if (selectedFile && !finalImageUrl) {
        setUploadProgress('Subiendo imagen al bucket products...');
        const uploadResult = await CatalogApi.uploadCatalogImage(businessId, selectedFile);
        finalImageUrl = uploadResult.imageUrl || uploadResult.publicUrl || undefined;
        if (finalImageUrl) {
          setValues((prev) => ({ ...prev, imageUrl: finalImageUrl || "" }));
        }
      }

      // 2. Create catalog item
      setUploadProgress('Guardando en catálogo...');
      const payload: CreateCatalogItemInput = {
        name: values.name.trim(),
        description: values.description.trim() || undefined,
        itemType: values.itemType,
        category: values.category.trim(),
        price: priceNum,
        costPrice: values.costPrice ? parseFloat(values.costPrice) : undefined,
        durationMinutes: values.itemType === CatalogItemType.SERVICE ? parseInt(values.durationMinutes, 10) : undefined,
        sku: values.sku.trim() || undefined,
        stockQuantity: values.itemType === CatalogItemType.PRODUCT && values.stockQuantity ? parseInt(values.stockQuantity, 10) : 0,
        minStockThreshold: values.itemType === CatalogItemType.PRODUCT && values.minStockThreshold ? parseInt(values.minStockThreshold, 10) : undefined,
        imageUrl: finalImageUrl,
        isActive: true,
      };

      await CatalogApi.createCatalogItem(businessId, payload);

      setSuccessMessage(
        values.itemType === CatalogItemType.SERVICE
          ? `¡Servicio "${values.name}" registrado exitosamente con su fotografía!`
          : `¡Producto "${values.name}" agregado al inventario exitosamente con su fotografía!`
      );

      resetForm();
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error inesperado al guardar el artículo.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
      setUploadProgress(null);
    }
  };

  return {
    values,
    setField,
    selectedFile,
    previewUrl,
    handleFileSelect,
    removeSelectedFile,
    isSubmitting,
    isUploadingImage,
    uploadProgress,
    errorMessage,
    successMessage,
    resetForm,
    submit,
  };
}
