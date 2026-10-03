import { NextRequest } from 'next/server';
import { ClientController } from '@/src/modules/clients/presentation/controllers/client.controller';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return ClientController.listByWorker(id, request);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return ClientController.create(request, id);
}
