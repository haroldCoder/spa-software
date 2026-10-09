import { NextRequest, NextResponse } from 'next/server';
import { localWhatsAppRepository } from '@/src/modules/whatsapp/infrastructure/persistence/local-file-whatsapp.repository';
import { ListLocalConversationsUseCase } from '@/src/modules/whatsapp/application/use-cases/list-local-conversations.use-case';

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get('search') || undefined;
    const businessId =
      req.nextUrl.searchParams.get('businessId') ||
      req.headers.get('x-business-id') ||
      undefined;
    const workerId =
      req.nextUrl.searchParams.get('workerId') ||
      req.headers.get('x-worker-id') ||
      undefined;

    const useCase = new ListLocalConversationsUseCase(localWhatsAppRepository);
    const conversations = await useCase.execute({
      searchQuery: search,
      businessId,
      workerId,
    });

    return NextResponse.json(
      {
        success: true,
        conversations,
        total: conversations.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[API WhatsApp Conversations] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Error listing conversations' },
      { status: 500 }
    );
  }
}
