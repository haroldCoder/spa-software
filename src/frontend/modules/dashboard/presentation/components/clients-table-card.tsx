'use client';

import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { APP_ROUTES } from '@/src/frontend/shared/constants/routes';
import { BusinessClientItem } from '../../domain/dashboard.types';
import { UserCheck, UserPlus } from 'lucide-react';
import { ClientsTable } from '@/src/frontend/shared/presentation/components/clients-table';

interface ClientsTableCardProps {
  clients: BusinessClientItem[];
}

export function ClientsTableCard({ clients }: ClientsTableCardProps) {
  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-spa-sage/10 flex items-center justify-center text-spa-sage">
              <UserCheck className="h-4 w-4" />
            </div>
            <CardTitle className="text-xl font-serif">Cartera de Clientes</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {clients.length}
            </Badge>
          </div>
          <CardDescription className="mt-1">
            Historial de usuarios que han recibido tratamientos o agendado citas
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Link href={APP_ROUTES.DASHBOARD.REGISTER_CLIENT}>
            <Button size="sm" variant="secondary" className="gap-2">
              <UserPlus className="h-4 w-4 text-spa-sage" />
              <span>Nuevo Cliente</span>
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent>
        {clients.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card/40">
            <div className="mx-auto h-12 w-12 rounded-full bg-spa-sage/10 flex items-center justify-center text-spa-sage mb-3">
              <UserCheck className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-foreground">
              Aún no hay clientes registrados en el sistema
            </h4>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Tus colaboradoras o el administrador podrán crear clientes al momento de agendar citas o vender servicios en el spa.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link href={APP_ROUTES.DASHBOARD.REGISTER_CLIENT}>
                <Button size="sm" variant="outline" className="gap-2">
                  <UserPlus className="h-4 w-4 text-spa-sage" />
                  <span>Registrar cliente</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <ClientsTable clients={clients} />
        )}
      </CardContent>
    </Card>
  );
}
