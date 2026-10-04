'use client';

import * as React from 'react';
import { useRegisterBusiness } from '../../application/use-register-business';
import { RegisterBusinessFormValues } from '../../domain/auth.types';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Sparkles, Building2, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export function RegisterBusinessForm() {
  const [formData, setFormData] = React.useState<RegisterBusinessFormValues>({
    name: '',
    legalName: '',
    taxId: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: '',
    city: '',
    country: 'CO',
    currency: 'COP',
  });

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const { mutate, isPending, isSuccess, data, error, reset } = useRegisterBusiness();

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim() || formData.name.length < 2) {
      errors.name = 'El nombre del spa debe tener al menos 2 caracteres';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errors.email = 'Introduce un correo electrónico válido';
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
          ¡Spa registrado con éxito!
        </h4>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Bienvenido a <strong>{data.user.name}</strong>. Tu sesión como Administrador ha sido iniciada automáticamente con JWT y sesión segura.
        </p>

        <div className="mt-6 p-4 rounded-xl bg-card border border-border text-left text-xs space-y-1">
          <p className="text-muted-foreground">
            <strong>ID del Spa:</strong> <code className="text-spa-sage select-all font-mono">{data.user.id}</code>
          </p>
          <p className="text-muted-foreground">
            <strong>Email:</strong> {data.user.email}
          </p>
          <p className="text-muted-foreground">
            <strong>Rol:</strong> <span className="inline-block px-2 py-0.5 rounded-full bg-spa-rose/15 text-spa-rose text-[10px] font-semibold">{data.user.role}</span>
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => {
              reset();
              setFormData({
                name: '',
                legalName: '',
                taxId: '',
                email: '',
                password: '',
                confirmPassword: '',
                phone: '',
                address: '',
                city: '',
                country: 'CO',
                currency: 'COP',
              });
            }}
            variant="outline"
            size="sm"
          >
            Registrar otro negocio
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
            <p className="font-semibold">Error al registrar el spa</p>
            <p className="text-xs mt-0.5">{error.message}</p>
          </div>
        </div>
      )}

      {/* Nombre del Spa */}
      <div>
        <Label htmlFor="biz-name" required>Nombre Comercial del Spa</Label>
        <div className="mt-1.5">
          <Input
            id="biz-name"
            placeholder="Ej. Spa Bienestar & Armonía"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            disabled={isPending}
          />
        </div>
      </div>

      {/* Razón Social & NIT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="biz-legal">Razón Social</Label>
          <div className="mt-1.5">
            <Input
              id="biz-legal"
              placeholder="Ej. Bienestar Integral S.A.S"
              value={formData.legalName || ''}
              onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
              disabled={isPending}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="biz-tax">NIT / Identificación Tributaria</Label>
          <div className="mt-1.5">
            <Input
              id="biz-tax"
              placeholder="Ej. 900.123.456-7"
              value={formData.taxId || ''}
              onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Correo y Teléfono */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="biz-email" required>Correo Electrónico (Login Spa)</Label>
          <div className="mt-1.5">
            <Input
              id="biz-email"
              type="email"
              placeholder="contacto@spabienestar.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
              disabled={isPending}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="biz-phone">Teléfono de Contacto</Label>
          <div className="mt-1.5">
            <Input
              id="biz-phone"
              type="tel"
              placeholder="+57 300 123 4567"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* Contraseñas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="biz-password" required>Contraseña</Label>
          <div className="mt-1.5">
            <Input
              id="biz-password"
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
          <Label htmlFor="biz-confirm" required>Confirmar Contraseña</Label>
          <div className="mt-1.5">
            <Input
              id="biz-confirm"
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

      {/* Dirección y Ciudad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="biz-address">Dirección</Label>
          <div className="mt-1.5">
            <Input
              id="biz-address"
              placeholder="Calle 10 # 43A - 50"
              value={formData.address || ''}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={isPending}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="biz-city">Ciudad</Label>
          <div className="mt-1.5">
            <Input
              id="biz-city"
              placeholder="Medellín, Bogotá, etc."
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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
              <span>Registrando spa...</span>
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4" />
              <span>Registrar Spa & Crear Cuenta</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
