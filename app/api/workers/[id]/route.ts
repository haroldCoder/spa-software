import { NextRequest } from 'next/server';
import { WorkerController } from '@/src/modules/workers/presentation/controllers/worker.controller';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return WorkerController.getById(id);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return WorkerController.update(id, request);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return WorkerController.update(id, request);
}
