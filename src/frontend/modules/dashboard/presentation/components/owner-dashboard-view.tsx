'use client';

import * as React from 'react';
import Link from 'next/link';
import { useOwnerDashboard } from '../../application/use-owner-dashboard';
import { DashboardHeader } from './dashboard-header';
import { MetricCards } from './metric-cards';
import { WorkersTableCard } from './workers-table-card';
import { ClientsTableCard } from './clients-table-card';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import {
  Sparkles,
  Loader2,
  Lock,
  LogIn,
  UserPlus,
  AlertCircle,
  Building2,
} from 'lucide-react';

export function OwnerDashboardView() {
  const {
    currentUser,
    isOwner,
    business,
    workers,
    clients,
    metrics,
    isLoading,
    isError,
    refetchAll,
  } = useOwnerDashboard();

  // 1. Loading State
  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-spa-rose/10 text-spa-rose mb-4 animate-pulse">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
        <h3 className="text-lg font-serif font-bold text-foreground">
          Cargando métricas de tu Spa...
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Sincronizando colaboradoras, clientes y estado operativo
        </p>
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!currentUser) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center px-4">
        <Card className="border-border/80 shadow-xl p-6 sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-foreground">
            Sesión Requerida
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Para acceder al panel del Spa y ver las tarjetas y métricas de trabajadoras y clientes, debes iniciar sesión o registrar tu negocio.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="w-full sm:w-auto">
              <Button className="w-full gap-2">
                <LogIn className="h-4 w-4" />
                <span>Iniciar Sesión</span>
              </Button>
            </Link>
            <Link href="/register" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full gap-2">
                <UserPlus className="h-4 w-4" />
                <span>Registrar Spa</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // 3. Worker User attempting to access Owner dashboard
  if (!isOwner) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center px-4">
        <Card className="border-border/80 shadow-xl p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-spa-gold/10 text-spa-gold mb-4">
            <Building2 className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground">
            Panel de Propietario de Spa
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Has iniciado sesión con una cuenta de <strong>Trabajadora</strong> ({currentUser.email}). Este panel administrativo es exclusivo para propietarios de spas.
          </p>
          <div className="mt-6">
            <Link href="/docs">
              <Button variant="outline" size="sm" className="gap-2">
                <Sparkles className="h-4 w-4" />
                <span>Explorar API</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // 4. Authenticated Spa Owner Dashboard
  const businessId = currentUser.businessId;

  return (
    <div className="space-y-8">
      {/* Header section with business metadata */}
      <DashboardHeader
        business={business}
        ownerName={currentUser.name}
        onRefresh={refetchAll}
      />

      {/* 4 Primary Metric Cards */}
      <MetricCards metrics={metrics} currency={business?.currency || 'COP'} />

      {/* Grid with Workers & Clients Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <WorkersTableCard workers={workers} businessId={businessId} />
        <ClientsTableCard clients={clients} />
      </div>
    </div>
  );
}
