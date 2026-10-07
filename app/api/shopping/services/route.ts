import { NextRequest } from 'next/server';
import { ShoppingController } from '@/src/modules/shopping/presentation/controllers/shopping.controller';

export async function GET(request: NextRequest) {
  return ShoppingController.listCompletedServices(request);
}
