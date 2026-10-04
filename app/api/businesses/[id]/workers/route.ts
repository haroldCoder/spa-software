import { NextRequest } from 'next/server';
import { WorkerController } from '@/src/modules/workers/presentation/controllers/worker.controller';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return WorkerController.listByBusiness(id, request);
}

