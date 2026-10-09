import { NextRequest, NextResponse } from 'next/server';
import { localWhatsAppRepository } from '@/src/modules/whatsapp/infrastructure/persistence/local-file-whatsapp.repository';
import { GetLocalConversationMessagesUseCase } from '@/src/modules/whatsapp/application/use-cases/get-local-conversation-messages.use-case';
import { SendLocalReplyUseCase } from '@/src/modules/whatsapp/application/use-cases/send-local-reply.use-case';

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const useCase = new GetLocalConversationMessagesUseCase(localWhatsAppRepository);
    const messages = await useCase.execute(id);

    return NextResponse.json(
      {
        success: true,
        messages,
        total: messages.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API WhatsApp Messages] Error fetching:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error fetching messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    if (!body?.content?.trim()) {
      return NextResponse.json(
        { success: false, error: 'El contenido del mensaje no puede estar vacío.' },
        { status: 400 }
      );
    }

    const useCase = new SendLocalReplyUseCase(localWhatsAppRepository);
    const message = await useCase.execute({
      conversationId: id,
      content: body.content.trim(),
      senderName: body.senderName || 'AuraSpa',
    });

    return NextResponse.json(
      {
        success: true,
        message,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('[API WhatsApp Messages] Error sending:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error sending message' },
      { status: 500 }
    );
  }
}
