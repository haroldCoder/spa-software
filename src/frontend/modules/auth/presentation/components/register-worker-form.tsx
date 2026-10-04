'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useRegisterWorker } from '../../application/use-register-worker';
import { useCurrentUser } from '../../application/use-current-user';
import { RegisterWorkerFormValues } from '../../domain/auth.types';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { UserCheck, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface RegisterWorkerFormProps {
  fixedBusinessId?: string;
  onSuccessRedirect?: string;
}

export function RegisterWorkerForm({
  fixedBusinessId,
  onSuccessRedirect = '/dashboard',
}: RegisterWorkerFormProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const ownerBusinessId = fixedBusinessId || user?.businessId || '';

  const [formData, setFormData] = React.useState<Omit<RegisterWorkerFormValues, 'businessId' | 'commissionPercentage'>>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    specialty: '',
  });

  // Commission as string state to prevent the "010" leading zero bug
  const [commissionInput, setCommissionInput] = React.useState<string>('');

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const { mutate, isPending, isSuccess, error } = useRegisterWorker();

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!ownerBusinessId.trim()) {
      errors.general = 'No se encontró el ID del Spa. Inicia sesión como dueño de spa para continuar.';
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

    if (commissionInput !== '') {
      const parsedComm = Number(commissionInput);
      if (isNaN(parsedComm) || parsedComm < 0 || parsedComm > 100) {
        errors.commission = 'La comisión debe ser un número entre 0 y 100';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const parsedCommission = commissionInput.trim() === '' ? 0 : Number(commissionInput);

    mutate(
      {
        ...formData,
        commissionPercentage: parsedCommission,
        businessId: ownerBusinessId,
      },
      {
        onSuccess: () => {
          // Invalidate workers cache so dashboard updates immediately
          queryClient.invalidateQueries({ queryKey: ['businessWorkers'] });
          // Redirect owner back to the dashboard / home panel
          router.push(onSuccessRedirect);
        },
      }
    );
  };

  if (isSuccess) {
    return (
      <div className="rounded-2xl bg-spa-sage/10 p-8 text-center border border-spa-sage/20 animate-in fade-in duration-300">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-spa-sage/20 text-spa-sage mb-4 shadow-sm">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h4 className="text-xl font-bold text-foreground">
          ¡Trabajadora registrada con éxito!
        </h4>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Redirigiendo al panel de control de tu Spa...
        </p>
        <div className="mt-4 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-spa-sage" />
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formErrors.general && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="font-semibold">{formErrors.general}</p>
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error al registrar la trabajadora</p>
            <p className="text-xs mt-0.5">{error.message}</p>
          </div>
        </div>
      )}

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
          <Label htmlFor="worker-email" required>Correo Electrónico (Login Trabajadora)</Label>
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
              value={commissionInput}
              onChange={(e) => setCommissionInput(e.target.value)}
              error={formErrors.commission}
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
              <span>Registrando colaboradora...</span>
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4" />
              <span>Registrar y Vincular Trabajadora</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
