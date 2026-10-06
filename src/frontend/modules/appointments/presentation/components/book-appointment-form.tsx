'use client';

import * as React from 'react';
import { useCurrentUser } from '@/src/frontend/modules/auth/application/use-current-user';
import { useAppointmentFormData } from '../../application/use-appointment-form-data';
import { useCreateAppointment } from '../../application/use-create-appointment';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Textarea } from '@/src/components/ui/textarea';
import { Badge } from '@/src/components/ui/badge';
import { DatePicker } from '@/src/components/ui/date-picker';
import {
  CalendarPlus,
  Calendar,
  Clock,
  User,
  Scissors,
  DollarSign,
  FileText,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface BookAppointmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function BookAppointmentForm({
  onSuccess,
  onCancel,
}: BookAppointmentFormProps) {
  const { user } = useCurrentUser();
  const isOwner = user?.role === 'BUSINESS_OWNER' || user?.userType === 'BUSINESS';
  const businessId = user?.businessId;

  const { clients, services, workers, isLoading: isFormDataLoading } = useAppointmentFormData(businessId);
  const { mutate, isPending, error } = useCreateAppointment();

  // Form states
  const [clientId, setClientId] = React.useState<string>('');
  const [serviceId, setServiceId] = React.useState<string>('');
  const [workerId, setWorkerId] = React.useState<string>(!isOwner && user?.id ? user.id : '');
  const [scheduledAtDate, setScheduledAtDate] = React.useState<Date>(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now;
  });
  const [timeValue, setTimeValue] = React.useState<string>(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  });
  const [durationMinutes, setDurationMinutes] = React.useState<number>(60);
  const [price, setPrice] = React.useState<number>(0);
  const [notes, setNotes] = React.useState<string>('');
  const [validationError, setValidationError] = React.useState<string | null>(null);

  const handleTimeChange = (newTimeStr: string) => {
    setTimeValue(newTimeStr);
    if (!newTimeStr) return;
    const [h, m] = newTimeStr.split(':').map(Number);
    setScheduledAtDate((prev) => {
      const updated = new Date(prev);
      updated.setHours(h || 0, m || 0, 0, 0);
      return updated;
    });
  };

  const handleDateChange = (newDate: Date) => {
    const [h, m] = timeValue.split(':').map(Number);
    newDate.setHours(h || 10, m || 0, 0, 0);
    setScheduledAtDate(newDate);
  };

  // When a service is picked, automatically populate price and duration
  const handleServiceChange = (selectedServiceId: string) => {
    setServiceId(selectedServiceId);
    if (!selectedServiceId) return;

    const found = services.find((s) => s.id === selectedServiceId);
    if (found) {
      if (found.price !== undefined && found.price !== null) {
        setPrice(Number(found.price));
      }
      if (found.durationMinutes) {
        setDurationMinutes(Number(found.durationMinutes));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!businessId) {
      setValidationError('No se encontró el identificador del Spa.');
      return;
    }

    if (!clientId) {
      setValidationError('Por favor selecciona un cliente para la cita.');
      return;
    }

    if (!scheduledAtDate || isNaN(scheduledAtDate.getTime())) {
      setValidationError('Por favor selecciona una fecha y hora válidas en el selector de fecha.');
      return;
    }

    // Role assignment logic:
    // If worker: workerId is strictly user.id
    // If owner: workerId is selected workerId or null
    const finalWorkerId = !isOwner ? user?.id : workerId || null;

    mutate(
      {
        businessId,
        clientId,
        workerId: finalWorkerId,
        serviceId: serviceId || null,
        scheduledAt: scheduledAtDate.toISOString(),
        durationMinutes: Number(durationMinutes) || 60,
        price: Number(price) || 0,
        notes: notes.trim() || null,
      },
      {
        onSuccess: () => {
          // Immediately switch back to the appointments table view as requested
          onSuccess();
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Return back button */}
      <div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors group cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Volver a la Lista de Citas</span>
        </button>
      </div>

      <Card className="border-border/80 shadow-xl overflow-hidden">
        <CardHeader className="text-center pb-4 border-b border-border/60 bg-muted/30">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-spa-rose to-spa-blush text-white shadow-lg shadow-spa-rose/25 mb-3">
            <CalendarPlus className="h-6 w-6" />
          </div>

          <div className="flex justify-center mb-1">
            <Badge variant="spa" className="text-xs gap-1.5 font-semibold">
              <Sparkles className="h-3 w-3" />
              <span>{isOwner ? 'Reserva desde Gerencia' : 'Reserva de Colaboradora'}</span>
            </Badge>
          </div>

          <CardTitle className="text-2xl font-serif font-bold text-foreground">
            Agendar Nueva Cita
          </CardTitle>
          <CardDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
            {isOwner
              ? 'Agenda una cita para cualquier colaboradora de tu spa o déjala como reserva general del negocio.'
              : `Agenda una nueva cita asignada a tu cuenta de colaboradora (${user?.name}).`}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {validationError && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3.5 text-xs text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error.message || 'Error al agendar la cita. Por favor verifica los datos.'}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Cliente: Select con nombre y número al frente como se solicitó */}
            <div className="space-y-1.5">
              <Label htmlFor="clientId" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-spa-rose" />
                <span>Cliente <span className="text-destructive">*</span></span>
              </Label>
              <select
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={isPending || isFormDataLoading}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-spa-rose/30 transition-shadow disabled:opacity-50"
                required
              >
                <option value="">-- Selecciona un cliente --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} - {c.phone}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-muted-foreground">
                Selecciona al cliente registrado que asistirá a la sesión.
              </p>
            </div>

            {/* 2. Servicio del Catálogo */}
            <div className="space-y-1.5">
              <Label htmlFor="serviceId" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Scissors className="h-3.5 w-3.5 text-spa-rose" />
                <span>Servicio (Opcional)</span>
              </Label>
              <select
                id="serviceId"
                value={serviceId}
                onChange={(e) => handleServiceChange(e.target.value)}
                disabled={isPending || isFormDataLoading}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-spa-rose/30 transition-shadow disabled:opacity-50"
              >
                <option value="">-- Servicio General / Sin especificar --</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.category ? `(${s.category})` : ''} - ${Number(s.price).toLocaleString()}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Colaboradora / Asignación */}
            {isOwner ? (
              <div className="space-y-1.5">
                <Label htmlFor="workerId" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-spa-sage" />
                  <span>Especialista / Colaboradora Asignada</span>
                </Label>
                <select
                  id="workerId"
                  value={workerId}
                  onChange={(e) => setWorkerId(e.target.value)}
                  disabled={isPending || isFormDataLoading}
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-spa-rose/30 transition-shadow disabled:opacity-50"
                >
                  <option value="">Sin asignar / Reserva general del Spa</option>
                  {workers.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.firstName} {w.lastName} {w.specialty ? `(${w.specialty})` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-muted-foreground">
                  Como dueña de spa, puedes asignar una colaboradora específica o registrar la cita con el identificador del spa.
                </p>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-spa-sage/10 border border-spa-sage/20 text-xs">
                <div className="flex items-center gap-2 font-medium text-foreground">
                  <User className="h-4 w-4 text-spa-sage" />
                  <span>Cita asignada a: <strong>{user?.name}</strong> (Tu cuenta)</span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Al agendar como colaboradora, la cita queda registrada y asociada automáticamente a tu identificador de trabajadora.
                </p>
              </div>
            )}

            {/* 4. Fecha y Hora */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fecha con Shadcn UI DatePicker */}
              <div className="space-y-1.5">
                <Label htmlFor="scheduledDate" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-spa-rose" />
                  <span>Fecha de la Cita <span className="text-destructive">*</span></span>
                </Label>
                <DatePicker
                  value={scheduledAtDate}
                  onChange={handleDateChange}
                  includeTime={false}
                  disabled={isPending}
                  minDate={new Date()}
                />
                <p className="text-[11px] text-muted-foreground">
                  Selecciona en el calendario interactivo el día de la sesión.
                </p>
              </div>

              {/* Hora de Inicio con control directo y atajos */}
              <div className="space-y-1.5">
                <Label htmlFor="timePicker" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-spa-rose" />
                  <span>Hora de Inicio <span className="text-destructive">*</span></span>
                </Label>
                <Input
                  id="timePicker"
                  type="time"
                  value={timeValue}
                  onChange={(e) => handleTimeChange(e.target.value)}
                  disabled={isPending}
                  required
                  className="text-xs sm:text-sm font-mono h-10 border-input focus:border-spa-rose focus:ring-spa-rose/30"
                />
                {/* Atajos de hora con colores del spa */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  <span className="text-[10px] text-muted-foreground mr-0.5">Rápido:</span>
                  {['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00'].map((slot) => {
                    const isSelected = timeValue === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleTimeChange(slot)}
                        disabled={isPending}
                        className={`text-[11px] px-2 py-0.5 rounded-md font-mono font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-spa-rose text-white font-bold shadow-xs'
                            : 'bg-muted/70 hover:bg-spa-rose/15 hover:text-spa-rose text-foreground'
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 5. Duración y Tarifa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Duración */}
              <div className="space-y-1.5">
                <Label htmlFor="durationMinutes" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-spa-gold" />
                  <span>Duración (minutos)</span>
                </Label>
                <Input
                  id="durationMinutes"
                  type="number"
                  min="5"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  disabled={isPending}
                  className="text-xs sm:text-sm"
                />
              </div>

              {/* Tarifa */}
              <div className="space-y-1.5">
                <Label htmlFor="price" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Tarifa / Precio Acordado</span>
                </Label>
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="1000"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  disabled={isPending}
                  placeholder="0"
                  className="text-xs sm:text-sm"
                />
              </div>
            </div>

            {/* 6. Notas Adicionales */}
            <div className="space-y-1.5">
              <Label htmlFor="notes" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5 text-spa-rose" />
                <span>Notas o Preferencias del Cliente (Opcional)</span>
              </Label>
              <Textarea
                id="notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isPending}
                placeholder="Ej: Cliente prefiere masaje relajante con aceite de lavanda..."
                className="text-xs sm:text-sm resize-none"
              />
            </div>

            {/* Acciones */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <Button
                type="submit"
                disabled={isPending || isFormDataLoading}
                className="w-full sm:flex-1 gap-2 bg-gradient-to-r from-spa-rose to-spa-blush text-white hover:opacity-90 shadow-md shadow-spa-rose/25"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Guardando Cita...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Confirmar y Agendar Cita</span>
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isPending}
                className="w-full sm:w-auto"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
