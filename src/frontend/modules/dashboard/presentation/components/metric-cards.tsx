'use client';

import { Card, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { DashboardMetrics } from '../../domain/dashboard.types';
import { Users, UserCheck, Percent, Store, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

interface MetricCardsProps {
  metrics: DashboardMetrics;
  currency?: string;
}

export function MetricCards({ metrics, currency = 'COP' }: MetricCardsProps) {
  const cards = [
    {
      title: 'Colaboradoras / Staff',
      value: metrics.totalWorkers,
      subtitle: `${metrics.activeWorkers} activas en cabina`,
      badgeText: metrics.totalWorkers > 0 ? `${metrics.specialtiesCount} especialidades` : 'Sin equipo aún',
      badgeVariant: metrics.totalWorkers > 0 ? ('spa' as const) : ('secondary' as const),
      icon: Users,
      iconColor: 'text-spa-rose bg-spa-rose/10 border-spa-rose/20',
      gradient: 'from-spa-rose/5 to-transparent',
    },
    {
      title: 'Clientes del Spa',
      value: metrics.totalClients,
      subtitle: `${metrics.activeClients} clientes frecuentes`,
      badgeText: metrics.totalClients > 0 ? 'Cartera activa' : 'Comienza a captar',
      badgeVariant: metrics.totalClients > 0 ? ('success' as const) : ('secondary' as const),
      icon: UserCheck,
      iconColor: 'text-spa-sage bg-spa-sage/10 border-spa-sage/20',
      gradient: 'from-spa-sage/5 to-transparent',
    },
    {
      title: 'Comisión Promedio',
      value: `${metrics.averageCommission}%`,
      subtitle: 'Pactada con trabajadoras',
      badgeText: 'Porcentaje justo',
      badgeVariant: 'outline' as const,
      icon: Percent,
      iconColor: 'text-spa-gold bg-spa-gold/10 border-spa-gold/20',
      gradient: 'from-spa-gold/5 to-transparent',
    },
    {
      title: 'Estado de la Sede',
      value: 'Operativo',
      subtitle: `Moneda: ${currency}`,
      badgeText: 'PRO Activo',
      badgeVariant: 'spa' as const,
      icon: Store,
      iconColor: 'text-spa-lavender bg-spa-lavender/10 border-spa-lavender/20',
      gradient: 'from-spa-lavender/5 to-transparent',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card
            key={idx}
            className={`relative overflow-hidden border-border/80 shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 bg-gradient-to-br ${card.gradient}`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {card.title}
                </span>
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center border shadow-xs ${card.iconColor}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-3">
                <div className="text-3xl font-serif font-bold text-foreground">
                  {card.value}
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{card.subtitle}</span>
                  <Badge variant={card.badgeVariant} className="text-[10px] px-2 py-0.5">
                    {card.badgeText}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
