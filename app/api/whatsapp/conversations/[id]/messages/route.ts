import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppMessageRepository } from '@/src/modules/whatsapp/infrastructure/whatsapp-repository.factory';
import { ListWhatsAppMessagesUseCase } from '@/src/modules/whatsapp/application/use-cases/list-whatsapp-messages.use-case';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const repo = getWhatsAppMessageRepository();
    const useCase = new ListWhatsAppMessagesUseCase(repo);
    const result = await useCase.execute({ senderPhone: id });

    // The messages for this contact (chronologically ascending)
    const matching = result.conversations.find((c) => c.id === id)?.messages ||
      result.messages.filter((m) => m.senderPhone === id);

    matching.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return NextResponse.json(
      {
        success: true,
        messages: matching,
        total: matching.length,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[API WhatsApp Messages] Error fetching:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Error fetching messages' },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    {
      success: false,
      error: 'La función de envío está deshabilitada. Los mensajes se reciben exclusivamente desde la extensión.',
    },
    { status: 405 }
  );
}
