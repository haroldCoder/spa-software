import { NextRequest } from 'next/server';
import { AppointmentController } from '@/src/modules/appointments/presentation/controllers/appointment.controller';

export async function POST(request: NextRequest) {
  return AppointmentController.create(request);
}

export async function GET(request: NextRequest) {
  return AppointmentController.list(request);
}
