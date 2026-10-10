import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppMessageRepository } from '@/src/modules/whatsapp/infrastructure/whatsapp-repository.factory';
import { ListWhatsAppMessagesUseCase } from '@/src/modules/whatsapp/application/use-cases/list-whatsapp-messages.use-case';
import { authenticateRequest } from '@/src/modules/auth/presentation/middlewares/auth.guard';
import { AuthenticatedUser } from '@/src/modules/auth/domain/entities/auth-user.entity';

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams.get('search') || undefined;
    let businessId =
      req.nextUrl.searchParams.get('businessId') ||
      req.headers.get('x-business-id') ||
      undefined;
    let workerId =
      req.nextUrl.searchParams.get('workerId') ||
      req.headers.get('x-worker-id') ||
      undefined;

    // Detect authenticated session to enforce role-based scoping
    let authUser: AuthenticatedUser | null = null;
    try {
      const auth = await authenticateRequest(req, { validateSessionInDb: false });
      authUser = auth.user;
    } catch {
      // Unauthenticated
    }

    if (authUser) {
      businessId = authUser.businessId;

      if (authUser.userType === 'WORKER' || authUser.role === 'WORKER') {
        workerId = authUser.id;
      } else {
        const requestedWorkerId = req.nextUrl.searchParams.get('workerId') || req.headers.get('x-worker-id');
        workerId = requestedWorkerId ? requestedWorkerId.trim() : undefined;
      }
    }

    const repo = getWhatsAppMessageRepository();
    const useCase = new ListWhatsAppMessagesUseCase(repo);
    const result = await useCase.execute({
      searchQuery: search,
      businessId,
      workerId,
    });

    return NextResponse.json(
      {
        success: true,
        conversations: result.conversations,
        messages: result.messages,
        total: result.totalConversations,
        totalConversations: result.totalConversations,
        totalMessages: result.totalMessages,
        scopedBusinessId: businessId,
        scopedWorkerId: workerId,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[API WhatsApp Messages/Conversations] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Error listing messages' },
      { status: 500 }
    );
  }
}
