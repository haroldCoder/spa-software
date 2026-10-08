'use client';

import * as React from 'react';
import { Target, Sparkles, Phone, Mail, Calendar, MessageCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { DataTable, ColumnDef } from '@/src/frontend/shared/presentation/components/data-table';
import { PotentialClientItem } from '@/src/frontend/modules/sales/domain/sales-metrics.types';

interface PotentialClientsTableProps {
  potentialClientsList: PotentialClientItem[];
  formatCurrency: (val: number) => string;
}

export function PotentialClientsTable({
  potentialClientsList,
  formatCurrency,
}: PotentialClientsTableProps) {
  const columns = React.useMemo<ColumnDef<PotentialClientItem>[]>(
    () => [
      {
        id: 'client',
        header: 'Cliente',
        cell: (client) => (
          <div>
            <div className="font-semibold text-foreground text-sm">
              {client.fullName}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Registrado: {new Date(client.registeredAt).toLocaleDateString('es-CO')}
            </div>
          </div>
        ),
      },
      {
        id: 'contact',
        header: 'Contacto',
        cell: (client) => (
          <div className="flex flex-col gap-0.5">
            {client.phone && (
              <div className="flex items-center gap-1.5 text-foreground font-mono text-xs">
                <Phone className="h-3 w-3 text-muted-foreground" />
                <span>{client.phone}</span>
              </div>
            )}
            {client.email && (
              <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                <Mail className="h-3 w-3 text-muted-foreground" />
                <span>{client.email}</span>
              </div>
            )}
            {!client.phone && !client.email && (
              <span className="text-muted-foreground text-[11px]">Sin datos de contacto</span>
            )}
          </div>
        ),
      },
      {
        id: 'appointments',
        header: 'Estado de Citas',
        cell: (client) =>
          client.hasAppointments ? (
            <Badge
              variant="outline"
              className="text-[11px] bg-spa-rose/10 text-spa-rose border-spa-rose/30 gap-1 font-normal"
            >
              <Calendar className="h-3 w-3" />
              <span>{client.appointmentsCount} Cita(s) Agendadas</span>
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[11px] text-muted-foreground font-normal">
              Sin citas previas
            </Badge>
          ),
      },
      {
        id: 'potentialValue',
        header: 'Valor Estimado',
        cell: (client) => (
          <div className="font-mono font-semibold text-xs text-foreground">
            {client.potentialValue > 0 ? (
              <span className="text-spa-sage">{formatCurrency(client.potentialValue)}</span>
            ) : (
              <span className="text-muted-foreground">—</span>
            )}
          </div>
        ),
      },
      {
        id: 'actions',
        header: <span className="block text-right">Acción Rápida</span>,
        headerClassName: 'text-right',
        className: 'text-right',
        cell: (client) => {
          const cleanPhone = client.phone?.replace(/\D/g, '') || '';
          const waUrl = cleanPhone
            ? `https://wa.me/${cleanPhone.startsWith('57') ? cleanPhone : `57${cleanPhone}`}?text=${encodeURIComponent(
                `Hola ${client.fullName}, te saludamos desde el spa. Queremos invitarte a conocer nuestras promociones exclusivas para ti.`
              )}`
            : undefined;

          return waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium transition-colors cursor-pointer"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </a>
          ) : (
            <span className="text-muted-foreground text-[11px]">Sin teléfono</span>
          );
        },
      },
    ],
    [formatCurrency]
  );

  return (
    <Card className="border-border/80 shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/20 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-spa-sage" />
              Directorio de Clientes Potenciales ({potentialClientsList.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Clientes registrados en el spa que aún no tienen ventas cerradas o tienen citas pendientes de cobro
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="text-xs bg-spa-sage/10 text-spa-sage border-spa-sage/30 self-start sm:self-auto"
          >
            Oportunidades de Conversión
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {potentialClientsList.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-spa-sage/10 text-spa-sage mb-3">
              <Sparkles className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-foreground">
              ¡Todos los clientes registrados han comprado!
            </h4>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Excelente indicador comercial. No tienes clientes potenciales sin compras registradas actualmente.
            </p>
          </div>
        ) : (
          <DataTable
            data={potentialClientsList}
            columns={columns}
            keyExtractor={(item) => item.id}
            className="border-0 rounded-none shadow-none"
            stickyHeader={false}
          />
        )}
      </CardContent>
    </Card>
  );
}
