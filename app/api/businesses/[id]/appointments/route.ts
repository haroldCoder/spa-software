import { NextRequest } from 'next/server';
import { AppointmentController } from '@/src/modules/appointments/presentation/controllers/appointment.controller';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return AppointmentController.listByBusiness(id, request);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return AppointmentController.create(request, id);
}
