'use client';

interface WhatsAppWebhookGuideProps {
  webhookUrl: string;
  businessId?: string;
  workerId?: string;
}

export function WhatsAppWebhookGuide({
  webhookUrl,
  businessId,
  workerId,
}: WhatsAppWebhookGuideProps) {
  const exampleBusinessId = businessId || 'biz_ejemplo_123';
  const exampleWorkerId = workerId || 'worker_ejemplo_456';

  const codeSnippet = `// Ejemplo de envío desde la extensión (fetch):
await fetch('${webhookUrl}', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'x-business-id': '${exampleBusinessId}', // opcional en header o en el body
    'x-worker-id': '${exampleWorkerId}'
  },
  body: JSON.stringify({
    nombre: "Camila Torres",
    numero: "573001234567",
    mensaje: "Hola! Me gustaría consultar por el paquete de spa relajante",
    workerId: "${exampleWorkerId}",
    businessId: "${exampleBusinessId}",
    fromMe: false // false = cliente, true = nosotros
  })
});`;

  return (
    <div className="mt-4 pt-4 border-t border-border/60 text-xs animate-in fade-in duration-200">
      <p className="font-semibold text-foreground mb-1">
        Campos que la extensión del navegador debe enviar:
      </p>
      <p className="text-muted-foreground mb-2">
        El webhook acepta peticiones <code className="text-spa-rose font-mono">POST</code> con cuerpo JSON individual o un array de mensajes:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 mb-3">
        <div className="p-2.5 rounded-xl bg-background border border-border">
          <span className="font-semibold text-spa-rose block font-mono">nombre</span>
          <span className="text-[11px] text-muted-foreground">Nombre del contacto o remitente en WhatsApp.</span>
        </div>
        <div className="p-2.5 rounded-xl bg-background border border-border">
          <span className="font-semibold text-spa-rose block font-mono">numero</span>
          <span className="text-[11px] text-muted-foreground">Número de contacto (con o sin indicativo).</span>
        </div>
        <div className="p-2.5 rounded-xl bg-background border border-border">
          <span className="font-semibold text-spa-rose block font-mono">mensaje</span>
          <span className="text-[11px] text-muted-foreground">Texto completo del mensaje recibido/enviado.</span>
        </div>
        <div className="p-2.5 rounded-xl bg-background border border-border">
          <span className="font-semibold text-emerald-600 block font-mono">workerId</span>
          <span className="text-[11px] text-muted-foreground">ID de la colaboradora que captura el mensaje.</span>
        </div>
        <div className="p-2.5 rounded-xl bg-background border border-border">
          <span className="font-semibold text-emerald-600 block font-mono">businessId</span>
          <span className="text-[11px] text-muted-foreground">ID del negocio o spa al que pertenece.</span>
        </div>
      </div>

      <pre className="p-3 rounded-xl bg-background/90 text-foreground border border-border text-[11px] font-mono overflow-x-auto">
        {codeSnippet}
      </pre>
    </div>
  );
}
