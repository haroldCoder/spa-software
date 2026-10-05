'use client';

import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { BusinessWorkerItem } from '../../domain/dashboard.types';
import { Users, UserPlus, Copy, Check, Sparkles } from 'lucide-react';
import { WorkersTable } from '@/src/frontend/shared/presentation/components/workers-table';

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
          <Button size="sm" variant="secondary" className="gap-2">
            <UserPlus className="h-4 w-4 text-spa-rose" />
            <span>Nueva Colaboradora</span>
          </Button>
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
              <Button size="sm" variant="outline" className="gap-2">
                <UserPlus className="h-4 w-4 text-spa-rose" />
                <span>Registrar colaboradora</span>
              </Button>
            </div>
          </div>
        ) : (
          <WorkersTable workers={workers} />
        )}
      </CardContent>
    </Card>
  );
}
