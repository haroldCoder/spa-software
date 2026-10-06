'use client';

import Link from 'next/link';
import { useOwnerDashboard } from '../../application/use-owner-dashboard';
import { RegisterWorkerForm } from '@/src/frontend/modules/auth/presentation/components/register-worker-form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Button } from '@/src/components/ui/button';
import { APP_ROUTES } from '@/src/frontend/shared/constants/routes';
import { UserPlus, ArrowLeft, Loader2, Lock, Building2 } from 'lucide-react';

export function OwnerRegisterWorkerView() {
  const { currentUser, isOwner, business, isLoading } = useOwnerDashboard();

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-spa-rose/10 text-spa-rose mb-4 animate-pulse">
          <Loader2 className="h-7 w-7 animate-spin" />
        </div>
        <h3 className="text-lg font-serif font-bold text-foreground">
          Cargando datos de tu Spa...
        </h3>
      </div>
    );
  }

  if (!currentUser || !isOwner) {
    return (
      <div className="py-16 max-w-lg mx-auto text-center px-4">
        <Card className="border-border/80 shadow-xl p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-primary mb-4">
            <Lock className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-serif font-bold text-foreground">
            Acceso Restringido
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            Debes haber iniciado sesión como dueño de un Spa para poder registrar colaboradoras en tu negocio.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            {!currentUser ? (
              <Link href={APP_ROUTES.AUTH.LOGIN}>
                <Button size="sm">Iniciar Sesión</Button>
              </Link>
            ) : (
              <>
                <Link href={APP_ROUTES.DASHBOARD.ROOT}>
                  <Button size="sm">Ir al Panel del Spa</Button>
                </Link>
                <Link href={APP_ROUTES.APPOINTMENTS}>
                  <Button size="sm" variant="outline">Ver Mis Citas</Button>
                </Link>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  const businessId = currentUser.businessId;
  const spaName = business?.name || 'Tu Spa';

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
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-spa-rose to-spa-blush text-white shadow-lg shadow-spa-rose/25 mb-3">
            <UserPlus className="h-6 w-6" />
          </div>

          <div className="flex justify-center mb-1">
            <Badge variant="spa" className="text-xs gap-1.5 font-semibold">
              <Building2 className="h-3 w-3" />
              <span>{spaName}</span>
            </Badge>
          </div>

          <CardTitle className="text-2xl font-serif font-bold text-foreground">
            Registrar Colaboradora
          </CardTitle>
          <CardDescription className="text-muted-foreground max-w-md mx-auto">
            Crea la cuenta de acceso para tu terapeuta, estilista o técnica. Quedará vinculada automáticamente a tu spa.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <RegisterWorkerForm
            fixedBusinessId={businessId}
            onSuccessRedirect={APP_ROUTES.DASHBOARD.ROOT}
          />
        </CardContent>
      </Card>
    </div>
  );
}
