'use client';

import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { BusinessProfile } from '../../domain/dashboard.types';
import {
  Sparkles,
  Building2,
  MapPin,
  FileText,
  UserPlus,
  RefreshCw,
  BookOpen,
  ShieldCheck,
} from 'lucide-react';

interface DashboardHeaderProps {
  business?: BusinessProfile;
  ownerName?: string;
  isRefreshing?: boolean;
  onRefresh: () => void;
}

export function DashboardHeader({
  business,
  ownerName,
  isRefreshing,
  onRefresh,
}: DashboardHeaderProps) {
  const spaName = business?.name || 'Tu Spa';

  return (
    <div className="rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card/95 to-accent/20 p-6 lg:p-8 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge variant="spa" className="text-xs px-2.5 py-0.5 font-semibold">
              <Sparkles className="h-3 w-3 mr-1" />
              Dueño de Spa &middot; Administrador
            </Badge>
            <Badge variant="success" className="text-xs">
              <ShieldCheck className="h-3 w-3 mr-1" />
              Sesión Verificada
            </Badge>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-foreground tracking-tight">
            {spaName}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            {ownerName ? `Bienvenido, ${ownerName}. ` : 'Bienvenido. '}
            Resumen operativo y métricas en tiempo real de tu equipo de trabajadoras y clientes.
          </p>

          {/* Business Meta details */}
          {business && (
            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              {business.city && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-spa-rose" />
                  <span>
                    {business.address ? `${business.address}, ` : ''}
                    {business.city} ({business.country || 'CO'})
                  </span>
                </div>
              )}
              {business.taxId && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5 text-spa-sage" />
                  <span>NIT: {business.taxId}</span>
                </div>
              )}
              {business.currency && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-3.5 w-3.5 text-spa-gold" />
                  <span>Moneda: {business.currency}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </Button>

          <Link href="/register">
            <Button size="sm" className="gap-2">
              <UserPlus className="h-4 w-4" />
              <span>Vincular Trabajadora</span>
            </Button>
          </Link>

          <Link href="/docs">
            <Button variant="outline" size="sm" className="gap-2">
              <BookOpen className="h-4 w-4 text-spa-rose" />
              <span>Swagger</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
