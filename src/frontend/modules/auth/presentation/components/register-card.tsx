'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { RegisterBusinessForm } from './register-business-form';
import { RegisterWorkerForm } from './register-worker-form';
import { Building2, UserCheck, Sparkles } from 'lucide-react';

export function RegisterCard() {
  return (
    <Card className="w-full max-w-xl mx-auto shadow-2xl border-border/80">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-spa-rose to-spa-blush text-white shadow-lg shadow-spa-rose/25 mb-3">
          <Sparkles className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-serif font-bold text-foreground">
          Crea tu cuenta en AuraSpa
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Selecciona tu perfil para iniciar tu registro con autenticación JWT y sesión segura
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="business" className="w-full">
          <TabsList>
            <TabsTrigger value="business" className="gap-2">
              <Building2 className="h-4 w-4" />
              <span>Dueño de Spa</span>
            </TabsTrigger>
            <TabsTrigger value="worker" className="gap-2">
              <UserCheck className="h-4 w-4" />
              <span>Trabajadora</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="business">
            <div className="pt-2">
              <div className="mb-4 rounded-xl bg-accent/60 p-3 text-xs text-accent-foreground border border-border/60">
                Registra tu spa o salón para gestionar terapeutas, citas, clientes y catálogo de productos con permisos de Administrador.
              </div>
              <RegisterBusinessForm />
            </div>
          </TabsContent>

          <TabsContent value="worker">
            <div className="pt-2">
              <div className="mb-4 rounded-xl bg-accent/60 p-3 text-xs text-accent-foreground border border-border/60">
                Regístrate como masoterapeuta, estilista o manicurista vinculada a un spa activo para ver tus clientes y calcular tus comisiones.
              </div>
              <RegisterWorkerForm />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
