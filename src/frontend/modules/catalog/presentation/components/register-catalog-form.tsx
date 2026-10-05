'use client';

import { Loader2, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { CatalogItemType } from '../../domain/catalog.types';
import { useCreateCatalogItem } from '../../application/use-create-catalog-item';
import { CatalogTypeSelector } from './catalog-type-selector';
import { CatalogImageUploader } from './catalog-image-uploader';
import { CatalogBasicInfoFields } from './catalog-basic-info-fields';
import { CatalogPricingFields } from './catalog-pricing-fields';

interface RegisterCatalogFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function RegisterCatalogForm({ onSuccess, onCancel }: RegisterCatalogFormProps) {
  const {
    values,
    setField,
    previewUrl,
    selectedFile,
    handleFileSelect,
    removeSelectedFile,
    isSubmitting,
    isUploadingImage,
    uploadProgress,
    errorMessage,
    successMessage,
    submit,
  } = useCreateCatalogItem(onSuccess);

  return (
    <form
      id="register-catalog-item-form"
      onSubmit={submit}
      className="space-y-6"
    >
      {/* Type Selector: Service vs Product */}
      <CatalogTypeSelector
        value={values.itemType}
        onChange={(type) => setField('itemType', type)}
        disabled={isSubmitting}
      />

      {/* Image Uploader with Supabase Bucket integration */}
      <CatalogImageUploader
        previewUrl={previewUrl}
        selectedFile={selectedFile}
        uploadedUrl={values.imageUrl}
        isUploading={isUploadingImage}
        onFileSelect={handleFileSelect}
        onRemove={removeSelectedFile}
        disabled={isSubmitting}
      />

      {/* Basic Info: Name, Category, Description */}
      <CatalogBasicInfoFields
        name={values.name}
        category={values.category}
        description={values.description}
        itemType={values.itemType}
        onChange={setField}
        disabled={isSubmitting}
      />

      {/* Pricing & Duration / Stock Fields */}
      <CatalogPricingFields
        itemType={values.itemType}
        price={values.price}
        costPrice={values.costPrice}
        durationMinutes={values.durationMinutes}
        stockQuantity={values.stockQuantity}
        minStockThreshold={values.minStockThreshold}
        sku={values.sku}
        onChange={setField}
        disabled={isSubmitting}
      />

      {/* Feedback Messages */}
      {uploadProgress && (
        <div className="flex items-center gap-2 rounded-xl bg-spa-rose/10 border border-spa-rose/25 p-3 text-xs text-spa-rose animate-pulse">
          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          <span>{uploadProgress}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3 text-xs text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-border/70">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
        )}

        <Button
          id="submit-catalog-item-btn"
          type="submit"
          disabled={isSubmitting}
          className="gap-2 bg-gradient-to-r from-spa-rose to-spa-blush text-white shadow-md shadow-spa-rose/25 hover:shadow-spa-rose/40"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              <span>
                {values.itemType === CatalogItemType.SERVICE
                  ? 'Guardar Servicio'
                  : 'Guardar Producto'}
              </span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
