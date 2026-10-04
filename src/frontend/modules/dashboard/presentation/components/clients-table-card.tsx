'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { BusinessClientItem } from '../../domain/dashboard.types';
import { UserCheck, Phone, Mail, Calendar, Sparkles } from 'lucide-react';

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
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/70">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/70">
                <tr>
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Observaciones / Preferencias</th>
                  <th className="py-3 px-4">Registro</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-card">
                {clients.map((client) => {
                  const initials = `${client.firstName?.[0] || ''}${client.lastName?.[0] || ''}`.toUpperCase() || 'C';
                  const dateStr = client.createdAt ? new Date(client.createdAt).toLocaleDateString() : 'Reciente';

                  return (
                    <tr
                      key={client.id}
                      className="hover:bg-accent/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-spa-sage/20 to-teal-500/20 border border-spa-sage/30 flex items-center justify-center text-xs font-bold text-spa-sage">
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {client.firstName} {client.lastName}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              ID: {client.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="space-y-0.5">
                          {client.phone && (
                            <div className="flex items-center gap-1.5 text-foreground font-medium">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                          {client.email && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{client.email}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground">
                        {client.notes ? (
                          <span className="line-clamp-2">{client.notes}</span>
                        ) : (
                          <span className="italic text-muted-foreground/60">Sin notas registradas</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          <span>{dateStr}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={client.isActive ? 'success' : 'secondary'}
                          className="text-[11px]"
                        >
                          {client.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
