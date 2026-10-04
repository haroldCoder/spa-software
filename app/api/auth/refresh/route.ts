import { NextRequest } from 'next/server';
import { AuthController } from '@/src/modules/auth/presentation/controllers/auth.controller';

export async function POST(request: NextRequest) {
  return AuthController.refreshToken(request);
}
