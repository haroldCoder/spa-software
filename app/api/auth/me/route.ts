import { NextRequest } from 'next/server';
import { AuthController } from '@/src/modules/auth/presentation/controllers/auth.controller';

export async function GET(request: NextRequest) {
  return AuthController.me(request);
}
