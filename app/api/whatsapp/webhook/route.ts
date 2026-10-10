import { NextRequest, NextResponse } from 'next/server';
import { localWhatsAppRepository } from '@/src/modules/whatsapp/infrastructure/persistence/local-file-whatsapp.repository';
import { ProcessWhatsAppExtensionWebhookUseCase } from '@/src/modules/whatsapp/application/use-cases/process-whatsapp-extension-webhook.use-case';
import { ClearLocalWhatsAppUseCase } from '@/src/modules/whatsapp/application/use-cases/clear-local-whatsapp-data.use-case';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, x-business-id, x-worker-id, x-user-id',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

/**
 * POST /api/whatsapp/webhook
 * Receives messages/contacts captured by browser extension or test scripts.
 * Supports:
 * - Single item: { nombre: "...", numero: "...", mensaje: "...", workerId: "...", businessId: "..." }
 * - Array: [ { nombre: "...", numero: "...", mensaje: "..." }, ... ]
 * - Object with messages: { businessId: "...", workerId: "...", messages: [...] }
 * - Headers: x-business-id, x-worker-id
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const businessId =
      req.nextUrl.searchParams.get('businessId') ||
      req.headers.get('x-business-id') ||
      req.headers.get('business-id') ||
      undefined;

    const workerId =
      req.nextUrl.searchParams.get('workerId') ||
      req.headers.get('x-worker-id') ||
      req.headers.get('worker-id') ||
      req.headers.get('x-user-id') ||
      undefined;

    const useCase = new ProcessWhatsAppExtensionWebhookUseCase(localWhatsAppRepository);
    const result = await useCase.execute(body, {
      businessId,
      workerId,
    });

    if (!result.success) {
      return NextResponse.json(result, {
        status: 400,
        headers: corsHeaders,
      });
    }

    return NextResponse.json(result, {
      status: 200,
      headers: corsHeaders,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[API WhatsApp Webhook] Error processing incoming payload:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Error al procesar los datos del webhook.',
        error: err?.message || 'Unknown error',
      },
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

/**
 * GET /api/whatsapp/webhook
 * Health check & stats for browser extension configuration.
 */
export async function GET() {
  try {
    const stats = await localWhatsAppRepository.getStats();

    return NextResponse.json(
      {
        status: 'online',
        mode: 'file_storage',
        storagePath: localWhatsAppRepository.getStoragePath(),
        stats,
        payloadDocumentation: {
          description: 'Envía peticiones POST con JSON al webhook con los siguientes campos:',
          requiredFields: {
            nombre: 'Nombre del contacto o remitente (ej: "Camila Torres")',
            numero: 'Número de WhatsApp con indicativo o sin él (ej: "573001234567")',
            mensaje: 'Texto completo del mensaje capturado (ej: "Hola, deseo agendar...")',
          },
          contextFields: {
            workerId: 'ID de la trabajadora que ejecuta la extensión (ej: "worker_123" o id del usuario)',
            businessId: 'ID del negocio / spa (ej: "biz_456")',
          },
          optionalFields: {
            timestamp: 'Fecha ISO o Unix timestamp en ms',
            fromMe: 'true si lo envió el negocio/trabajadora, false si lo envió el cliente',
          },
          examplePayload: {
            nombre: 'Camila Torres',
            numero: '573001234567',
            mensaje: 'Hola, deseo agendar un masaje relajante para el viernes a las 3pm',
            workerId: 'worker_c7f8a9',
            businessId: 'spa_aura_01',
            fromMe: false,
          },
        },
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err?.message || 'Error getting stats' },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * DELETE /api/whatsapp/webhook
 * Clears local test storage to start fresh.
 */
export async function DELETE() {
  try {
    const clearUseCase = new ClearLocalWhatsAppUseCase(localWhatsAppRepository);
    await clearUseCase.execute();

    return NextResponse.json(
      {
        success: true,
        message: 'Almacenamiento local de WhatsApp reiniciado correctamente.',
      },
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err?.message || 'Error clearing data' },
      { status: 500, headers: corsHeaders }
    );
  }
}
