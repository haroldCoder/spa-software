'use client';

import Link from 'next/link';
import { useOwnerDashboard } from '@/src/frontend/modules/dashboard/application/use-owner-dashboard';
import { RegisterClientForm } from './register-client-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { APP_ROUTES } from '@/src/frontend/shared/constants/routes';
import { UserCheck, ArrowLeft, Loader2, Lock, Building2, Sparkles } from 'lucide-react';

export function RegisterClientView() {
  const { currentUser, isOwner, business, workers, isLoading } = useOwnerDashboard();

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-spa-sage/10 text-spa-sage mb-4 animate-pulse">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
        <h3 className="text-lg font-serif font-bold text-foreground">
          Cargando datos de tu Spa...
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Preparando el formulario de registro de clientes
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center px-4">
        <Card className="border-border/80 shadow-xl p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground">
            Sesión Requerida
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Debes iniciar sesión con tu cuenta de Spa para poder registrar y gestionar clientes en el sistema.
          </p>
          <div className="mt-6">
            <Link href={APP_ROUTES.AUTH.LOGIN}>
              <Button size="sm">Iniciar Sesión</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const businessId = currentUser.businessId;
  const spaName = business?.name || 'Tu Spa';
  // If logged in as worker, default fixedWorkerId to their own ID
  const fixedWorkerId = !isOwner ? currentUser.id : undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button link */}
      <div>
        <Link
          href={APP_ROUTES.DASHBOARD.ROOT}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver al Panel del Spa</span>
        </Link>
      </div>

      {/* Main Registration Card */}
      <Card className="border-border/80 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-spa-sage to-teal-500 text-white shadow-lg shadow-spa-sage/25 mb-3">
            <UserCheck className="h-6 w-6" />
          </div>

          <div className="flex justify-center mb-1">
            <Badge variant="spa" className="text-xs gap-1.5 font-semibold">
              <Building2 className="h-3 w-3" />
              <span>{spaName}</span>
            </Badge>
          </div>

          <CardTitle className="text-2xl font-serif font-bold text-foreground">
            Registrar Nuevo Cliente
          </CardTitle>
          <CardDescription className="text-muted-foreground max-w-md mx-auto">
            Ingresa los datos del cliente para vincularlo a tu Spa, registrar tratamientos y llevar el historial de preferencias.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <RegisterClientForm
            businessId={businessId}
            fixedWorkerId={fixedWorkerId}
            workers={workers}
            onSuccessRedirect={APP_ROUTES.DASHBOARD.ROOT}
          />
        </CardContent>
      </Card>
    </div>
  );
}
