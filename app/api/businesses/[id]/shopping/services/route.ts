import { NextRequest } from 'next/server';
import { ShoppingController } from '@/src/modules/shopping/presentation/controllers/shopping.controller';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return ShoppingController.listCompletedServices(request, id);
}
