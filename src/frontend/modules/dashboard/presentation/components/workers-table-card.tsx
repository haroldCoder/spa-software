'use client';

import * as React from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { BusinessWorkerItem } from '../../domain/dashboard.types';
import { Users, UserPlus, Copy, Check, Sparkles, Phone, Mail, Award } from 'lucide-react';

interface WorkersTableCardProps {
  workers: BusinessWorkerItem[];
  businessId: string;
}

export function WorkersTableCard({ workers, businessId }: WorkersTableCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyId = () => {
    navigator.clipboard.writeText(businessId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="border-border/80 shadow-md">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-spa-rose/10 flex items-center justify-center text-spa-rose">
              <Users className="h-4 w-4" />
            </div>
            <CardTitle className="text-xl font-serif">Colaboradoras del Spa</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {workers.length}
            </Badge>
          </div>
          <CardDescription className="mt-1">
            Personal técnico, terapeutas y estilistas vinculados a tu sede
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/register">
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Nueva Colaboradora</span>
            </Button>
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Spa ID shareable banner */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-accent/40 border border-border/80 text-xs">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-spa-rose shrink-0" />
            <div>
              <span className="font-semibold text-foreground">ID de tu Spa para vincular personal:</span>{' '}
              <code className="bg-background/80 px-2 py-0.5 rounded-md font-mono text-spa-rose border border-border/60 select-all font-semibold">
                {businessId}
              </code>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyId}
            className="h-8 text-xs gap-1.5 shrink-0"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-spa-sage" />
                <span className="text-spa-sage font-medium">¡Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copiar ID</span>
              </>
            )}
          </Button>
        </div>

        {/* Workers list / empty state */}
        {workers.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card/40">
            <div className="mx-auto h-12 w-12 rounded-full bg-spa-rose/10 flex items-center justify-center text-spa-rose mb-3">
              <Users className="h-6 w-6" />
            </div>
            <h4 className="text-base font-semibold text-foreground">
              Aún no has registrado colaboradoras
            </h4>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
              Comparte el ID de tu spa con tus terapeutas para que se auto-registren o regístralas tú mismo desde el formulario.
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/register">
                <Button size="sm" variant="default" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  <span>Registrar la primera colaboradora</span>
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-border/70">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground border-b border-border/70">
                <tr>
                  <th className="py-3 px-4">Colaboradora</th>
                  <th className="py-3 px-4">Contacto</th>
                  <th className="py-3 px-4">Especialidad</th>
                  <th className="py-3 px-4">Comisión</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 bg-card">
                {workers.map((worker) => {
                  const initials = `${worker.firstName?.[0] || ''}${worker.lastName?.[0] || ''}`.toUpperCase() || 'W';
                  return (
                    <tr
                      key={worker.id}
                      className="hover:bg-accent/30 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-spa-rose/20 to-spa-blush/20 border border-spa-rose/30 flex items-center justify-center text-xs font-bold text-spa-rose">
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">
                              {worker.firstName} {worker.lastName}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              ID: {worker.id.slice(0, 8)}...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-xs">
                        <div className="space-y-0.5">
                          {worker.email && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              <span>{worker.email}</span>
                            </div>
                          )}
                          {worker.phone && (
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              <span>{worker.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        {worker.specialty ? (
                          <Badge variant="outline" className="text-xs gap-1 font-normal">
                            <Award className="h-3 w-3 text-spa-rose" />
                            <span>{worker.specialty}</span>
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">General</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant="spa" className="font-semibold text-xs">
                          {worker.commissionPercentage || 0}%
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <Badge
                          variant={worker.isActive ? 'success' : 'secondary'}
                          className="text-[11px]"
                        >
                          {worker.isActive ? 'Activa' : 'Inactiva'}
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
