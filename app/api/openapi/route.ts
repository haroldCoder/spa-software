import { NextResponse } from 'next/server';
import { swaggerSpec } from '@/src/docs/swagger-spec';

export async function GET() {
  return NextResponse.json(swaggerSpec);
}
