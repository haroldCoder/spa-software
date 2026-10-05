'use client';

import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { User } from 'lucide-react';
import { ClientFormData } from '../../application/use-register-client-form';

export interface ClientPersonalInfoFieldsProps {
  formData: ClientFormData;
  formErrors: Record<string, string>;
  disabled?: boolean;
  onChange: (field: keyof ClientFormData, value: string) => void;
}

export function ClientPersonalInfoFields({
  formData,
  formErrors,
  disabled = false,
  onChange,
}: ClientPersonalInfoFieldsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-1 border-b border-border/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <User className="h-3.5 w-3.5 text-spa-rose" />
        <span>Información Personal</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="client-first-name" required>Nombres</Label>
          <div className="mt-1.5">
            <Input
              id="client-first-name"
              placeholder="Ej. Valentina"
              value={formData.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
              error={formErrors.firstName}
              disabled={disabled}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="client-last-name" required>Apellidos</Label>
          <div className="mt-1.5">
            <Input
              id="client-last-name"
              placeholder="Ej. Herrera"
              value={formData.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
              error={formErrors.lastName}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="client-phone" required>Teléfono / Celular (WhatsApp)</Label>
          <div className="mt-1.5">
            <Input
              id="client-phone"
              type="tel"
              placeholder="+57 300 123 4567"
              value={formData.phone}
              onChange={(e) => onChange('phone', e.target.value)}
              error={formErrors.phone}
              disabled={disabled}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="client-email">Correo Electrónico (Opcional)</Label>
          <div className="mt-1.5">
            <Input
              id="client-email"
              type="email"
              placeholder="cliente@ejemplo.com"
              value={formData.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              error={formErrors.email}
              disabled={disabled}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="client-id-number">Documento de Identidad (Opcional)</Label>
          <div className="mt-1.5">
            <Input
              id="client-id-number"
              placeholder="CC / DNI / Pasaporte"
              value={formData.identificationNumber || ''}
              onChange={(e) => onChange('identificationNumber', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="client-birthdate">Fecha de Nacimiento (Opcional)</Label>
          <div className="mt-1.5">
            <Input
              id="client-birthdate"
              type="date"
              value={formData.birthDate || ''}
              onChange={(e) => onChange('birthDate', e.target.value)}
              disabled={disabled}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
