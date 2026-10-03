import { NextRequest } from 'next/server';
import { BusinessController } from '@/src/modules/business/presentation/controllers/business.controller';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return BusinessController.getById(id);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return BusinessController.update(id, request);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return BusinessController.update(id, request);
}
