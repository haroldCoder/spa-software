'use client';

import { useRegisterClientForm } from '../../application/use-register-client-form';
import { ClientItem } from '../../domain/client.types';
import { ClientPersonalInfoFields } from './client-personal-info-fields';
import { ClientPreferencesFields, WorkerOption } from './client-preferences-fields';
import { ClientSuccessFeedback } from './client-success-feedback';
import { Button } from '@/src/components/ui/button';
import { APP_ROUTES } from '@/src/frontend/shared/constants/routes';
import { UserCheck, AlertCircle, Loader2 } from 'lucide-react';

export type { WorkerOption };

export interface RegisterClientFormProps {
  businessId: string;
  fixedWorkerId?: string | null;
  workers?: WorkerOption[];
  onSuccessRedirect?: string;
  onSuccess?: (client: ClientItem) => void;
}

export function RegisterClientForm({
  businessId,
  fixedWorkerId,
  workers = [],
  onSuccessRedirect = APP_ROUTES.DASHBOARD.ROOT,
  onSuccess,
}: RegisterClientFormProps) {
  const {
    formData,
    formErrors,
    updateField,
    handleSubmit,
    isPending,
    isSuccess,
    createdClient,
    error,
  } = useRegisterClientForm({
    businessId,
    fixedWorkerId,
    onSuccessRedirect,
    onSuccess,
  });

  if (isSuccess && createdClient) {
    return <ClientSuccessFeedback clientFullName={createdClient.fullName} />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Global Validation Error */}
      {formErrors.general && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <p className="font-semibold">{formErrors.general}</p>
        </div>
      )}

      {/* Server Mutation Error */}
      {error && (
        <div className="rounded-xl bg-destructive/10 p-4 text-sm text-destructive border border-destructive/20 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Error al registrar el cliente</p>
            <p className="text-xs mt-0.5">{error.message}</p>
          </div>
        </div>
      )}

      {/* Subcomponent 1: Datos Personales */}
      <ClientPersonalInfoFields
        formData={formData}
        formErrors={formErrors}
        disabled={isPending}
        onChange={updateField}
      />

      {/* Subcomponent 2: Terapeuta Preferida y Observaciones Clínicas */}
      <ClientPreferencesFields
        formData={formData}
        workers={workers}
        fixedWorkerId={fixedWorkerId}
        disabled={isPending}
        onChange={updateField}
      />

      {/* Botón de Envío */}
      <div className="pt-3">
        <Button
          type="submit"
          className="w-full h-11 text-base font-semibold shadow-md gap-2"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Registrando cliente en el Spa...</span>
            </>
          ) : (
            <>
              <UserCheck className="h-4 w-4" />
              <span>Guardar y Registrar Cliente</span>
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
