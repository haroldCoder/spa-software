import { NextRequest } from 'next/server';
import { ClientController } from '@/src/modules/clients/presentation/controllers/client.controller';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return ClientController.listByBusiness(id, request);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  // Inject businessId into body
  try {
    const body = await request.json();
    const modifiedRequest = new NextRequest(request.url, {
      method: 'POST',
      headers: request.headers,
      body: JSON.stringify({ ...body, businessId: id }),
    });
    return ClientController.create(modifiedRequest);
  } catch (error) {
    return ClientController.create(request);
  }
}
