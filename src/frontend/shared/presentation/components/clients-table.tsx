'use client';

import * as React from 'react';
import { Badge } from '@/src/components/ui/badge';
import { BusinessClientItem } from '@/src/frontend/modules/dashboard/domain/dashboard.types';
import { Phone, Mail, Calendar } from 'lucide-react';
import { DataTable, ColumnDef } from './data-table';

export interface ClientsTableProps {
  clients: BusinessClientItem[];
  maxHeight?: string;
  className?: string;
}

export function ClientsTable({
  clients,
  maxHeight = '280px',
  className,
}: ClientsTableProps) {
  const columns = React.useMemo<ColumnDef<BusinessClientItem>[]>(
    () => [
      {
        id: 'client',
        header: 'Cliente',
        headerClassName: 'py-3 px-4',
        className: 'py-3.5 px-4',
        cell: (client) => {
          const initials =
            `${client.firstName?.[0] || ''}${client.lastName?.[0] || ''}`.toUpperCase() || 'C';
          return (
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-spa-sage/20 to-teal-500/20 border border-spa-sage/30 flex items-center justify-center text-xs font-bold text-spa-sage shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="font-medium text-foreground truncate">
                  {client.firstName} {client.lastName}
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  ID: {client.id.slice(0, 8)}...
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
        cell: (client) => (
          <div className="space-y-0.5">
            {client.phone && (
              <div className="flex items-center gap-1.5 text-foreground font-medium">
                <Phone className="h-3 w-3 text-muted-foreground shrink-0" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Mail className="h-3 w-3 shrink-0" />
                <span className="truncate max-w-[180px]">{client.email}</span>
              </div>
            )}
          </div>
        ),
      },
      {
        id: 'notes',
        header: 'Observaciones / Preferencias',
        headerClassName: 'py-3 px-4',
        className: 'py-3.5 px-4 text-xs text-muted-foreground',
        cell: (client) =>
          client.notes ? (
            <span className="line-clamp-2">{client.notes}</span>
          ) : (
            <span className="italic text-muted-foreground/60">Sin notas registradas</span>
          ),
      },
      {
        id: 'createdAt',
        header: 'Registro',
        headerClassName: 'py-3 px-4',
        className: 'py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap',
        cell: (client) => {
          const dateStr = client.createdAt
            ? new Date(client.createdAt).toLocaleDateString()
            : 'Reciente';
          return (
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3 w-3 shrink-0" />
              <span>{dateStr}</span>
            </div>
          );
        },
      },
      {
        id: 'status',
        header: 'Estado',
        headerClassName: 'py-3 px-4 text-center',
        className: 'py-3.5 px-4 text-center',
        cell: (client) => (
          <Badge
            variant={client.isActive ? 'success' : 'secondary'}
            className="text-[11px]"
          >
            {client.isActive ? 'Activo' : 'Inactivo'}
          </Badge>
        ),
      },
    ],
    []
  );

  return (
    <DataTable
      data={clients}
      columns={columns}
      keyExtractor={(client) => client.id}
      maxHeight={maxHeight}
      className={className}
    />
  );
}
