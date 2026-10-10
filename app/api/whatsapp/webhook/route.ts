import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppMessageRepository } from '@/src/modules/whatsapp/infrastructure/whatsapp-repository.factory';
import { SupabaseWhatsAppMessageRepository } from '@/src/modules/whatsapp/infrastructure/repositories/supabase-whatsapp-message.repository';
import { SaveWhatsAppMessagesUseCase } from '@/src/modules/whatsapp/application/use-cases/save-whatsapp-messages.use-case';
import { ClearWhatsAppMessagesUseCase } from '@/src/modules/whatsapp/application/use-cases/clear-whatsapp-messages.use-case';

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
 * Receives messages captured by the browser extension in WhatsApp Web.
 * Persists directly into whatsapp_messages.
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

    const repo = getWhatsAppMessageRepository();
    const useCase = new SaveWhatsAppMessagesUseCase(repo);
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
    console.error('[API WhatsApp Webhook] Error processing incoming messages:', err);
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
 * Health check & stats for browser extension.
 */
export async function GET() {
  try {
    const repo = getWhatsAppMessageRepository();
    const stats = await repo.getStats();
    const isDb = repo instanceof SupabaseWhatsAppMessageRepository;

    return NextResponse.json(
      {
        status: 'online',
        mode: isDb ? 'database' : 'file_storage',
        storageTable: 'whatsapp_messages',
        stats,
        payloadDocumentation: {
          description: 'Envía peticiones POST con JSON al webhook con los siguientes campos:',
          requiredFields: {
            nombre: 'Nombre del contacto o remitente (ej: "Camila Torres")',
            numero: 'Número de WhatsApp con indicativo o sin él (ej: "573001234567")',
            mensaje: 'Texto completo del mensaje capturado',
          },
          contextFields: {
            workerId: 'ID de la trabajadora (ej: UUID de la trabajadora)',
            businessId: 'ID del spa / negocio (ej: UUID del negocio)',
          },
          optionalFields: {
            timestamp: 'Fecha ISO o Unix timestamp en ms',
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
 * Clears messages storage.
 */
export async function DELETE() {
  try {
    const repo = getWhatsAppMessageRepository();
    const clearUseCase = new ClearWhatsAppMessagesUseCase(repo);
    await clearUseCase.execute();

    return NextResponse.json(
      {
        success: true,
        message: 'Mensajes de WhatsApp reiniciados correctamente.',
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
