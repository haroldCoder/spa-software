'use client';

import * as React from 'react';
import Link from 'next/link';
import { useLogin } from '../../application/use-login';
import { LoginFormValues } from '../../domain/auth.types';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Badge } from '@/src/components/ui/badge';
import { LogIn, Sparkles, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

interface LoginFormProps {
  userType?: 'BUSINESS' | 'WORKER';
}

export function LoginForm({ userType }: LoginFormProps) {
  const [formData, setFormData] = React.useState<LoginFormValues>({
    email: '',
    password: '',
    userType,
  });

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const { mutate, isPending, isSuccess, data, error, reset } = useLogin();

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = 'Introduce un correo electrónico válido';
    }
    if (!formData.password || formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutate({
      ...formData,
      userType,
    });
  };

  if (isSuccess && data) {
    const isWorker = data.user.role === 'WORKER';

    return (
      <div className="rounded-2xl bg-spa-sage/10 p-8 text-center border border-spa-sage/20 animate-in fade-in duration-300">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-spa-sage/20 text-spa-sage mb-4 shadow-sm">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h4 className="text-xl font-bold text-foreground">
          ¡Bienvenido de nuevo, {data.user.name}!
        </h4>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Sesión iniciada exitosamente con autenticación JWT y sesión segura.
        </p>

        <div className="mt-6 p-4 rounded-xl bg-card border border-border text-left text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Rol activo:</span>
            <Badge variant={isWorker ? 'secondary' : 'spa'}>
              {data.user.role}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Correo:</span>
            <span className="font-medium text-foreground">{data.user.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">ID Negocio:</span>
            <code className="text-spa-sage font-mono text-[11px]">{data.user.businessId}</code>
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/dashboard">
            <Button
              size="sm"
              className="w-full sm:w-auto gap-2 shadow-md shadow-spa-rose/25"
            >
              <Sparkles className="h-4 w-4" />
              <span>Ir a mi Panel de Control</span>
            </Button>
          </Link>
          <Button
            onClick={() => {
              reset();
              setFormData({ email: '', password: '', userType });
            }}
            variant="outline"
            size="sm"
          >
            Cambiar de cuenta
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Credenciales incorrectas o error de inicio</p>
            <p className="text-xs mt-0.5">{error.message}</p>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor={`email-${userType || 'all'}`} required>
          Correo Electrónico
        </Label>
        <div className="mt-1.5">
          <Input
            id={`email-${userType || 'all'}`}
            type="email"
            placeholder={
              userType === 'WORKER' ? 'tu.nombre@gmail.com' : 'contacto@spabienestar.com'
            }
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
            disabled={isPending}
            autoComplete="email"
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor={`password-${userType || 'all'}`} required>
            Contraseña
          </Label>
        </div>
        <div className="mt-1.5">
          <Input
            id={`password-${userType || 'all'}`}
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={formErrors.password}
            disabled={isPending}
            autoComplete="current-password"
          />
        </div>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          className="w-full h-11 text-base font-semibold shadow-md gap-2"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Iniciando sesión...</span>
            </>
          ) : (
            <>
              <LogIn className="h-4 w-4" />
              <span>Iniciar Sesión</span>
              <ArrowRight className="h-4 w-4 ml-auto" />
            </>
          )}
        </Button>
      </div>

      <div className="text-center pt-2">
        <p className="text-xs text-muted-foreground">
          ¿No tienes una cuenta?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </form>
  );
}
