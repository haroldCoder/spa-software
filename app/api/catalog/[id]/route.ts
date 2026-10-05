import { NextRequest } from 'next/server';
import { CatalogController } from '@/src/modules/catalog/presentation/controllers/catalog.controller';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return CatalogController.getById(id, request);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return CatalogController.update(id, request);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return CatalogController.update(id, request);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return CatalogController.delete(id, request);
}
