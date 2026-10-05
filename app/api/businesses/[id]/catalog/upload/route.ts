import { NextRequest } from 'next/server';
import { CatalogController } from '@/src/modules/catalog/presentation/controllers/catalog.controller';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return CatalogController.uploadImage(request, id);
}
