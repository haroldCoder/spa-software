import { NextRequest } from 'next/server';
import { BusinessController } from '@/src/modules/business/presentation/controllers/business.controller';

export async function GET(request: NextRequest) {
  return BusinessController.list(request);
}

export async function POST(request: NextRequest) {
  return BusinessController.create(request);
}
