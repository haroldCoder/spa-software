import { NextRequest } from 'next/server';
import { SuppliesController } from '@/src/modules/supplies/presentation/controllers/supplies.controller';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return SuppliesController.listByBusiness(id, request);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return SuppliesController.create(request, id);
}
