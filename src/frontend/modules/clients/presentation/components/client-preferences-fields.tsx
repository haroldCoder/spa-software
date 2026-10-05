'use client';

import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { HeartHandshake } from 'lucide-react';
import { ClientFormData } from '../../application/use-register-client-form';

export interface WorkerOption {
  id: string;
  firstName: string;
  lastName: string;
  specialty?: string;
}

export interface ClientPreferencesFieldsProps {
  formData: ClientFormData;
  workers?: WorkerOption[];
  fixedWorkerId?: string | null;
  disabled?: boolean;
  onChange: (field: keyof ClientFormData, value: string | null) => void;
}

export function ClientPreferencesFields({
  formData,
  workers = [],
  fixedWorkerId,
  disabled = false,
  onChange,
}: ClientPreferencesFieldsProps) {
  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center gap-2 pb-1 border-b border-border/50 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <HeartHandshake className="h-3.5 w-3.5 text-spa-sage" />
        <span>Atención y Terapeuta de Preferencia</span>
      </div>

      <div>
        <Label htmlFor="client-primary-worker">Profesional o Terapeuta Asignada (Opcional)</Label>
        <div className="mt-1.5">
          <select
            id="client-primary-worker"
            className="flex h-11 w-full rounded-xl border border-input bg-card/60 px-3.5 py-2 text-sm text-foreground shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            value={formData.primaryWorkerId || ''}
            onChange={(e) => onChange('primaryWorkerId', e.target.value || null)}
            disabled={disabled || !!fixedWorkerId}
          >
            <option value="">-- Sin terapeuta preferida / Asignación libre --</option>
            {workers.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.firstName} {worker.lastName}
                {worker.specialty ? ` (${worker.specialty})` : ''}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Puedes vincular este cliente a una especialista específica para facilitar el seguimiento de sus citas y tratamientos.
          </p>
        </div>
      </div>

      <div>
        <Label htmlFor="client-notes">Observaciones, Alergias y Preferencias</Label>
        <div className="mt-1.5">
          <Textarea
            id="client-notes"
            placeholder="Ej. Piel sensible, alérgica a aceites esenciales de cítricos, prefiere masajes relajantes de presión suave..."
            value={formData.notes || ''}
            onChange={(e) => onChange('notes', e.target.value)}
            disabled={disabled}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
