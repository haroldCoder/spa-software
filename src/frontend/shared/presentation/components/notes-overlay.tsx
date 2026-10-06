'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { X, FileText, User, Scissors, Calendar, AlertCircle } from 'lucide-react';
import { Textarea } from '@/src/components/ui/textarea';
import { Button } from '@/src/components/ui/button';
import { cn } from '@/src/lib/utils';

export interface NotesOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  clientName?: string;
  serviceName?: string;
  dateText?: string;
  notes?: string | null;
  cancellationReason?: string | null;
  emptyText?: string;
}

export function NotesOverlay({
  isOpen,
  onClose,
  title = 'Notas de la Cita',
  subtitle,
  clientName,
  serviceName,
  dateText,
  notes,
  cancellationReason,
  emptyText = 'No hay notas registradas para esta cita.',
}: NotesOverlayProps) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!mounted || !isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notes-overlay-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        className={cn(
          'relative w-full max-w-lg bg-card rounded-2xl border border-border/80 shadow-2xl p-6 z-10',
          'animate-in zoom-in-95 fade-in duration-200'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-border/60">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-xl bg-spa-rose/10 text-spa-rose flex items-center justify-center shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2
                id="notes-overlay-title"
                className="text-base sm:text-lg font-serif font-bold text-foreground truncate"
              >
                {title}
              </h2>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Appointment Context Info Chips */}
        {(clientName || serviceName || dateText) && (
          <div className="flex flex-wrap items-center gap-2 py-3 border-b border-border/40 text-xs text-muted-foreground">
            {clientName && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 font-medium text-foreground">
                <User className="h-3.5 w-3.5 text-spa-rose" />
                {clientName}
              </span>
            )}
            {serviceName && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 font-medium text-foreground">
                <Scissors className="h-3.5 w-3.5 text-spa-sage" />
                {serviceName}
              </span>
            )}
            {dateText && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 font-medium text-foreground">
                <Calendar className="h-3.5 w-3.5 text-spa-gold" />
                {dateText}
              </span>
            )}
          </div>
        )}

        {/* Body Content */}
        <div className="py-4 space-y-4">
          {cancellationReason && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs flex items-start gap-2.5 text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Motivo de cancelación:</span>
                <span className="mt-0.5 block">{cancellationReason}</span>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Observaciones y Notas
            </label>
            <Textarea
              value={notes?.trim() ? notes : emptyText}
              readOnly
              rows={5}
              className={cn(
                'resize-none font-sans text-sm leading-relaxed border-border/80',
                notes?.trim()
                  ? 'bg-muted/20 text-foreground'
                  : 'bg-muted/10 text-muted-foreground italic'
              )}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-3 border-t border-border/60">
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onClose}
            className="px-5 font-medium"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
