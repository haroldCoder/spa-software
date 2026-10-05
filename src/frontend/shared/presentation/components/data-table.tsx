'use client';

import * as React from 'react';
import { ScrollArea, ScrollBar } from '@/src/components/ui/scroll-area';
import { cn } from '@/src/lib/utils';

export interface ColumnDef<T> {
  id?: string;
  header: React.ReactNode;
  cell: (item: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  keyExtractor: (item: T, index: number) => string | number;
  maxHeight?: string;
  className?: string;
  tableClassName?: string;
  stickyHeader?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  maxHeight,
  className,
  tableClassName,
  stickyHeader = true,
  emptyMessage = 'No hay registros disponibles',
}: DataTableProps<T>) {
  const isCssValue = maxHeight && !maxHeight.startsWith('max-h-');

  const content = (
    <table className={cn('w-full text-left text-sm', tableClassName)}>
      <thead
        className={cn(
          'text-xs uppercase tracking-wider text-muted-foreground border-b border-border/70',
          stickyHeader
            ? 'sticky top-0 z-10 bg-muted/95 backdrop-blur-sm'
            : 'bg-muted/50'
        )}
      >
        <tr>
          {columns.map((col, idx) => (
            <th
              key={col.id || idx}
              className={cn('py-3 px-4 font-semibold', col.headerClassName)}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-border/60 bg-card">
        {data.length === 0 ? (
          <tr>
            <td
              colSpan={columns.length}
              className="py-8 text-center text-xs text-muted-foreground"
            >
              {emptyMessage}
            </td>
          </tr>
        ) : (
          data.map((item, index) => (
            <tr
              key={keyExtractor(item, index)}
              className="hover:bg-accent/30 transition-colors"
            >
              {columns.map((col, colIdx) => (
                <td key={col.id || colIdx} className={cn('py-3.5 px-4', col.className)}>
                  {col.cell(item, index)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );

  if (maxHeight) {
    return (
      <div className={cn('rounded-xl border border-border/70 overflow-hidden', className)}>
        <ScrollArea
          className={cn('w-full', maxHeight.startsWith('max-h-') ? maxHeight : '')}
          style={isCssValue ? { maxHeight } : undefined}
        >
          {content}
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className={cn('overflow-x-auto rounded-xl border border-border/70', className)}>
      {content}
    </div>
  );
}
