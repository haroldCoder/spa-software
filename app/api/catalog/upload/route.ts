import { NextRequest } from 'next/server';
import { CatalogController } from '@/src/modules/catalog/presentation/controllers/catalog.controller';

export async function POST(request: NextRequest) {
  return CatalogController.uploadImage(request);
}
