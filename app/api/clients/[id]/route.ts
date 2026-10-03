import { NextRequest } from 'next/server';
import { ClientController } from '@/src/modules/clients/presentation/controllers/client.controller';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return ClientController.getById(id);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return ClientController.update(id, request);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return ClientController.update(id, request);
}
