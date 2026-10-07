'use client';

import { Button } from '@/src/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SalesPaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  onPageChange: (newPage: number) => void;
  disabled?: boolean;
}

export function SalesPagination({
  page,
  limit,
  total,
  totalPages,
  hasNextPage,
  hasPrevPage,
  onPageChange,
  disabled = false,
}: SalesPaginationProps) {
  if (total === 0) {
    return null;
  }

  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate page numbers to display (at most 5 visible)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, page - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-4 border-t border-border/60">
      <div className="text-xs text-muted-foreground text-center sm:text-left">
        Mostrando <span className="font-semibold text-foreground">{startItem}</span> a{' '}
        <span className="font-semibold text-foreground">{endItem}</span> de{' '}
        <span className="font-semibold text-foreground">{total}</span> ventas registradas (10 por página)
      </div>

      <div className="flex items-center gap-1.5">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage || disabled}
          className="h-8 w-8 p-0"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-1">
          {pages.map((pageNum) => (
            <Button
              key={pageNum}
              variant={pageNum === page ? 'default' : 'outline'}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              disabled={disabled}
              className={`h-8 w-8 p-0 text-xs font-medium ${
                pageNum === page
                  ? 'bg-spa-rose hover:bg-spa-rose/90 text-white font-bold'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              {pageNum}
            </Button>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || disabled}
          className="h-8 w-8 p-0"
          aria-label="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
