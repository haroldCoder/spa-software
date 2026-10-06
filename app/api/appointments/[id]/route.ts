import { NextRequest } from 'next/server';
import { AppointmentController } from '@/src/modules/appointments/presentation/controllers/appointment.controller';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return AppointmentController.getById(id, request);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return AppointmentController.update(id, request);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return AppointmentController.update(id, request);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  return AppointmentController.delete(id, request);
}
