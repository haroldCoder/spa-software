'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useRegisterClient } from './use-register-client';
import { RegisterClientFormValues, ClientItem } from '../domain/client.types';

export interface UseRegisterClientFormProps {
  businessId: string;
  fixedWorkerId?: string | null;
  onSuccessRedirect?: string;
  onSuccess?: (client: ClientItem) => void;
}

export type ClientFormData = Omit<RegisterClientFormValues, 'businessId'>;

export function useRegisterClientForm({
  businessId,
  fixedWorkerId,
  onSuccessRedirect = '/dashboard',
  onSuccess,
}: UseRegisterClientFormProps) {
  const router = useRouter();

  const [formData, setFormData] = React.useState<ClientFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    identificationNumber: '',
    birthDate: '',
    primaryWorkerId: fixedWorkerId || '',
    notes: '',
  });

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const { mutate, isPending, isSuccess, data: createdClient, error } = useRegisterClient();

  const updateField = React.useCallback(
    (field: keyof ClientFormData, value: string | null) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      // Clear field error on edit
      setFormErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    []
  );

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!businessId?.trim()) {
      errors.general = 'No se encontró el ID del Spa. Por favor inicia sesión nuevamente.';
    }

    if (!formData.firstName.trim() || formData.firstName.trim().length < 2) {
      errors.firstName = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.lastName.trim() || formData.lastName.trim().length < 2) {
      errors.lastName = 'El apellido debe tener al menos 2 caracteres';
    }

    if (!formData.phone.trim() || formData.phone.trim().length < 7) {
      errors.phone = 'Introduce un número de teléfono válido (mínimo 7 caracteres)';
    }

    if (formData.email && formData.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = 'Introduce un correo electrónico válido o déjalo vacío';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    mutate(
      {
        businessId,
        values: {
          ...formData,
          businessId,
          primaryWorkerId: formData.primaryWorkerId || null,
          email: formData.email?.trim() || null,
          identificationNumber: formData.identificationNumber?.trim() || null,
          birthDate: formData.birthDate || null,
          notes: formData.notes?.trim() || null,
        },
      },
      {
        onSuccess: (client) => {
          if (onSuccess) {
            onSuccess(client);
          }
          if (onSuccessRedirect) {
            setTimeout(() => {
              router.push(onSuccessRedirect);
            }, 1200);
          }
        },
      }
    );
  };

  return {
    formData,
    formErrors,
    updateField,
    handleSubmit,
    isPending,
    isSuccess,
    createdClient,
    error,
  };
}
