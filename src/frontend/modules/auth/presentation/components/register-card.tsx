'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';
import { RegisterBusinessForm } from './register-business-form';
import { Sparkles, UserCheck } from 'lucide-react';

export function RegisterCard() {
  return (
    <Card className="w-full max-w-xl mx-auto shadow-2xl border-border/80">
      <CardHeader className="text-center pb-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-spa-rose to-spa-blush text-white shadow-lg shadow-spa-rose/25 mb-3">
          <Sparkles className="h-6 w-6" />
        </div>
        <CardTitle className="text-2xl font-serif font-bold text-foreground">
          Registra tu Spa en AuraSpa
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Crea la cuenta de administrador para gestionar tu spa, tus colaboradoras, clientes y catálogo
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* Worker Notice */}
        <div className="mb-6 rounded-xl bg-accent/40 p-3.5 text-xs text-accent-foreground border border-border/70 flex items-start gap-2.5">
          <UserCheck className="h-4 w-4 text-spa-rose shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>¿Eres colaboradora o masoterapeuta?</strong> Tu spa debe registrarte desde su panel de control para asignarte comisiones. Si tu cuenta ya fue creada,{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              inicia sesión aquí
            </Link>.
          </p>
        </div>

        {/* Spa Owner Registration Form */}
        <RegisterBusinessForm />

        <div className="text-center mt-6 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            ¿Ya registraste tu negocio?{' '}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
