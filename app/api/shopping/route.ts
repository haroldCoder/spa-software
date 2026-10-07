import { NextRequest } from 'next/server';
import { ShoppingController } from '@/src/modules/shopping/presentation/controllers/shopping.controller';

export async function POST(request: NextRequest) {
  return ShoppingController.create(request);
}

export async function GET(request: NextRequest) {
  return ShoppingController.list(request);
}
