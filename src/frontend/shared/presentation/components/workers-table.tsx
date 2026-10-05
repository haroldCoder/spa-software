'use client';

import * as React from 'react';
import { Badge } from '@/src/components/ui/badge';
import { BusinessWorkerItem } from '@/src/frontend/modules/dashboard/domain/dashboard.types';
import { Phone, Mail, Award } from 'lucide-react';
import { DataTable, ColumnDef } from './data-table';

export interface WorkersTableProps {
  workers: BusinessWorkerItem[];
  maxHeight?: string;
  className?: string;
}

export function WorkersTable({
  workers,
  maxHeight = '280px',
  className,
}: WorkersTableProps) {
  const columns = React.useMemo<ColumnDef<BusinessWorkerItem>[]>(
    () => [
      {
        id: 'worker',
        header: 'Colaboradora',
        headerClassName: 'py-3 px-4',
        className: 'py-3.5 px-4',
        cell: (worker) => {
          const initials =
            `${worker.firstName?.[0] || ''}${worker.lastName?.[0] || ''}`.toUpperCase() || 'W';
          return (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-spa-rose/20 to-spa-blush/20 border border-spa-rose/30 flex items-center justify-center text-xs font-bold text-spa-rose shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate">
                  {worker.firstName} {worker.lastName}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  ID: {worker.id.slice(0, 8)}...
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: 'contact',
        header: 'Contacto',
        headerClassName: 'py-3 px-4',
        className: 'py-3.5 px-4 text-xs',
        cell: (worker) => (
          <div className="space-y-0.5">
            {worker.email && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[180px]">{worker.email}</span>
              </div>
            )}
            {worker.phone && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Phone className="h-3 w-3 shrink-0" />
                <span>{worker.phone}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'specialty',
        header: 'Especialidad',
        headerClassName: 'py-3 px-4',
        className: 'py-3.5 px-4',
        cell: (worker) =>
          worker.specialty ? (
            <Badge variant="outline" className="text-xs gap-1 font-normal">
              <Award className="h-3 w-3 text-spa-rose shrink-0" />
              <span>{worker.specialty}</span>
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground italic">General</span>
          ),
      },
      {
        id: 'commission',
        header: 'Comisión',
        headerClassName: 'py-3 px-4',
        className: 'py-3.5 px-4',
        cell: (worker) => (
          <Badge variant="spa" className="font-semibold text-xs">
            {worker.commissionPercentage || 0}%
          </Badge>
        ),
      },
      {
        id: 'status',
        header: 'Estado',
        headerClassName: 'py-3 px-4 text-center',
        className: 'py-3.5 px-4 text-center',
        cell: (worker) => (
          <Badge
            variant={worker.isActive ? 'success' : 'secondary'}
            className="text-[11px]"
          >
            {worker.isActive ? 'Activa' : 'Inactiva'}
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <DataTable
      data={workers}
      columns={columns}
      keyExtractor={(worker) => worker.id}
      maxHeight={maxHeight}
      className={className}
    />
  );
}
