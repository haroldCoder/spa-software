'use client';

import { CheckCircle2, Loader2 } from 'lucide-react';

export interface ClientSuccessFeedbackProps {
  clientFullName: string;
}

export function ClientSuccessFeedback({ clientFullName }: ClientSuccessFeedbackProps) {
  return (
    <div className="rounded-2xl bg-spa-sage/10 p-8 text-center border border-spa-sage/20 animate-in fade-in duration-300">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-spa-sage/20 text-spa-sage mb-4 shadow-sm">
        <CheckCircle2 className="h-8 w-8" />
      </div>
      <h4 className="text-xl font-serif font-bold text-foreground">
        ¡Cliente registrado con éxito!
      </h4>
      <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
        <strong className="text-foreground">{clientFullName}</strong> ya forma parte de la cartera de clientes de tu Spa.
      </p>
      <div className="mt-5 flex items-center justify-center gap-2 text-xs text-spa-sage font-medium">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Redirigiendo al panel de control...</span>
      </div>
    </div>
  );
}
