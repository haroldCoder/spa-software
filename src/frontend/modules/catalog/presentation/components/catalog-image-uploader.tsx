'use client';

import * as React from 'react';
import { UploadCloud, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface CatalogImageUploaderProps {
  previewUrl: string | null;
  selectedFile: File | null;
  uploadedUrl?: string | null;
  isUploading?: boolean;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  disabled?: boolean;
}

export function CatalogImageUploader({
  previewUrl,
  selectedFile,
  uploadedUrl,
  isUploading,
  onFileSelect,
  onRemove,
  disabled,
}: CatalogImageUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
          <ImageIcon className="h-3.5 w-3.5 text-spa-rose" />
          <span>Fotografía del Artículo (Bucket: products)</span>
        </label>
        <span className="text-[11px] text-muted-foreground">Opcional pero recomendado</span>
      </div>

      {previewUrl ? (
        /* Image Preview Box */
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-border/80 bg-muted/30 shadow-inner group">
          <img
            src={previewUrl}
            alt="Vista previa del artículo"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onRemove}
              disabled={disabled}
              className="gap-1.5 text-xs shadow-lg"
            >
              <X className="h-4 w-4" />
              <span>Quitar Fotografía</span>
            </Button>
          </div>
          {selectedFile && (
            <div className="absolute bottom-2 left-2 rounded-md bg-black/60 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm truncate max-w-[60%]">
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
            </div>
          )}

          {/* Upload Status Badge */}
          {isUploading && (
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-spa-rose/90 px-2.5 py-1 text-[11px] font-medium text-white shadow-md backdrop-blur-sm animate-pulse">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Cargando en bucket products...</span>
            </div>
          )}

          {uploadedUrl && !isUploading && (
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-emerald-600/90 px-2.5 py-1 text-[11px] font-medium text-white shadow-md backdrop-blur-sm">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Cargada en Storage (products)</span>
            </div>
          )}
        </div>
      ) : (
        /* Drag & Drop Upload Zone */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 sm:p-8 text-center transition-all ${isDragOver
              ? 'border-spa-rose bg-spa-rose/10 scale-[0.99]'
              : 'border-border/80 bg-card hover:bg-muted/30 hover:border-spa-rose/50'
            } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
            onChange={handleChange}
            disabled={disabled}
            className="hidden"
          />
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-spa-rose/10 text-spa-rose shadow-inner mb-3">
            <UploadCloud className="h-6 w-6" />
          </div>
          <div className="text-sm font-semibold text-foreground">
            Haz clic para seleccionar o arrastra una imagen aquí
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Soporta JPG, PNG, WEBP o AVIF de hasta 30MB.
          </p>
          <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-spa-rose/10 px-2.5 py-0.5 text-[11px] font-medium text-spa-rose">
            <Sparkles className="h-3 w-3" />
            <span>Almacenamiento en Supabase Storage</span>
          </div>
        </div>
      )}
    </div>
  );
}
