import { NextRequest } from 'next/server';
import { ShoppingController } from '@/src/modules/shopping/presentation/controllers/shopping.controller';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: NextRequest,
  props: RouteParams
) {
  const { id } = await props.params;
  return ShoppingController.listByBusiness(id, request);
}

export async function POST(
  request: NextRequest,
  props: RouteParams
) {
  const { id } = await props.params;
  return ShoppingController.create(request, id);
}
