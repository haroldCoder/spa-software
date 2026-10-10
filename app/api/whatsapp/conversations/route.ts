import { NextRequest, NextResponse } from 'next/server';
import { localWhatsAppRepository } from '@/src/modules/whatsapp/infrastructure/persistence/local-file-whatsapp.repository';
import { ListLocalConversationsUseCase } from '@/src/modules/whatsapp/application/use-cases/list-local-conversations.use-case';
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

    // Detect authenticated session to enforce role-based conversation scoping
    let authUser: AuthenticatedUser | null = null;
    try {
      const auth = await authenticateRequest(req, { validateSessionInDb: false });
      authUser = auth.user;
    } catch {
      // Unauthenticated (e.g. extension polling or direct test query)
    }

    if (authUser) {
      // 1. Enforce business isolation: the user only accesses their business conversations
      businessId = authUser.businessId;

      // 2. If the logged in user is a WORKER, restrict strictly to their own assigned chats
      if (authUser.userType === 'WORKER' || authUser.role === 'WORKER') {
        workerId = authUser.id;
      } else {
        // If BUSINESS_OWNER, allow optional worker filter or return all business conversations
        const requestedWorkerId = req.nextUrl.searchParams.get('workerId') || req.headers.get('x-worker-id');
        workerId = requestedWorkerId ? requestedWorkerId.trim() : undefined;
      }
    }

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
        scopedBusinessId: businessId,
        scopedWorkerId: workerId,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error('[API WhatsApp Conversations] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Error listing conversations' },
      { status: 500 }
    );
  }
}
