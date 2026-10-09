import { NextRequest } from 'next/server';
import { SuppliesController } from '@/src/modules/supplies/presentation/controllers/supplies.controller';

export async function GET(request: NextRequest) {
  return SuppliesController.getSummary(request);
}
