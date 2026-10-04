'use client';

import * as React from 'react';
import { useRegisterWorker } from '../../application/use-register-worker';
import { RegisterWorkerFormValues } from '../../domain/auth.types';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Sparkles, UserCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function RegisterWorkerForm() {
  const [formData, setFormData] = React.useState<RegisterWorkerFormValues>({
    businessId: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    specialty: '',
    commissionPercentage: 0,
  });

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const { mutate, isPending, isSuccess, data, error, reset } = useRegisterWorker();

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.businessId.trim()) {
      errors.businessId = 'El UUID del spa o negocio es obligatorio';
    }
    if (!formData.firstName.trim() || formData.firstName.length < 2) {
      errors.firstName = 'El nombre debe tener al menos 2 caracteres';
    }
    if (!formData.lastName.trim() || formData.lastName.length < 2) {
      errors.lastName = 'El apellido debe tener al menos 2 caracteres';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = 'Introduce un correo electrónico válido';
    }
    if (!formData.phone.trim() || formData.phone.length < 7) {
      errors.phone = 'Introduce un teléfono válido (mínimo 7 caracteres)';
    }
    if (!formData.password || formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutate(formData);
  };

  if (isSuccess && data) {
    return (
      <div className="rounded-2xl bg-spa-sage/10 p-8 text-center border border-spa-sage/20 animate-in fade-in duration-300">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-spa-sage/20 text-spa-sage mb-4 shadow-sm">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h4 className="text-xl font-bold text-foreground">
          ¡Trabajadora registrada con éxito!
        </h4>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Bienvenida, <strong>{data.user.name}</strong>. Has sido vinculada al spa y tu sesión está lista con rol <strong>WORKER</strong>.
        </p>

        <div className="mt-6 p-4 rounded-xl bg-card border border-border text-left text-xs space-y-1">
          <p className="text-muted-foreground">
            <strong>ID de Trabajadora:</strong> <code className="text-spa-sage select-all font-mono">{data.user.id}</code>
          </p>
          <p className="text-muted-foreground">
            <strong>ID del Spa asociado:</strong> <code className="text-foreground select-all font-mono">{data.user.businessId}</code>
          </p>
          <p className="text-muted-foreground">
            <strong>Email:</strong> {data.user.email}
          </p>
          <p className="text-muted-foreground">
            <strong>Rol:</strong> <span className="inline-block px-2 py-0.5 rounded-full bg-spa-sage/15 text-spa-sage text-[10px] font-semibold">{data.user.role}</span>
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => {
              reset();
              setFormData({
                businessId: '',
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                confirmPassword: '',
                phone: '',
                specialty: '',
                commissionPercentage: 0,
              });
            }}
            variant="outline"
            size="sm"
          >
            Registrar otra trabajadora
          </Button>
          <Button
            onClick={() => window.location.href = '/docs'}
            size="sm"
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Explorar API
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
            <p className="font-semibold">Error al registrar la trabajadora</p>
            <p className="text-xs mt-0.5">{error.message}</p>
          </div>
        </div>
      )}

      {/* UUID del Spa */}
      <div>
        <Label htmlFor="worker-biz-id" required>ID del Spa o Negocio (UUID)</Label>
        <div className="mt-1.5">
          <Input
            id="worker-biz-id"
            placeholder="Ej. a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
            value={formData.businessId}
            onChange={(e) => setFormData({ ...formData, businessId: e.target.value })}
            error={formErrors.businessId}
            disabled={isPending}
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Pide al dueño o administrador del spa el identificador de su negocio.
          </p>
        </div>
      </div>

      {/* Nombre y Apellido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="worker-first-name" required>Nombres</Label>
          <div className="mt-1.5">
            <Input
              id="worker-first-name"
              placeholder="Ej. Camila"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              error={formErrors.firstName}
              disabled={isPending}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="worker-last-name" required>Apellidos</Label>
          <div className="mt-1.5">
            <Input
              id="worker-last-name"
              placeholder="Ej. Gómez"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              error={formErrors.lastName}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Email y Teléfono */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="worker-email" required>Correo Electrónico (Login)</Label>
          <div className="mt-1.5">
            <Input
              id="worker-email"
              type="email"
              placeholder="camila.terapeuta@gmail.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
              disabled={isPending}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="worker-phone" required>Teléfono / Celular</Label>
          <div className="mt-1.5">
            <Input
              id="worker-phone"
              type="tel"
              placeholder="+57 312 987 6543"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              error={formErrors.phone}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Contraseñas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="worker-password" required>Contraseña</Label>
          <div className="mt-1.5">
            <Input
              id="worker-password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              error={formErrors.password}
              disabled={isPending}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="worker-confirm" required>Confirmar Contraseña</Label>
          <div className="mt-1.5">
            <Input
              id="worker-confirm"
              type="password"
              placeholder="Repite la contraseña"
              value={formData.confirmPassword || ''}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              error={formErrors.confirmPassword}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Especialidad y Comisión */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="worker-specialty">Especialidad</Label>
          <div className="mt-1.5">
            <Input
              id="worker-specialty"
              placeholder="Ej. Masoterapeuta, Cosmiatra"
              value={formData.specialty || ''}
              onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              disabled={isPending}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="worker-commission">Comisión pactada (%)</Label>
          <div className="mt-1.5">
            <Input
              id="worker-commission"
              type="number"
              min={0}
              max={100}
              step={0.5}
              placeholder="Ej. 30"
              value={formData.commissionPercentage !== undefined ? formData.commissionPercentage : ''}
              onChange={(e) => setFormData({ ...formData, commissionPercentage: Number(e.target.value) })}
              disabled={isPending}
            />
          </div>
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
              <span>Registrando trabajadora...</span>
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4" />
              <span>Registrarme como Trabajadora</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
