import { NextRequest } from 'next/server';
import { SuppliesController } from '@/src/modules/supplies/presentation/controllers/supplies.controller';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return SuppliesController.getById(id, request);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return SuppliesController.update(id, request);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return SuppliesController.delete(id, request);
}
